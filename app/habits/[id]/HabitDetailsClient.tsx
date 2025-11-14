"use client";

import React, { useEffect, useState } from 'react';
import HabitForm from '@/app/components/HabitForm';

export default function HabitDetailsClient({ id }: { id: string }) {
  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchHabit() {
      setLoading(true);
      try {
        const res = await fetch(`/api/habits/${id}`);
        const data = await res.json();
        if (res.ok) setHabit(data.habit);
        else setError(data.error || 'Erreur');
      } catch (err) {
        setError('Erreur réseau');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchHabit();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!habit) return <p>Aucune habitude trouvée.</p>;

  return (
    <div>
      <HabitForm userId={habit.userId} habit={{ id: habit.id, name: habit.name, description: habit.description, frequency: habit.frequency }} onCancel={() => { }} onCreated={() => { window.location.reload(); }} />
    </div>
  );
}
