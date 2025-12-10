import { Flame, Target, TrendingUp, Award, User } from "lucide-react";
import StatCard from "./StatCard";

// ==========================================================================
// TYPES
// ==========================================================================


interface DailyStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

interface ProfileStats {
  totalHabits: number;
  dailyHabits: number;
  weeklyHabits: number;
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  weeklyStats: DailyStats[];
  completionRate: number;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string | null;
}

interface InfoProfileProps {
  user?: UserInfo;
  stats: ProfileStats | null;
}

// ==========================================================================
// COMPONENT des information de l'utilisateur sur page profil
// ==========================================================================


export default function InfoProfile({ user, stats }: InfoProfileProps) {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground mt-2">
            Vos informations et statistiques
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-secondary/50 dark:bg-foreground/10 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="w-8 h-8 text-primary" />
          </div>
          <div className="min-w-0">
        <h2
          className="text-xl font-semibold text-foreground truncate"
          title={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
        >
          {user?.firstName} {user?.lastName}
        </h2>
        <p
          className="text-muted-foreground truncate"
          title={user?.email ?? ""}
        >
          {user?.email}
        </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Routines"
          value={stats?.totalHabits ?? 0}
          icon={<Target className="w-5 h-5 text-primary" />}
          variant="primary"
        />

        <StatCard
          title="Streak actuel"
          value={stats?.currentStreak ?? 0}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          variant="orange"
        />

        <StatCard
          title="Meilleur streak"
          value={stats?.bestStreak ?? 0}
          icon={<Award className="w-5 h-5 text-yellow-500" />}
          variant="yellow"
        />

        <StatCard
          title="Taux complétion"
          value={`${stats?.completionRate ?? 0}%`}
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          variant="green"
        />
      </div>

     
    </>
  );
}