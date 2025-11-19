"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { useToast } from "@/app/providers/ToastProvider";

export default function HabitForm({ userId, onCreated, onCancel, habit }: { userId: string; onCreated?: () => void; onCancel: () => void; habit?: { id: string; name: string; description?: string; frequency: "daily" | "weekly" } }) {
  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [frequency, setFrequency] = useState<"daily" | "weekly">(habit?.frequency ?? "daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  

  const isEditing = Boolean(habit && habit.id);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError("Le nom doit contenir au moins 3 caractères");
      return;
    }
    setLoading(true);
    try {
      // If habit prop is present, we perform an update (PUT)
      let res: Response;
      if (habit && habit.id) {
        res = await fetch(`/api/habits`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: habit.id, userId, name, description, frequency }),
        });
      } else {
        res = await fetch(`/api/habits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name, description, frequency }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        // Show success toast
        if (habit && habit.id) {
          showToast("Habitude modifiée avec succès !", "success");
        } else {
          showToast("Habitude créée avec succès !", "success");
        }
        
        // reset only for create
        if (!habit) {
          setName("");
          setDescription("");
          setFrequency("daily");
        }
        if (onCreated) onCreated();
        onCancel();
      } else {
        setError(data.error || "Erreur lors de la requete");
        showToast(data.error || "Erreur lors de la requete", "error");
      }
    } catch (err) {
      setError("Erreur réseau");
      showToast("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (isEditing) {
      router.push("/dashboard");
    } else {
      onCancel();
    }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-4 p-4 bg-white">
      <Input  value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Boire de l'eau" />
      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel" />

      <div>

        <div className="flex justify-between w-full">
          <label className={`inline-flex bg-muted items-center gap-2 px-3 py-1.5 rounded-lg border ${frequency === 'daily' ? ' border-primary' : 'border-border'}`}>
            <input type="radio" name="frequency" value="daily" checked={frequency === 'daily'} onChange={() => setFrequency('daily')} />
            Quotidienne
          </label>
          <label className={`inline-flex bg-muted items-center gap-2 px-3 py-1.5 rounded-lg border ${frequency === 'weekly' ? ' border-primary' : 'border-border'}`}>
            <input type="radio" name="frequency" value="weekly" checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} />
            Hebdomadaire
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {isEditing ? "Modifier" : "Créer"}
        </Button>
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
