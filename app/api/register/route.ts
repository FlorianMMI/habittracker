import { NextResponse } from "next/server";
import { createUser, setUserVerificationToken } from "@/lib/users";
import { sendValidationEmail, generateValidationToken } from "../emailservice/emailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body ?? {};

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Create user with hashed password
    const user = await createUser({ firstName, lastName, email, password });

    // Générer un token de vérification et le stocker (valide 24h)
    const token = generateValidationToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await setUserVerificationToken(user.id, token, expires);

    // Envoyer email de validation (ne bloque pas la création si l'envoi échoue)
    try {
      await sendValidationEmail({ to: email, token, name: firstName });
    } catch (emailErr) {
      console.error("Envoi email de validation échoué:", emailErr);
    }

    return NextResponse.json(
      {
        message: "Utilisateur créé avec succès. Un email de validation a été envoyé.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.message === "Email already exists") {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
