// lib/utils/sendEmail.ts
import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Keep this false for port 587
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

export async function sendEmail({ to, subject, text }: EmailPayload) {
  try {
    // Log configuration (excluding sensitive data)
    // console.log('Attempting to send email with config:', {
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   from: process.env.MAIL_FROM,
    //   to: to,
    //   subject: subject
    // });

    // Verify connection configuration
    await transporter.verify();
    // console.log('SMTP connection verified successfully');

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // console.error('Error details:', error);
    throw error;
  }
}