import React from 'react';
import HabitFormWrapper from './HabitFormWrapper';
import { getHabitById } from '@/lib/habits';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";


// Server component to fetch habit by id and render details + client form
export default async function HabitDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const id = params.id;

  // Fetch habit directly on the server using lib
  const habit = await getHabitById(id);
  
  if (!habit) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Habitude introuvable</h1>
        <p>Cette habitude n'existe pas ou a été supprimée.</p>
      </div>
    );
  }

  // Verify ownership
  if (habit.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Render server-side details and include client HabitForm for editing
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Modifier l'habitude</h1>

      <div className="bg-background shadow-sm rounded-lg p-6">
        <HabitFormWrapper
          habit={{
            id: habit.id,
            name: habit.name,
            description: habit.description ?? undefined,
            frequency: habit.frequency,
          }}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
