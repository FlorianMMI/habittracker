# 🎯 HabitTracker

Application web moderne de suivi d'habitudes construite avec Next.js 15, permettant aux utilisateurs de créer, suivre et gérer leurs habitudes quotidiennes et hebdomadaires.

![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748)

## ✨ Fonctionnalités

### Version Actuelle
- ✅ **Authentification complète** : Inscription, connexion avec NextAuth.js
- ✅ **Vérification email** : Envoi d'email de confirmation lors de l'inscription
- ✅ **Gestion des habitudes** : Créer, modifier, supprimer des habitudes
- ✅ **Fréquences multiples** : Habitudes quotidiennes ou hebdomadaires
- ✅ **Interface responsive** : Design adaptatif mobile et desktop
- ✅ **Mode sombre** : Thème clair/sombre avec sauvegarde des préférences
- ✅ **Notifications toast** : Retours visuels pour toutes les actions
- ✅ **Navigation intuitive** : Menu burger avec animations fluides
- ✅ **Vue calendrier des habitudes** : Vue calendrier mois/semaines des habitudes
- ✅ **Calcul de streak** : Visualisation des streak et de la meilleur streak
- ✅ **Graphiques et statistiques** : Visulaisation par Rechart de différentes stats 
- ✅ **Tag** : Mise en place de différents tag qui peuvent servier de catégorie 
 - ✅ **Vue calendrier des habitudes** : Vue calendrier mois/semaines des habitudes (les habitudes hebdomadaires peuvent être cochées et comptées chaque jour)
 - ✅ **Profile & Stats** : Page profil avec `InfoProfile` et `ProfileChart` (statistiques + graphique par `recharts`)
 - ✅ **Calcul de streak** : Visualisation des streaks (un "jour parfait" = 100% des habitudes complétées — daily + weekly)
 - ✅ **Graphiques et statistiques** : Visualisation par `recharts` pour les 7 derniers jours et autres métriques

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 15.5.7 (App Router avec Turbopack) --> Ne contient pas la faille react2shell
- **Language** : TypeScript 5 (strict mode)
- **Styling** : Tailwind CSS v4 + tw-animate-css
- **Animations** : Motion v10.12.8
- **Fonts** : Geist Sans & Geist Mono

### Backend
- **Base de données** : PostgreSQL
- **ORM** : Prisma 6.19.0
- **Authentification** : NextAuth.js 4.24.11
- **Email** : Nodemailer 6.10.1
- **Hashing** : bcryptjs

### Utilitaires
- **Class Management** : clsx + tailwind-merge (via `cn()`)
- **Variants** : class-variance-authority
- **Environment** : dotenv

## 📋 Prérequis

- Node.js 18+ et npm
- PostgreSQL installé et configuré
- Compte email SMTP (Gmail recommandé) pour l'envoi d'emails

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/FlorianMMI/habittracker.git
cd habittracker/habittracker
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/habittracker"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-super-securise-ici"

# Email (Gmail)
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASS="votre-mot-de-passe-app"
EMAIL_FROM="HabitTracker <votre-email@gmail.com>"
```

**⚠️ Important** : Pour Gmail, utilisez un "Mot de passe d'application" :
1. Activez la validation en 2 étapes
2. Allez dans "Mots de passe d'application"
3. Générez un nouveau mot de passe pour "Mail"

### 4. Initialiser la base de données

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
habittracker/
├── app/
│   ├── api/                    # API Routes (REST endpoints)
│   │   ├── auth/              # Routes NextAuth
│   │   ├── habits/            # CRUD habitudes
│   │   └── register/          # Inscription
│   ├── components/            # Composants réutilisables (noeuds principaux)
│   │   ├── Button.tsx
│   │   ├── NavBar.tsx
│   │   ├── InfoProfile.tsx
│   │   ├── ProfileChart.tsx
│   │   ├── DailyHabitCard.tsx
│   │   ├── HabitCard.tsx
│   │   ├── HabitForm.tsx
│   │   ├── HabitList.tsx
│   │   ├── HabitsClientShell.tsx
│   │   ├── DashboardClient.tsx
│   │   └── Toast.tsx
│   ├── dashboard/             # Page tableau de bord
│   ├── habits/                # Pages gestion habitudes
│   │   └── [id]/             # Page détails/modification
│   ├── login/                 # Page connexion
│   ├── register/              # Page inscription
│   ├── providers/             # Context Providers
│   │   ├── AuthProvider.tsx
│   │   ├── ToastProvider.tsx
│   │   └── ThemeProvider.tsx
│   ├── ui/                    # Composants UI de base
│   ├── globals.css            # Styles globaux + variables CSS
│   └── layout.tsx             # Layout racine
├── lib/                       # Logique métier
│   ├── habits.ts              # Fonctions CRUD habitudes (utilisées par API)
│   ├── progress.ts            # Gestion des progressions (toggle, fetch)
│   ├── users.ts               # Fonctions utilisateurs
│   ├── prisma.ts              # Client Prisma
│   └── utils.ts               # Utilitaires (cn, date helpers, etc.)
├── prisma/
│   ├── schema.prisma          # Schéma base de données
│   └── migrations/            # Migrations
├── types/
│   └── next-auth.d.ts         # Types NextAuth custom
└── public/                    # Assets statiques
```

## 🎨 Design System

### Palette de Couleurs

**Mode Clair**
- Background : `#ECECF0`
- Foreground : `#222222`
- Primary : `#CC6821` (Orange)
- Accent/Flamme : `#FF6900` (Orange vif)
- Card : `#FFFFFF`
- Destructive : `#FFA2A2` (Rouge)
- Success : `#DCFCE7` (Vert)

**Mode Sombre**
- Background : `#222222`
- Foreground : `#FFFFFF`
- Muted : `#696969`
- Destructive : `#BC6F6F`

Toutes les couleurs utilisent les variables CSS définies dans `globals.css` pour supporter le mode sombre automatiquement.

## 🔧 Scripts Disponibles

```bash
# Développement avec Turbopack
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name nom_migration

# Ouvrir Prisma Studio
npx prisma studio
```

## 🗄️ Schéma de Base de Données

### Table `User`
- `id` : Identifiant unique
- `email` : Email (unique)
- `firstName` : Prénom
- `lastName` : Nom
- `password` : Mot de passe hashé
- `emailVerified` : Statut de vérification
- `createdAt` : Date de création

### Table `Habit`
- `id` : Identifiant unique
- `userId` : Référence utilisateur
- `name` : Nom de l'habitude
- `description` : Description (optionnel)
- `frequency` : "daily" ou "weekly"
- `createdAt` : Date de création

## 📝 Conventions de Code

- **Composants** : PascalCase (`HabitCard.tsx`)
- **Fichiers utilitaires** : camelCase (`utils.ts`)
- **API Routes** : lowercase (`route.ts`)
- **Strict TypeScript** : Pas de `any` sauf cas exceptionnel
- **CSS** : Variables CSS uniquement, pas de couleurs en dur
- **Server Components par défaut** : `"use client"` uniquement si nécessaire

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez `HabitTracker.md` pour la roadmap complète.

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

## 👤 Auteur

**Florian MMI**
- GitHub: [@FlorianMMI](https://github.com/FlorianMMI)

---

**Note** : Ce projet suit une roadmap par versions (V1.0 → V1.5 → V2.0). Consultez `HabitTracker.md` pour les détails des fonctionnalités prévues.
