"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";

type Habit = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  createdAt: string;
};

export default function HabitsPage() {
  // For now we use a hardcoded userId to demo functionality.
  const userId = "user_demo_1";

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [error, setError] = useState<string | null>(null);

  async function fetchHabits() {
    setLoading(true);
    try {
      const res = await fetch(`/api/habits?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (res.ok) setHabits(data.habits || []);
      else setError(data.error || "Erreur lors de la récupération");
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError("Le nom doit contenir au moins 3 caractères");
      return;
    }

    try {
      const res = await fetch(`/api/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, description, frequency }),
      });
      const data = await res.json();
      if (res.ok) {
        setHabits((prev) => [data.habit, ...prev]);
        setName("");
        setDescription("");
        setFrequency("daily");
      } else {
        setError(data.error || "Erreur lors de la création");
      }
    } catch (err) {
      setError("Erreur réseau");
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Mes habitudes</h1>

      <form onSubmit={handleCreate} className="space-y-4 mb-6">
        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Boire de l'eau" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel" />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Fréquence</label>
          <div className="flex gap-3">
            <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${frequency === 'daily' ? 'bg-primary/10 border-primary' : 'border-border'}`}>
              <input type="radio" name="frequency" value="daily" checked={frequency === 'daily'} onChange={() => setFrequency('daily')} />
              Quotidienne
            </label>
            <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${frequency === 'weekly' ? 'bg-primary/10 border-primary' : 'border-border'}`}>
              <input type="radio" name="frequency" value="weekly" checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} />
              Hebdomadaire
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div>
          <Button type="submit">Créer l'habitude</Button>
        </div>
      </form>

      <section>
        <h2 className="text-xl font-semibold mb-3">Liste</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : habits.length === 0 ? (
          <p>Aucune habitude pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {habits.map((h) => (
              <div key={h.id} className="p-4 bg-card border border-border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{h.name}</h3>
                    {h.description && <p className="text-sm text-muted-foreground">{h.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{h.frequency} • créé le {new Date(h.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
