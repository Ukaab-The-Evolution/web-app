// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a test account if in development mode
const createEtherealTestAccount = async () => {
  if (process.env.NODE_ENV === 'development') {
    return await nodemailer.createTestAccount();
  }
  return null;
};

const testAccount = await createEtherealTestAccount();

// Configure transporter based on environment
const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === 'production'
    ? {
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      }
    : {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount?.user || process.env.ETHEREAL_USER,
          pass: testAccount?.pass || process.env.ETHEREAL_PASS
        }
      }
);

export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Ukaab Auth" <no-reply@ukaab.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click here: ${resetLink}`,
      html: `
        <div>
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password (valid for 15 minutes):</p>
          <a href="${resetLink}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    // Only log in development for Ethereal
    if (process.env.NODE_ENV === 'development') {
      console.log('Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send password reset email');
  }
};