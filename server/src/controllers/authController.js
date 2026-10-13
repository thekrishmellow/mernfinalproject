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
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await User.hashPassword(password);
    // If no admin exists yet, make this user admin
    const totalUsers = await User.countDocuments();
    const role = totalUsers === 0 ? 'admin' : 'client';

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
