"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import InfoProfile from "@/app/components/Profil/InfoProfile";
import ProfileChart from "@/app/components/Profil/ProfileChart";
import SProfilPage from "../components/Skeleton/SProfilPage";

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/profile/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <SProfilPage />
    );
  }
  
  return (
    <div className="min-h-screen bg-background sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card shadow-sm rounded-lg p-8">
          {/* Info Profile */}
          <InfoProfile user={session?.user} stats={stats} />

          {/* Weekly Chart */}
          <ProfileChart weeklyStats={stats?.weeklyStats || []} />

          {/* Total completions */}
          <div className="mt-8 text-center py-4 border-t border-border">
            <p className="text-muted-foreground">
              Total de routines complétées : <span className="font-semibold text-foreground">{stats?.totalCompletions ?? 0}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}