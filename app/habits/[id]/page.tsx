import React from 'react';
import HabitDetailsClient from './HabitDetailsClient';
import { getHabitById } from '@/lib/habits';

// Server component to fetch habit by id and render details + client form
export default async function HabitDetailsPage({ params }: { params: { id: string } }) {
  const id = params.id;

  // Fetch habit directly on the server using lib (avoid relative fetch URL issues)
  const habit = await getHabitById(id);
  if (!habit) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Habitude</h1>
        <p>Impossible de récupérer l'habitude.</p>
      </div>
    );
  }

  // Render server-side details and include client HabitForm for editing
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Détails de l'habitude</h1>

      <div className="p-4 bg-card border border-border rounded-lg mb-6">
        <h2 className="text-lg font-medium">{habit.name}</h2>
        {habit.description && <p className="text-sm text-muted-foreground">{habit.description}</p>}
        <p className="text-xs text-muted-foreground mt-1">{habit.frequency} • créé le {new Date(habit.createdAt).toLocaleString()}</p>
      </div>

      <div>
        <HabitDetailsClient id={habit.id} />
      </div>
    </div>
  );
}
