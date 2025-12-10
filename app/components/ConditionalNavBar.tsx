"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function ConditionalNavBar() {
  const pathname = usePathname();
  
  // Chemin ou la navbar doit être cachée
  const hideNavbar = pathname === "/login" || pathname === "/register" || pathname === "/";
  
  if (hideNavbar) {
    return null;
  }
  
  return <NavBar />;
}
