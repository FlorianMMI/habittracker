import { NextResponse } from "next/server";
import { getHabitById } from "@/lib/habits";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const habit = await getHabitById(id);
    if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    return NextResponse.json({ habit }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 });
  }
}
