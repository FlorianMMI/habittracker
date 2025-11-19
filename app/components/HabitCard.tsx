"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/providers/ToastProvider";
import { EditIcon, DeleteIcon, MoreIcon } from "@/lib/Icon";

type HabitType = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  createdAt: string;
};

interface HabitCardProps {
  habit: HabitType;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${habit.name}" ?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Habitude supprimée avec succès", "success");
        router.refresh();
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur lors de la suppression", "error");
      }
    } catch (err) {
      showToast("Erreur réseau", "error");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  return (
    <div
      className="p-4 bg-card border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => router.push(`/habits/${habit.id}`)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="font-medium">{habit.name}</h4>
            {habit.description && (
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            )}
            <article className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <p className="flex items-center text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                  {habit.frequency}
                </p>
              </div>
              <p className="m-0">Créé le {new Date(habit.createdAt).toLocaleDateString("fr-FR")}</p>
            </article>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
            <button
              aria-label="Plus d'actions"
              title="Plus d'actions"
              className="p-2 rounded hover:bg-muted/30 text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((s) => !s);
              }}
            >
              <MoreIcon className="w-5 h-5" />
            </button>

          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 mt-2 w-44 bg-card border border-border rounded shadow-md z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                role="menuitem"
                className="w-full text-left px-3 py-2 hover:bg-muted/20 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  router.push(`/habits/${habit.id}`);
                }}
              >
                <EditIcon />
                <span className="text-sm">Éditer</span>
              </button>
              <button
                role="menuitem"
                className="w-full text-left px-3 py-2 hover:bg-muted/20 flex items-center gap-2 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  handleDelete(e as unknown as React.MouseEvent);
                }}
                disabled={deleting}
              >
                <DeleteIcon />
                <span className="text-sm">Supprimer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
