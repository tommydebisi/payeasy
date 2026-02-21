import { NextResponse } from "next/server";
import { successResponse } from "@/app/api/utils/response";

/**
 * POST /api/auth/logout
 *
 * Clears the auth cookie. No body required.
 */
export async function POST() {
  const response = successResponse({ ok: true });
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
