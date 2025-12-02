"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TagData {
  name: string;
  emoji: string;
}

interface TagSelectorProps {
  selectedTags: TagData[];
  onChange: (tags: TagData[]) => void;
  availableTags?: TagData[];
}

// Liste des tags prédéfinis avec emojis
const PRESET_TAGS: TagData[] = [
  { name: "Sport", emoji: "🏃" },
  { name: "Santé", emoji: "❤️" },
  { name: "Travail", emoji: "💼" },
  { name: "Étude", emoji: "📚" },
  { name: "Méditation", emoji: "🧘" },
  { name: "Nutrition", emoji: "🥗" },
  { name: "Sommeil", emoji: "😴" },
  { name: "Créativité", emoji: "🎨" },
  { name: "Social", emoji: "👥" },
  { name: "Finance", emoji: "💰" },
  { name: "Lecture", emoji: "📖" },
  { name: "Écriture", emoji: "✍️" },
  { name: "Musique", emoji: "🎵" },
  { name: "Ménage", emoji: "🧹" },
  { name: "Nature", emoji: "🌿" },
];

// Liste d'emojis populaires pour la création de tags personnalisés
const POPULAR_EMOJIS = [
  "🔥", "⭐", "💪", "🎯", "✨", "🚀", "💡", "🏆", "🌟", "💎",
  "🎉", "👍", "❤️", "💚", "💙", "💜", "🧡", "💛", "🖤", "🤍",
  "🏃", "🧘", "🏋️", "🚴", "🏊", "⚽", "🎾", "🏀", "🎮", "🎬",
  "📱", "💻", "🎧", "📷", "🎸", "🎹", "🎤", "🎨", "✏️", "📝",
];

export default function TagSelector({ selectedTags, onChange, availableTags = [] }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combiner les tags prédéfinis avec les tags disponibles (sans doublons)
  const allTags = [...PRESET_TAGS];
  availableTags.forEach((tag) => {
    if (!allTags.some((t) => t.name === tag.name && t.emoji === tag.emoji)) {
      allTags.push(tag);
    }
  });

  // Filtrer les tags selon la recherche
  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.emoji.includes(searchQuery)
  );

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (tag: TagData) => {
    const isSelected = selectedTags.some((t) => t.name === tag.name && t.emoji === tag.emoji);
    if (isSelected) {
      onChange(selectedTags.filter((t) => !(t.name === tag.name && t.emoji === tag.emoji)));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: TagData) => {
    onChange(selectedTags.filter((t) => !(t.name === tag.name && t.emoji === tag.emoji)));
  };

  const handleCreateTag = () => {
    if (newTagName.trim().length >= 2) {
      const newTag: TagData = { name: newTagName.trim(), emoji: newTagEmoji };
      // Ajouter et sélectionner le nouveau tag
      if (!selectedTags.some((t) => t.name === newTag.name && t.emoji === newTag.emoji)) {
        onChange([...selectedTags, newTag]);
      }
      setNewTagName("");
      setNewTagEmoji("🏷️");
      setIsCreating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-foreground mb-2">
        Tags (optionnel)
      </label>

      {/* Tags sélectionnés */}
      <div
        className={cn(
          "min-h-[44px] p-2 bg-background border border-border rounded-lg cursor-pointer flex flex-wrap gap-2 items-center",
          isOpen && "border-primary ring-1 ring-primary/20"
        )}
        onClick={() => {
          setIsOpen(true);
          
        }}
      >
        {selectedTags.length === 0 ? (
          <span className="text-muted text-sm">Cliquez pour ajouter des tags...</span>
        ) : (
          selectedTags.map((tag) => (
            <span
              key={`${tag.emoji}-${tag.name}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
            >
              <span>{tag.emoji}</span>
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-1 hover:text-destructive transition-colors"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-72 overflow-hidden">
          {/* Recherche */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un tag..."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
            />
          </div>

          {/* Liste des tags */}
          {!isCreating ? (
            <div className="max-h-48 overflow-y-auto p-2">
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.some(
                    (t) => t.name === tag.name && t.emoji === tag.emoji
                  );
                  return (
                    <button
                      key={`${tag.emoji}-${tag.name}`}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-muted hover:bg-primary/10 text-foreground"
                      )}
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.name}</span>
                    </button>
                  );
                })}
              </div>

              {filteredTags.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  Aucun tag trouvé
                </p>
              )}

              {/* Bouton créer un tag */}
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="mt-3 w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Créer un nouveau tag</span>
              </button>
            </div>
          ) : (
            /* Formulaire de création de tag */
            <div className="p-3 space-y-3 overflow-auto custom-scrollbar max-h-60">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Nom du tag
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ex: Routine matinale"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Choisir un emoji
                </label>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-muted/30 rounded-md">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewTagEmoji(emoji)}
                      className={cn(
                        "w-8 h-8 text-lg rounded hover:bg-primary/10 transition-colors",
                        newTagEmoji === emoji && "bg-primary/20 ring-2 ring-primary"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aperçu */}
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <span className="text-xs text-muted">Aperçu:</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  <span>{newTagEmoji}</span>
                  <span>{newTagName || "Nom du tag"}</span>
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={newTagName.trim().length < 2}
                  className="flex-1 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
