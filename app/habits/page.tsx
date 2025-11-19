import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import HabitListServer from "@/app/components/HabitListServer";
import HabitsPageClient from "./HabitsPageClient";

export default async function HabitsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  return (
    <HabitsPageClient userId={userId}>
      <HabitListServer userId={userId} />
    </HabitsPageClient>
  );
}
