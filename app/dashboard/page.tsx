import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import HabitsClientShell from "../components/HabitsClientShell";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Use the authenticated user's id when available; fallback to demo id for dev.
  const userId = session.user?.id || "user_demo_1";

  // The form toggle is client-side only; render a placeholder container and hydrate client components.
  return (
    <div className="min-h-screen bg-gray-50  sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <LogoutButton />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenue, {session.user?.name} !</h2>

            <div id="habits-root" className="space-y-6">
              <div className="flex items-center gap-4">
                <HabitsClientShell userId={userId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

