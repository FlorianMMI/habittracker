"use client";

import { LogoutIcon } from "@/lib/Icon";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className=" text-sm font-medium text-foreground  "
    >
      <LogoutIcon className="inline-block w-6 h-6 mr-2" />
    </button>
  );
}
