import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/index.js";

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    // 2. Define email options
    const mailOptions = {
        from: `GroCart <${EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
