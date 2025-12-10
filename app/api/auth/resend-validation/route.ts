import { NextResponse } from "next/server";
import { getUserByEmail, setUserVerificationToken } from "@/lib/users";
import { generateValidationToken, sendValidationEmail } from "../../emailservice/emailService";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (user.isValidated) {
      return NextResponse.json(
        { error: "Email déjà validé" },
        { status: 400 }
      );
    }

    // Générer un nouveau token
    const token = generateValidationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token valide 24h

    // Enregistrer le token
    await setUserVerificationToken(user.id, token, expiresAt);

    // Envoyer l'email
    await sendValidationEmail({
      to: user.email,
      token,
      name: user.firstName,
    });

    return NextResponse.json(
      { message: "Email de validation envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de validation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
