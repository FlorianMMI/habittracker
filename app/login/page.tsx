"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Vérifier si on revient de la vérification d'email
    const verified = searchParams.get("verified");
    if (verified === "1") {
      setSuccessMessage("✅ Votre email a été validé avec succès ! Vous pouvez maintenant vous connecter.");
    } else if (verified === "0") {
      setError("❌ Le lien de validation est invalide ou a expiré.");
    }
  }, [searchParams]);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setShowResendButton(false);

    if (!email.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      // D'abord, vérifier le statut de validation
      const checkResponse = await fetch("/api/auth/check-validation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const checkData = await checkResponse.json();

      if (checkResponse.status === 403 && checkData.error === "EMAIL_NOT_VALIDATED") {
        setError("📧 Votre email n'est pas encore validé. Un email de validation vient de vous être envoyé.");
        setShowResendButton(true);
        setLoading(false);
        return;
      }

      if (!checkResponse.ok) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }

      // Si la validation est OK, procéder à la connexion NextAuth
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendEmail() {
    setResendLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/resend-validation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccessMessage("✅ Un nouvel email de validation a été envoyé à votre adresse.");
        setShowResendButton(false);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'envoi de l'email.");
      }
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            HabitTracker
          </h1>
          <p className="text-muted-foreground">
            Suivez vos habitudes et atteignez vos objectifs
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="mb-4 font-semibold"> Connexion </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
            />

            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            {successMessage && (
              <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {showResendButton && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleResendEmail}
                loading={resendLoading}
                className="w-full"
              >
                {resendLoading ? "Envoi..." : "Renvoyer l'email de validation"}
              </Button>
            )}
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link 
              href="/register" 
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              S'inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
