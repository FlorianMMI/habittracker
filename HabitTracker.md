# HabitTracker — User Stories

---

## Version 1.0

### Authentification

✅
- En tant que nouvel utilisateur, je veux créer un compte avec mon email et mot de passe afin de commencer à suivre mes habitudes.
- Critères d'acceptation :
    - Formulaire : email, mot de passe, confirmation du mot de passe
    - Validation email (format + unicité)
    - Mot de passe : minimum 8 caractères
    - Succès → redirection vers le dashboard
    - Gestion des erreurs avec messages clairs

#### US-002 : Connexion

✅
- En tant qu'utilisateur existant, je veux me connecter avec mes identifiants afin d'accéder à mes habitudes.
- Critères d'acceptation :
    - Formulaire : email et mot de passe
    - Authentification via NextAuth
    - Identifiants invalides → message d'erreur
    - Succès → redirection vers le dashboard

#### US-003 : Routes protégées

✅
- En tant que système, je veux protéger les routes du dashboard afin que seuls les utilisateurs authentifiés puissent y accéder.
- Critères d'acceptation :
    - Middleware vérifie l'authentification
    - Utilisateurs non authentifiés → redirection vers /login
    - Vérification du token à chaque requête
    - Gestion de l'expiration de session

---

### Fonctionnalités principales — Gestion des habitudes

#### US-004 : Créer une habitude

✅
- En tant qu'utilisateur, je veux créer une nouvelle habitude avec un nom, une description et une fréquence.
- Critères d'acceptation :
    - Formulaire : nom (requis), description (optionnelle), fréquence (quotidienne / hebdomadaire)
    - Nom : 3–50 caractères
    - Fréquence : boutons radio (Quotidienne / Hebdomadaire)
    - Soumission → habitude ajoutée en base
    - Notification toast de succès
    - Redirection vers la liste des habitudes

#### US-005 : Consulter la liste des habitudes

✅
- En tant qu'utilisateur, je veux voir toutes mes habitudes dans une liste.
- Critères d'acceptation :
    - Affichage de toutes les habitudes de l'utilisateur
    - Afficher : nom, description, fréquence, date de création
    - État vide si aucune habitude
    - Skeleton de chargement pendant la récupération


#### US-006 : Modifier une habitude
- En tant qu'utilisateur, je veux modifier une habitude existante.
- Critères d'acceptation :
    - Bouton "Modifier" sur la carte d'habitude
    - Formulaire pré-rempli avec valeurs actuelles
    - Modifier : nom, description, fréquence
    - Sauvegarde → mise à jour en base
    - Annulation → annule les changements
    - Notification toast de succès

#### US-007 : Supprimer une habitude
- En tant qu'utilisateur, je veux supprimer une habitude.
- Critères d'acceptation :
    - Bouton "Supprimer" sur la carte d'habitude
    - Modal de confirmation ("Êtes-vous sûr ?")
    - Oui → habitude supprimée (et toutes les entrées)
    - Non → annule l'action
    - Notification toast de succès
    - Retirée de la liste immédiatement

---

### Fonctionnalités principales — Suivi quotidien

#### US-008 : Dashboard quotidien
- En tant qu'utilisateur, je veux voir les habitudes du jour sur mon dashboard.
- Critères d'acceptation :
    - Affichage des habitudes actives pour le jour actuel
    - Afficher : nom, description
    - Indicateur de statut : ⬜ Non fait | ✅ Fait 
    - Triées par ordre de création
    - Mise à jour en temps réel lors du cochage

#### US-009 : Marquer une habitude comme faite
- En tant qu'utilisateur, je veux cocher une habitude comme complétée.
- Critères d'acceptation :
    - Case à cocher ou toggle
    - Clic → statut devient "fait"
    - Création d'entrée en base (habit_id, date, status: "done")
    - Feedback visuel (animation, changement de couleur)
    - Mise à jour optimiste de l'UI

