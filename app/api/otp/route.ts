import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Simple in-memory store for OTPs (you can use a DB instead)
const otps = new Map<string, { otp: string; expiresAt: number }>();

// Generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// Send OTP email
async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // You can use other services or configure SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP for registration is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Generate and store OTP
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute expiration
  otps.set(email, { otp, expiresAt });

  // Send the OTP via email
  try {
    await sendOtpEmail(email, otp);
    return NextResponse.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
