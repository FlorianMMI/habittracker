import { NextResponse } from "next/server";
import { getHabitById, deleteHabit } from "@/lib/habits";

export async function GET(
  
  { params }: { params: { id?: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 });
    }

    const habit = await getHabitById(id);
    if (!habit) {
      return NextResponse.json({ error: "Habitude non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ habit }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Échec lors de la récupération de l'habitude" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 });
    }

    // TODO: Add userId verification from session
    const success = await deleteHabit(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Habitude non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Habitude supprimée avec succès" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Échec lors de la suppression de l'habitude" },
      { status: 500 }
    );
  }
}

