import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST as string,
    port: parseInt(process.env.SMTP_PORT as string, 10), // Ensure the port is a number
    secure: false, // Use STARTTLS
    tls: {
        rejectUnauthorized: false, // Optional: disable certificate validation for testing
    },
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD, // App Password
    },
} as SMTPTransport.Options); // Explicitly type the configuration

export const sendEmail = async ({to, subject, html, ...rest}: Mail.Options) => {
    const options: Mail.Options = {
        from: 'no-reply <teacheducjohn@gmail.com>',
        to: to,
        subject: subject,
        html: html,
        ...rest
    };

    try {
        await transporter.sendMail(options)
    } catch (error) {
        console.log(error)
    }
}