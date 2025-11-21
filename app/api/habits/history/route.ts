import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSevenDayHistory } from "@/lib/progress";
import { getHabitsByUser } from "@/lib/habits";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Récupérer les habitudes de l'utilisateur
    const habits = await getHabitsByUser(userId);

    // Récupérer l'historique des 7 derniers jours
    const { dates, progressByHabit } = await getSevenDayHistory(userId);

    // Formater les données pour le client
    const history = dates.map((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const habitsForDay = habits.map((habit) => {
        const progressMap = progressByHabit.get(habit.id);
        const progress = progressMap?.get(dateKey);
        
        return {
          habitId: habit.id,
          habitName: habit.name,
          status: progress ? "done" : "pending",
        };
      });

      return {
        date: dateKey,
        displayDate: date.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        isToday: dateKey === new Date().toISOString().split("T")[0],
        habits: habitsForDay,
        completionRate:
          habitsForDay.length > 0
            ? Math.round(
                (habitsForDay.filter((h) => h.status === "done").length /
                  habitsForDay.length) *
                  100
              )
            : 0,
      };
    });

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
