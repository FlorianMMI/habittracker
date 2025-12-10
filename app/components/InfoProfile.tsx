import { Flame, Target, Calendar, TrendingUp, Award, User } from "lucide-react";

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
      <div className="bg-secondary/50 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Habits */}
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalHabits || 0}</p>
          <p className="text-sm text-muted-foreground">Routines</p>
        </div>

        {/* Current Streak */}
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0}</p>
          <p className="text-sm text-muted-foreground">Streak actuel</p>
        </div>

        {/* Best Streak */}
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.bestStreak || 0}</p>
          <p className="text-sm text-muted-foreground">Meilleur streak</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.completionRate || 0}%</p>
          <p className="text-sm text-muted-foreground">Taux complétion</p>
        </div>
      </div>

     
    </>
  );
}