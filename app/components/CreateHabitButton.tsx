"use client";

import React from "react";
import { Button } from "./Button";

interface CreateHabitButtonProps {
  userId: string;
  onToggleForm: () => void;
}

export default function CreateHabitButton({ userId, onToggleForm }: CreateHabitButtonProps) {
  return (
    <Button
      type="button"
      style={{ height: "50px", width: "200px" }}
      onClick={onToggleForm}
    >
      Rajouter une habitude
    </Button>
  );
}
