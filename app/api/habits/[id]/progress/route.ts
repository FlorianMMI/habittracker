import { NextRequest, NextResponse } from "next/server";
import { toggleProgress, getProgressByDate } from "@/lib/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const date = body.date ? new Date(body.date) : new Date();

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
    const date = dateParam ? new Date(dateParam) : new Date();

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