#### US-010 : Historique sur 7 jours
- En tant qu'utilisateur, je veux voir mes 7 derniers jours de complétion.
- Critères d'acceptation :
    - Vue calendrier 7 jours (scroll horizontal sur mobile)
    - Chaque jour : date, statut (fait/raté/en attente)
    - Jour actuel mis en évidence
    - Code couleur : vert (fait), rouge (raté), gris (en attente)
    - Clic sur un jour → voir les détails

---

### Gestion des erreurs

#### US-011 : Page 404
- En tant qu'utilisateur, je veux voir un message utile sur une page inexistante.
- Critères d'acceptation :
    - Design personnalisé de la page 404
    - Message : "Page non trouvée"
    - Bouton : "Retour au dashboard"
    - Cohérent avec le design de l'application

#### US-012 : Page d'erreur
- En tant qu'utilisateur, je veux un message d'erreur clair quand quelque chose ne fonctionne pas.
- Critères d'acceptation :
    - Page personnalisée pour erreurs 500
    - Message : "Quelque chose s'est mal passé"
    - Bouton : "Réessayer" (recharger)
    - Erreur loguée dans la console (mode dev)

#### US-013 : États de chargement
- En tant qu'utilisateur, je veux voir des indicateurs de chargement.
- Critères d'acceptation :
    - Skeletons pour la liste d'habitudes
    - Spinner pour la soumission de formulaires

---

## Version 1.5 — Nouvelles fonctionnalités

#### US-014 : Calendrier mensuel
- En tant qu'utilisateur, je veux voir mes habitudes sur un calendrier mensuel.
- Critères d'acceptation :
    - Grille du mois complet
    - Chaque cellule affiche le statut par habitude
    - Code couleur : vert (toutes faites), jaune (partiel), rouge (aucune), gris (futur)
    - Clic sur un jour → voir les détails
    - Navigation mois précédent / suivant

#### US-015 : Compteur de streaks
- En tant qu'utilisateur, je veux voir ma streak actuelle pour chaque habitude.
- Critères d'acceptation :
    - Affichage du nombre de streak (ex : "🔥 7 jours")
    - Calcul : jours consécutifs de complétion
    - Réinitialisation à 0 si habitude ratée
    - Affiché sur la carte d'habitude et le dashboard
    - Indicateur visuel pour jalons (7, 30, 100 jours)

#### US-016 : Taux de complétion mensuel
- En tant qu'utilisateur, je veux voir mon pourcentage de complétion mensuel.
- Critères d'acceptation :
    - Calcul : (jours complétés / jours totaux) × 100
    - Affichage par habitude et taux global
    - Barre de progression visuelle
    - Mise à jour en temps réel (Facultatif)

#### US-017 : Édition rétroactive
- En tant qu'utilisateur, je veux modifier les entrées des jours passés.
- Critères d'acceptation :
    - Clic sur un jour passé → modal avec liste des habitudes
    - Changer le statut (en attente ↔ fait ↔ raté)
    - Sauvegarde → mise à jour en base
    - Recalcul automatique des streaks
    - Limite : max 30 jours dans le passé

#### US-018 : États Actif vs Complété
- En tant qu'utilisateur, je veux séparer habitudes complété & pas complété .
- Critères d'acceptation :
    - Affichage séparé
    - Route API pour Get si Complété ou non

#### US-019 : Filtrer les habitudes
- En tant qu'utilisateur, je veux filtrer mes habitudes (Tout / Actives / Archivées).
- Critères d'acceptation :
    - Menu ou onglets : "Tout" | "Actives" | "Archivées"
    - Filtre appliqué immédiatement
    - Persiste au rechargement (localStorage)
    - Badges de comptage (ex : "Actives (5)")

---

### Améliorations UI (rattaché à 1.5)

