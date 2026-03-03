const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testEmail = async () => {
    console.log('Testing Email with User:', process.env.EMAIL_USER);
    console.log('Using Pass:', process.env.EMAIL_PASS ? '********' : 'MISSING');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Email Test" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to self
        subject: 'Ankese Birhan - SMTP Connectivity Test',
        text: 'If you receive this, your SMTP configuration is working correctly!',
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        process.exit(0);
    } catch (error) {
        console.error('Email sending failed!');
        console.error('Error:', error);
        process.exit(1);
    }
};

testEmail();
