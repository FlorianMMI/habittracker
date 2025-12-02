import { NextRequest, NextResponse } from "next/server";
import { toggleProgress, getProgressByDate } from "@/lib/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Parse une date depuis une chaîne (YYYY-MM-DD ou ISO string)
 * Retourne une date à minuit en local
 */
function parseDate(dateString: string): Date {
  // Si c'est au format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  // Sinon, parser comme ISO et normaliser à minuit local
  const parsed = new Date(dateString);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: habitId } = await params;
    const body = await req.json();
    const date = body.date ? parseDate(body.date) : new Date();

    const result = await toggleProgress(habitId, date);

    return NextResponse.json({
      success: true,
      completed: result.completed,
      progress: result.progress,
    });
  } catch (error) {
    console.error("Erreur lors du toggle de progression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la progression" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: habitId } = await params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? parseDate(dateParam) : new Date();

    const progress = await getProgressByDate(habitId, date);

    return NextResponse.json({
      completed: !!progress,
      progress,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 }
    );
  }
}
