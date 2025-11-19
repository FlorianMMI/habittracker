"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import Link from "next/link";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic client-side validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setError(null);
        // Don't redirect automatically - user needs to verify email
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json?.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-xl shadow-sm p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-chart-1 rounded-full mb-4">
              <svg className="w-8 h-8 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Vérifiez votre email
            </h2>
            <p className="text-muted-foreground mb-6">
              Un email de vérification a été envoyé à <strong>{email}</strong>.
              Veuillez cliquer sur le lien dans l'email pour activer votre compte.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                💡 Vous ne voyez pas l'email ? Vérifiez votre dossier spam ou courrier indésirable.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Créer un compte
          </h1>
          <p className="text-muted-foreground">
            Rejoignez HabitTracker et commencez votre parcours
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="Prénom"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
              
              <Input
                id="lastName"
                label="Nom"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>

            <Input
              id="email"
              label="Adresse email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
            />

            <Input
              id="password"
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
            />

            <Input
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retapez votre mot de passe"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </Button>

            {error && (
              <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link 
              href="/login" 
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}