"use client";

import React from "react";
import HabitList from "./HabitList";
import HabitForm from "./HabitForm";

export default function HabitsClientShell({ userId }: { userId: string }) {
  const [showForm, setShowForm] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div />
        <div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg"
            onClick={() => setShowForm((s) => !s)}
          >
            Crée une habitude
          </button>
        </div>
      </div>

      {showForm && (
        <HabitForm userId={userId} onCancel={() => setShowForm(false)} onCreated={() => setRefreshKey((k) => k + 1)} />
      )}

      <div className="mt-4">
        {/* Key forces remount to refresh list after creation */}
        <HabitList key={refreshKey} userId={userId} />
      </div>
    </div>
  );
}
