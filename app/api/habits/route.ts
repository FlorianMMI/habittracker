import { NextResponse } from "next/server";
import { getHabitsByUser, createHabit, updateHabit } from "@/lib/habits";

// Note: This project currently uses file-based storage and doesn't have
// a full auth session in these API handlers. We accept a query param or
// body field `userId` for scoping. Replace with proper auth in the future.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const habits = await getHabitsByUser(userId);
    return NextResponse.json({ habits }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, description, frequency } = body ?? {};

    if (!userId || !name) {
      return NextResponse.json({ error: "userId and name are required" }, { status: 400 });
    }

    if (name.trim().length < 3 || name.trim().length > 50) {
      return NextResponse.json({ error: "Le nom doit contenir entre 3 et 50 caractères" }, { status: 400 });
    }

    const habit = await createHabit(userId, { name: name.trim(), description, frequency });

    return NextResponse.json({ message: "Habit created", habit }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating habit:", err);
    
    // Check for foreign key constraint error (user doesn't exist)
    if (err.code === 'P2003') {
      return NextResponse.json({ error: "Utilisateur non trouvé. Veuillez vous reconnecter." }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to create habit", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }


}


export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, userId, name, description, frequency } = body ?? {};

    if (!id || !userId || !name) {
      return NextResponse.json({ error: "id, userId and name are required" }, { status: 400 });
    }

    if (name.trim().length < 3 || name.trim().length > 50) {
      return NextResponse.json({ error: "Le nom doit contenir entre 3 et 50 caractères" }, { status: 400 });
    }

   

    const updated = await updateHabit(id, userId, { name: name.trim(), description, frequency });
    if (!updated) {
      return NextResponse.json({ error: "Habit not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Habit updated", habit: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}
