"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HabitForm from "./HabitForm";

type Habit = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  createdAt: string;
};

export default function HabitList({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

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

  function onUpdated() {
    setEditingId(null);
    fetchHabits();
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Liste des habitudes</h3>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : habits.length === 0 ? (
        <p>Aucune habitude pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <div key={h.id} className={`p-4 bg-card border border-border rounded-lg cursor-pointer ${selectedId === h.id ? 'ring-2 ring-primary/40' : ''}`} onClick={() => router.push(`/habits/${h.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{h.name}</h4>
                  {h.description && <p className="text-sm text-muted-foreground">{h.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{h.frequency}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Edit" title="Modifier" className="p-2 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); setEditingId(h.id); setSelectedId(h.id); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {selectedId === h.id && (
                <div className="mt-3">
                  <div className="text-sm text-muted-foreground mb-2">Détails</div>
                  <div className="mb-2">
                    <div><strong>Nom:</strong> {h.name}</div>
                    {h.description && <div><strong>Description:</strong> {h.description}</div>}
                    <div><strong>Fréquence:</strong> {h.frequency}</div>
                    <div className="text-xs text-muted-foreground mt-1">Créé le {new Date(h.createdAt).toLocaleString()}</div>
                  </div>

                  {editingId === h.id ? (
                    <HabitForm userId={userId} habit={{ id: h.id, name: h.name, description: h.description, frequency: h.frequency }} onCancel={() => setEditingId(null)} onCreated={onUpdated} />
                  ) : (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-primary text-white rounded" onClick={(e) => { e.stopPropagation(); setEditingId(h.id); }}>
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
