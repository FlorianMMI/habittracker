"use client";

import React, { useState } from "react";
import { Button } from "./Button";

interface CreateHabitButtonProps {
  userId: string;
  onToggleForm: (show: boolean) => void;
}

export default function CreateHabitButton({ userId, onToggleForm }: CreateHabitButtonProps) {
  const [showForm, setShowForm] = useState(false);

  const handleToggle = () => {
    const newState = !showForm;
    setShowForm(newState);
    onToggleForm(newState);
  };

  return (
    <Button
      type="button"
      style={{ height: "50px", width: "200px" }}
      onClick={handleToggle}
    >
      {showForm ? "Fermer le formulaire" : "Rajouter une habitude"}
    </Button>
  );
}
