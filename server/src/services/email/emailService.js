import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const capturedEmails = [];

let transporter = null;

if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

export class EmailService {
  /**
   * Sends an invitation activation email to a learner
   */
  static async sendInvitationEmail({ to, invitationLink, roadmapTitle, senderName }) {
    const subject = `You've been invited to study: "${roadmapTitle}"`;
    const text = `Hello,\n\n${senderName || 'An administrator'} has assigned you a personalized learning roadmap: "${roadmapTitle}".\n\nClick the link below to activate your account and start learning:\n${invitationLink}\n\nThis invitation link expires in 7 days.\n\nHappy learning!`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b; margin-top: 0;">Personalized Learning Roadmap Invitation</h2>
        <p style="color: #475569; font-size: 16px;">Hello,</p>
        <p style="color: #475569; font-size: 16px;">
          <strong>${senderName || 'Your instructor'}</strong> has assigned you the roadmap: <strong>${roadmapTitle}</strong>.
        </p>
        <div style="margin: 32px 0;">
          <a href="${invitationLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Accept Invitation &amp; Start Learning &rarr;
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser:<br/><a href="${invitationLink}" style="color: #3b82f6;">${invitationLink}</a></p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          This single-use link expires in 7 days. If you did not expect this invitation, you can ignore this email.
        </p>
      </div>
    `;

    return this.sendMail({ to, subject, text, html });
  }

  /**
   * Sends a password reset email
   */
  static async sendPasswordResetEmail({ to, resetLink }) {
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Click this link to set a new password:\n${resetLink}\nThis link expires in 1 hour.`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Click the link below to set a new password for your account:</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:white;text-decoration:none;border-radius:4px;">Reset Password</a></p>
        <p style="color:#666;font-size:12px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `;

    return this.sendMail({ to, subject, text, html });
  }

  /**
   * Sends a magic login link to a user's email
   */
  static async sendLoginLinkEmail({ to, loginLink, name, role }) {
    const roleLabel = role === 'admin' ? 'Admin Studio' : 'Learner Dashboard';
    const subject = `Your Pathfinder Magic Sign-In Link [${roleLabel}]`;
    const text = `Hello ${name || 'there'},\n\nClick the link below to securely log in to your Pathfinder ${roleLabel}:\n${loginLink}\n\nThis login link expires in 15 minutes.\n\nHappy learning!`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Sign In to Pathfinder</h2>
        <p style="color: #475569; font-size: 15px;">Hello <strong>${name || 'there'}</strong>,</p>
        <p style="color: #475569; font-size: 15px;">
          Click the button below to sign in directly to your <strong>${roleLabel}</strong>:
        </p>
        <div style="margin: 28px 0;">
          <a href="${loginLink}" style="background-color: #f59e0b; color: #0f172a; padding: 13px 26px; text-decoration: none; border-radius: 9999px; font-weight: 700; font-size: 14px; display: inline-block;">
            Sign In to ${roleLabel} &rarr;
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Or copy and paste this link in your browser:<br/><a href="${loginLink}" style="color: #d97706; word-break: break-all;">${loginLink}</a></p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          This single-use link expires in 15 minutes. If you did not request this link, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.sendMail({ to, subject, text, html });
  }

  static async sendMail({ to, subject, text, html }) {
    const emailRecord = {
      to,
      from: env.EMAIL_FROM,
      subject,
      text,
      html,
      sentAt: new Date()
    };

    capturedEmails.unshift(emailRecord);
    if (capturedEmails.length > 50) capturedEmails.pop();

    if (transporter) {
      try {
        await transporter.sendMail(emailRecord);
        console.log(`✉️ Email sent via SMTP to: ${to} [${subject}]`);
      } catch (err) {
        console.error('SMTP email dispatch error:', err.message);
      }
    } else {
      console.log(`📨 [DEV EMAIL CAPTURED] To: ${to} | Subject: "${subject}"`);
      if (text.includes('http')) {
        const linkMatch = text.match(/https?:\/\/[^\s]+/);
        if (linkMatch) {
          console.log(`🔗 Action Link: ${linkMatch[0]}`);
        }
      }
    }

    return emailRecord;
  }

  static getCapturedEmails() {
    return [...capturedEmails];
  }
}
