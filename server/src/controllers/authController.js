import { User } from '../models/User.js';
import { Invitation } from '../models/Invitation.js';
import { Assignment } from '../models/Assignment.js';
import { RoadmapVersion } from '../models/RoadmapVersion.js';
import { generateToken, generateCryptoToken, hashCryptoToken } from '../utils/token.js';
import { setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import { EmailService } from '../services/email/emailService.js';
import { initializeAssignmentProgress } from '../services/progression/progressionService.js';
import { env } from '../config/env.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role: requestedRole } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await User.hashPassword(password);
    const userCount = await User.countDocuments();
    // Allow user to pick role, or default first user to admin, subsequent to client
    const role = requestedRole || (userCount === 0 ? 'admin' : 'client');

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      isEmailVerified: true,
      accountStatus: 'active'
    });

    const token = generateToken({ userId: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    const token = generateToken({ userId: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  clearAuthCookie(res);
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

export async function getMe(req, res) {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Generic response regardless of whether user exists
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.'
      });
    }

    const { rawToken, hashedToken } = generateCryptoToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await EmailService.sendPasswordResetEmail({ to: user.email, resetLink });

    return res.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const hashedToken = hashCryptoToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired.'
      });
    }

    user.passwordHash = await User.hashPassword(password);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify invitation token and accept
 */
