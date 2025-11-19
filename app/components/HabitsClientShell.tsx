"use client";

import React from "react";
import HabitList from "./HabitList";
import HabitForm from "./HabitForm";
import { Button } from "./Button";

export default function HabitsClientShell({ userId }: { userId: string }) {
  const [showForm, setShowForm] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  return (
    <div className="w-full">
      <div className="mt-4">
        <HabitList key={refreshKey} userId={userId} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
