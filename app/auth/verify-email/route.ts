import { NextResponse } from "next/server";
import { verifyUserByEmailAndToken } from "@/lib/users";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    const email = url.searchParams.get("email") || "";

    if (!token || !email) {
      return NextResponse.redirect(new URL("/login?verified=0", url.origin));
    }

    const ok = await verifyUserByEmailAndToken(email, token);
    if (ok) {
      return NextResponse.redirect(new URL("/login?verified=1", url.origin));
    }

    return NextResponse.redirect(new URL("/login?verified=0", url.origin));
  } catch (err) {
    console.error("Erreur verification email:", err);
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/login?verified=0", url.origin));
  }
}