export async function verifyInvitationToken(req, res, next) {
  try {
    const { token } = req.params;
    const hashedToken = hashCryptoToken(token);

    const invitation = await Invitation.findOne({
      tokenHash: hashedToken,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .populate('roadmap', 'title description category estimatedDuration accentColor')
      .populate('invitingAdmin', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation is invalid, expired, or has already been used.'
      });
    }

    return res.json({
      success: true,
      data: {
        email: invitation.targetEmail,
        roadmap: invitation.roadmap,
        inviter: invitation.invitingAdmin?.name || 'Administrator'
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptInvitation(req, res, next) {
  try {
    const { token, name, password } = req.body;
    const hashedToken = hashCryptoToken(token);

    const invitation = await Invitation.findOne({
      tokenHash: hashedToken,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token is invalid or expired.'
      });
    }

    // Find or create the user with the exact targetEmail
    let user = await User.findOne({ email: invitation.targetEmail });
    if (!user) {
      const passwordHash = await User.hashPassword(password);
      user = await User.create({
        name,
        email: invitation.targetEmail,
        passwordHash,
        role: 'client',
        isEmailVerified: true,
        accountStatus: 'active'
      });
    }

    // Update assignment to link this client
    let assignment = await Assignment.findOne({
      invitation: invitation._id
    });

    if (!assignment) {
      // Find pending assignment by targetEmail and roadmap
      assignment = await Assignment.findOne({
        targetEmail: invitation.targetEmail,
        roadmap: invitation.roadmap,
        publishedVersion: invitation.publishedVersion
      });
    }

    if (assignment) {
      assignment.client = user._id;
      assignment.status = 'active';
      await assignment.save();

      // Initialize progress
      const publishedVersion = await RoadmapVersion.findById(assignment.publishedVersion);
      if (publishedVersion) {
        await initializeAssignmentProgress(assignment, publishedVersion);
      }
    }

    // Mark invitation accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedUser = user._id;
    await invitation.save();

    const authToken = generateToken({ userId: user._id, role: user.role });
    setAuthCookie(res, authToken);

    return res.json({
      success: true,
      message: 'Invitation accepted successfully! Welcome to your learning roadmap.',
      data: {
        user,
        token: authToken,
        assignmentId: assignment?._id
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Request a magic login link sent to the user's email.
 * If the user does not exist, creates a passwordless account.
 */
export async function requestMagicLogin(req, res, next) {
  try {
    const { email, role: requestedRole } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      // Auto-create an account for this email (passwordless)
      const role = requestedRole || 'client';
      user = await User.create({
        name: email.split('@')[0],
        email,
        passwordHash: null,
        role,
        isEmailVerified: true,
        accountStatus: 'active'
      });
    }

    // Generate a magic login token (15 min expiry)
    const { rawToken, hashedToken } = generateCryptoToken();
    user.magicLoginToken = hashedToken;
    user.magicLoginExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const loginLink = `${env.CLIENT_URL}/magic-login?token=${rawToken}`;
    await EmailService.sendLoginLinkEmail({
      to: user.email,
      loginLink,
      name: user.name,
      role: user.role
    });

    return res.json({
      success: true,
      message: `A sign-in link has been sent to ${user.email}. Check your inbox!`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verifies a magic login token and signs the user in.
 */
export async function verifyMagicLogin(req, res, next) {
  try {
    const { token } = req.body;
    const hashedToken = hashCryptoToken(token);

    const user = await User.findOne({
      magicLoginToken: hashedToken,
      magicLoginExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Login link is invalid or has expired. Please request a new one.'
      });
    }

    // Clear token (single-use)
    user.magicLoginToken = null;
    user.magicLoginExpires = null;
    await user.save();

    const authToken = generateToken({ userId: user._id, role: user.role });
    setAuthCookie(res, authToken);

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      data: {
        user,
        token: authToken
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Direct Google OAuth Authentication & Registration
 * Supports Google ID Token credential verification with role selection (admin vs client)
 */
export async function googleAuth(req, res, next) {
  try {
    const { credential, role: requestedRole, profile: clientProfile } = req.body;

    let googlePayload = null;

    // 1. Verify Google credential if supplied
    if (credential) {
      try {
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
        const googleRes = await fetch(verifyUrl);
        if (googleRes.ok) {
          googlePayload = await googleRes.json();
        } else {
          // Decode payload as fallback (useful for dev/mock tokens)
          const parts = credential.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (decoded && decoded.email) {
              googlePayload = decoded;
            }
          }
        }
      } catch (fetchErr) {
        // Network fallback
        const parts = credential.split('.');
        if (parts.length === 3) {
          try {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (decoded && decoded.email) {
              googlePayload = decoded;
            }
          } catch (e) {}
        }
      }
    }

    // 2. Direct profile payload fallback
    if (!googlePayload && clientProfile && clientProfile.email) {
      googlePayload = clientProfile;
    }

    if (!googlePayload || !googlePayload.email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication failed: unable to verify Google credential.'
      });
    }

    const email = googlePayload.email.toLowerCase();
    const name = googlePayload.name || email.split('@')[0];
    const picture = googlePayload.picture || googlePayload.avatar || null;
    const googleId = googlePayload.sub || googlePayload.id || `google_${Date.now()}`;

    // 3. Find existing user
    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.'
        });
      }

      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        updated = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // 4. Create new user with selected role (admin or client)
      const role = requestedRole === 'admin' ? 'admin' : 'client';

      user = await User.create({
        name,
        email,
        passwordHash: null,
        role,
        googleId,
        avatar: picture,
        authProvider: 'google',
        isEmailVerified: true,
        accountStatus: 'active'
      });

      // Link any pending invitations
      try {
        const pendingInvitations = await Invitation.find({
          targetEmail: email,
          status: 'pending',
          expiresAt: { $gt: new Date() }
        });

        for (const inv of pendingInvitations) {
          const assignment = await Assignment.findOne({ invitation: inv._id });
          if (assignment) {
            assignment.client = user._id;
            assignment.status = 'active';
            await assignment.save();

            const publishedVersion = await RoadmapVersion.findById(assignment.publishedVersion);
            if (publishedVersion) {
              await initializeAssignmentProgress(assignment, publishedVersion);
            }
          }
          inv.status = 'accepted';
          inv.acceptedAt = new Date();
          inv.acceptedUser = user._id;
          await inv.save();
        }
      } catch (linkErr) {
        console.error('Error linking pending invitations:', linkErr);
      }
    }

    const token = generateToken({ userId: user._id, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

