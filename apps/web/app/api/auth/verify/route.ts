import { Request } from "next/server";
import {
  buildMessage,
  isTimestampValid,
  signJwt,
  verifySignature,
} from "@/lib/auth/stellar-auth";
import { successResponse, errorResponse, handleError } from "@/app/api/utils/response";

const COOKIE_MAX_AGE = 86_400; // 24 hours

/**
 * POST /api/auth/verify
 *
 * Accepts `{ publicKey, signature, nonce, timestamp }`, verifies the Stellar
 * signature, and returns a JWT stored in a secure HTTP-only cookie.
 */
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  try {
    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("Invalid JSON body", 400);
    const { publicKey, signature, nonce, timestamp } = body;

    if (!publicKey || !signature || !nonce || timestamp == null) {
      return errorResponse(
        "publicKey, signature, nonce, and timestamp are required",
        400
      );
    }

    if (!isTimestampValid(timestamp)) {
      return errorResponse(
        "Challenge expired. Please request a new login challenge.",
        401
      );
    }

    const message = buildMessage(nonce, timestamp);
    if (!verifySignature(publicKey, signature, message)) {
      return errorResponse("Invalid signature", 401);
    }

    const token = signJwt(publicKey);
    const response = successResponse({ publicKey });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch (err) {
    return handleError(err, requestId ?? undefined);
  }
}
