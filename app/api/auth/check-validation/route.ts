import { NextResponse } from "next/server";
import { getUserByEmail, setUserVerificationToken } from "@/lib/users";
import { generateValidationToken, sendValidationEmail } from "../../emailservice/emailService";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Error" },
        { status: 500 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Error" },
        { status: 500 }
      );
    }

    // Vérifier si l'email est validé
    if (!user.isValidated) {
      // Générer un nouveau token de validation
      const token = generateValidationToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Token valide 24h

      // Enregistrer le token
      await setUserVerificationToken(user.id, token, expiresAt);

      // Envoyer l'email de validation
      try {
        await sendValidationEmail({
          to: user.email,
          token,
          name: user.firstName,
        });
      } catch (emailError) {
        console.error("Erreur envoi email:", emailError);
        // Continue même si l'email échoue
      }

      return NextResponse.json(
        { error: "EMAIL_NOT_VALIDATED", email: user.email },
        { status: 403 }
      );
    }

    // Tout est OK, l'utilisateur peut se connecter
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur check-validation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
