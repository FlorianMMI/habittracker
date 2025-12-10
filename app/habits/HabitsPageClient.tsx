"use client";

import React, { useState } from "react";
import CreateHabitButton from "@/app/components/Habits/CreateHabitButton";
import HabitForm from "@/app/components/Habits/HabitForm";
import { useRouter } from "next/navigation";

export default function HabitsPageClient({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-start mb-6">
        <article className="flex flex-col">
          <h1 className="text-2xl mb-4">Mes habitudes</h1>
          <p className="text-sm text-muted-foreground">Gérez vos habitudes et suivez votre progression.</p>
        </article>

        <CreateHabitButton userId={userId} onToggleForm={() => setShowForm(true)} />
      </div>

      {showForm && (
        <div className="mb-6">
          <HabitForm
            userId={userId}
            onCancel={() => setShowForm(false)}
            onCreated={() => {
              setShowForm(false);
              router.refresh();
            }}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Liste</h2>
      </div>

      {children}
    </div>
  );
}
