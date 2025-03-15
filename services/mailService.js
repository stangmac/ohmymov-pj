const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, otp) => {
    try {
        const message = `
        Hello, 
        
        You have requested to reset your password. Your OTP code is:
        
        🔐 ${otp}
        
        This OTP is valid for 10 minutes.
        
        If you did not request this, please ignore this email.

        Regards, 
        Your Support Team
        `;

        console.log(`Sending email to: ${to} | Message: ${message}`);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: "Password Reset OTP Code",
            text: message
        });

        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendEmail;
