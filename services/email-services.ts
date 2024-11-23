import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: 'teacheducjohn@gmail.com',
        pass: 'didnhqcgyzwgnler', // App Password
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export const sendEmail = async ({to, subject, html}: Mail.Options) => {
    const options: Mail.Options = {
        from: 'no reply <teacheducjohn@gmail.com>',
        to: to,
        subject: subject,
        html: html
    }
    try {
        await transporter.sendMail(options)
    } catch (error) {
        console.log(error)
    }
}