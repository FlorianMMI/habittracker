import nodemailer from "nodemailer";
import { randomBytes } from "crypto";


function createEmailTransporter(){
    return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    },
    debug: true,   // Active le mode debug
    logger: true   // Active les logs SMTP
  });
}


export function generateValidationToken() {
    return randomBytes(32).toString("hex");
}

/**
 * Envoie un email de validation (FR).
 * @param {{ to: string, token: string, name?: string }} params
 * @returns {Promise<any>}
 */
export async function sendValidationEmail({ to, token, name = "" }) {
    const transporter = createEmailTransporter();

    const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_URL ||
        "http://localhost:3000";

    const verificationUrl = `${baseUrl.replace(/\/+$/, "")}/auth/verify-email?token=${encodeURIComponent(
        token
    )}&email=${encodeURIComponent(to)}`;

    const subject = "HabitTracker — Vérification de votre adresse e‑mail";
    const text = `Bonjour ${name || "utilisateur"},\n\nMerci d'avoir créé un compte sur HabitTracker.\nVeuillez vérifier votre adresse e-mail en cliquant sur le lien suivant : ${verificationUrl}\n\nSi vous n'avez pas demandé cet e-mail, ignorez-le.\n\nL'équipe HabitTracker`;
    const html = `<div style="font-family:system-ui, -apple-system, 'Helvetica Neue', Arial; color:#222">
        <h2>Bonjour ${name || "utilisateur"},</h2>
        <p>Bienvenue sur <strong>HabitTracker</strong>. Pour finaliser votre inscription, confirmez votre adresse e‑mail :</p>
        <p><a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#CC6821;color:#fff;border-radius:6px;text-decoration:none">Vérifier mon e‑mail</a></p>
        <p style="font-size:12px;color:#666">Ou copiez-collez ce lien dans votre navigateur :<br/><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Si vous n'avez pas demandé cet e‑mail, ignorez-le.</p>
        <p>— L'équipe HabitTracker</p>
    </div>`;

    const mailOptions = {
        from: `"HabitTracker" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("Erreur envoi email de validation:", error);
        throw error;
    }
}

export default sendValidationEmail;