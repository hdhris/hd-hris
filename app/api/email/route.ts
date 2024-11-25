import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import Mail from 'nodemailer/lib/mailer';
import {sendEmail} from "@/services/email-services";

export async function GET() {
    try {
                // const info = await transporter.sendMail(options);

        await sendEmail({to: 'xerojohn7@gmail.com', subject: 'hello world', html: '<h1>Testing</h1>'})
        return NextResponse.json(
            { message: 'Email sent successfully' },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { message: 'Internal Server Error: ' + err },
            { status: 500 }
        );
    }
}