#### US-020 : Amélioration du design visuel
- En tant qu'utilisateur, je veux une interface plus soignée.
- Critères d'acceptation :
    - Palette de couleurs (primaire, secondaire, accent)
    - Espacement et typographie cohérents
    - Icônes pour actions (modifier, supprimer, archiver)
    - États de survol et transitions
    - Hiérarchie visuelle claire (titres, sections)
    - Toggle mode sombre (optionnel)

---

## Version 2.0 — Analytique & Suivi

#### US-021 : Graphiques d'évolution
- En tant qu'utilisateur, je veux voir des graphiques de ma progression.
- Critères d'acceptation :
    - Graphique en ligne : taux de complétion (semaines/mois)
    - Graphique en barres : comparaison des habitudes
    - Sélecteur de plage : 7 jours, 30 jours, tout
    - Info-bulles interactives
    - Responsive (mobile + desktop)

#### US-022 : Suivi de la meilleure streak
- En tant qu'utilisateur, je veux voir ma meilleure streak de tous les temps.
- Critères d'acceptation :
    - Affichage "Meilleure Streak : X jours" par habitude
    - Séparée de la streak actuelle
    - Historique préservé
    - Badge visuel si égalité avec la meilleure streak

#### US-023 : Récompenses virtuelles
- En tant qu'utilisateur, je veux débloquer des badges pour jalons.
- Critères d'acceptation :
    - Badges : 7, 30, 100, 365 jours
    - Modal de célébration au déblocage
    - Page galerie de badges
    - Icônes / graphiques pour chaque badge
    - Persistant (sauvegardé en base)

---

## Habitudes avancées (rattaché à 2.0)

#### US-024 : Fréquences personnalisées
- En tant qu'utilisateur, je veux définir des fréquences personnalisées.
- Critères d'acceptation :
    - Options : Quotidienne, Hebdomadaire, Personnalisée
    - Personnalisée : choisir des jours (Lun, Mer, Ven) ou fois par semaine (ex : 3×)
    - Afficher l'habitude uniquement les jours sélectionnés
    - Calcul de streak adapté à la fréquence

#### US-025 : Catégories / Tags
- En tant qu'utilisateur, je veux catégoriser mes habitudes.
- Critères d'acceptation :
    - Créer / modifier / supprimer des catégories
    - Assigner une catégorie à une habitude
    - Couleur par catégorie
    - Filtrer par catégorie
    - Afficher badge de catégorie sur la carte

#### US-026 : Notes sur les entrées
- En tant qu'utilisateur, je veux ajouter des notes aux entrées quotidiennes.
- Critères d'acceptation :
    - Bouton "Ajouter une note" lors du marquage
    - Zone de texte (max 248 caractères)
    - Notes sauvegardées avec l'entrée
    - Voir les notes dans le calendrier / historique
    - Champ optionnel

#### US-027 : Email récapitulatif hebdomadaire
- En tant qu'utilisateur, je veux recevoir un email récapitulatif hebdomadaire.
- Critères d'acceptation :
    - Email envoyé hebdo
    - Contenu : taux de complétion hebdo, meilleure streak, message d'encouragement
    - Option de désinscription
    - Nécessite email vérifié
    - GMAIL Smtp ?

#### US-028 : Objectifs chiffrés
- En tant qu'utilisateur, je veux suivre des objectifs quantifiables (ex : "Boire 8 verres").
- Critères d'acceptation :
    - Option "Objectif chiffré" sur une habitude
    - Définir un nombre cible (ex : 8)
    - Incrémenter le compteur à chaque fois que l'habitude est faite
    - Barre de progression : actuel / cible
    - Réinitialisation quotidienne

---

## Notes techniques (rattachées à Version 2.0)
- Prioriser : US-001 → US-013 (Version 1.0)
- Tests : focus sur US-017 (édition rétroactive) et US-015 (calcul des streaks)
- Performance : UI optimiste sur US-009 (critique pour l'UX)
- Observations : prévoir logs et métriques pour erreurs et performances
