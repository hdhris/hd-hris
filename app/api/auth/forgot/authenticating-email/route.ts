import {NextRequest, NextResponse} from "next/server";
import {hasContentType} from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import {sendEmail} from "@/services/email-services";
import { cookies } from 'next/headers'
import SimpleAES from "@/lib/cryptography/3des";
import {getRandomInt} from "@/lib/utils/numberFormat";

export async function POST(request: NextRequest) {
    try {
        hasContentType(request)
        const body = await request.json()
        const email = await prisma.trans_users.findUnique({
            where: {
                email: body.email
            },
            select: {
                email: true,
                id: true
            }
        });

        const hasCredential = await prisma.auth_credentials.findUnique({
            where: {
                user_id: email?.id
            }
        });

        if (!hasCredential) {
            return NextResponse.json({
                success: false,
                message: "No credentials found for the specified user."
            }, {status: 404});
        }


        const generateOTP = getRandomInt(100000, 999999).toString()
        if (email) {
            await sendEmail({
                to: email?.email!, subject: "Forgot Password", html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
<table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
        <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                        <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Your One-Time Password</h1>
                        <p style="color: #666666; font-size: 16px; margin-bottom: 30px;">Use the following OTP to complete your action:</p>
                        <div style="background-color: #f0f0f0; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #333333;">${generateOTP}</span>
                        </div>
                        <p style="color: #666666; font-size: 14px; margin-bottom: 0;">This OTP will expire in 2 minutes.</p>
                        <p style="color: #666666; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="color: #999999; font-size: 12px; margin: 0;">This is an automated message, please do not reply.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>`
            })
            const encrypt = new SimpleAES()

            const user_info = {
                id: email.id,
                email: email.email
            }
            const encrypt_user = await encrypt.encryptData(JSON.stringify(user_info))
            const cookieStore = cookies()
            cookieStore.set('user', encrypt_user)
            cookieStore.set('otp', JSON.stringify({ value: await encrypt.encryptData(generateOTP), expires: Date.now() + 2 * 60 * 1000 }))
            return NextResponse.json({
                success: true, message: "Email found"
            })
        }

        return NextResponse.json({
            success: false, message: "Email not found"
        }, {status: 404})


    } catch (error) {
        console.log("Error: ", error)
        return NextResponse.json({
            success: false, message: "Something went wrong. Please try again."
        }, {status: 500})
    }
}