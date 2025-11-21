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

async function handleSupprimer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/habits/${habit?.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Habitude supprimée avec succès !", "success");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Erreur lors de la suppression");
        showToast("Erreur lors de la suppression", "error");
      }
    } catch {
      setError("Erreur réseau");
      showToast("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  }

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
    <form onSubmit={handleCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Nom de l'habitude</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Boire de l'eau" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description (optionnel)</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ajouter une description..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Fréquence</label>
        <div className="flex gap-3 w-full">
          <label className={`flex-1 cursor-pointer inline-flex bg-muted items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${frequency === 'daily' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
            <input type="radio" name="frequency" value="daily" checked={frequency === 'daily'} onChange={() => setFrequency('daily')} className="sr-only" />
            <span className="text-sm font-medium">Quotidienne</span>
          </label>
          <label className={`flex-1 cursor-pointer inline-flex bg-muted items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${frequency === 'weekly' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
            <input type="radio" name="frequency" value="weekly" checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} className="sr-only" />
            <span className="text-sm font-medium">Hebdomadaire</span>
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {isEditing ? "Enregistrer" : "Créer l'habitude"}
        </Button>
        
        {isEditing && (
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
