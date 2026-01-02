import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"PPDB Online" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verifikasi Email Pendaftaran PPDB",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0f172a; text-align: center;">Verifikasi Email Anda</h2>
                <p style="color: #475569; font-size: 16px;">Halo,</p>
                <p style="color: #475569; font-size: 16px;">Terima kasih telah mendaftar di PPDB Online. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verifikasi Email Saya</a>
                </div>
                <p style="color: #475569; font-size: 14px;">Atau salin tautan berikut ke browser Anda:</p>
                <p style="color: #64748b; font-size: 14px; word-break: break-all;">${verificationLink}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Jika Anda tidak merasa mendaftar, silakan abaikan email ini.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to " + email);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    const mailOptions = {
        from: `"PPDB Online" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset Password Akun PPDB Online",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0f172a; text-align: center;">Reset Password Anda</h2>
                <p style="color: #475569; font-size: 16px;">Halo,</p>
                <p style="color: #475569; font-size: 16px;">Anda telah meminta untuk mereset password akun PPDB Online Anda. Silakan klik tombol di bawah ini untuk mengatur password baru.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
                </div>
                <p style="color: #475569; font-size: 14px;">Tautan ini akan kedaluwarsa dalam 1 jam.</p>
                <p style="color: #475569; font-size: 14px;">Jika Anda tidak merasa meminta reset password, silakan abaikan email ini.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Tim IT PPDB Online</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent to " + email);
        return true;
    } catch (error) {
        console.error("Error sending reset email:", error);
        return false;
    }
};
