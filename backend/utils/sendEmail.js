const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Ankese Birhan" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.text || options.message.replace(/<[^>]*>?/gm, ''),
            html: options.message,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Message sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL] Detailed Error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            stack: error.stack
        });
        throw error;
    }
};

module.exports = sendEmail;
