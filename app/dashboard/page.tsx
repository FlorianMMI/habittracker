import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DailyHabitList from "../components/DailyHabitList";
import SevenDayHistory from "../components/SevenDayHistory";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Use the authenticated user's id when available; fallback to demo id for dev.
  const userId = session.user?.id || "user_demo_1";

  return (
    <div className="min-h-screen bg-background sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card shadow-sm rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Tableau de bord
              </h1>
              <p className="text-muted-foreground mt-2">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Bienvenue, <span className="text-primary">{session.user?.name}</span> !
              </h2>
              <p className="text-sm text-muted-foreground">
                Suivez vos habitudes du jour et construisez votre routine parfaite 🔥
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Mes habitudes d'aujourd'hui
                </h3>
                <DailyHabitList userId={userId} />
              </div>

              {/* Historique des 7 derniers jours */}
              <div className="border-t border-border pt-6">
                <SevenDayHistory userId={userId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

