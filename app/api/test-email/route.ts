import { NextResponse } from "next/server";
import {sendEmail} from "@/services/email-services";
// import { sendEmail } from "@/lib/utils/sendEmail";

export async function GET(request: Request) {
  try {
    // Log full config for debugging (excluding password)
    // console.log("Testing email with configuration:", {
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   username: process.env.SMTP_USERNAME,
    //   from: process.env.MAIL_FROM,
    // });

    const result = await sendEmail({
      to: "xerojohn7@gmail.com",
      subject: "Test Email from HR System",
      text: `
        This is a test email from your HR system.
        Time sent: ${new Date().toLocaleString()}
        
        If you received this email, your email configuration is working correctly.
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      // messageId: result.messageId,
    });
  } catch (error) {
    console.error("Full error details:", error);

    // More detailed error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack:
                  process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
