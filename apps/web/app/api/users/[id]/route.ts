import { NextRequest } from "next/server";
import { createClient } from "@/lib/superbase/server";
import { successResponse, errorResponse, handleError } from "@/app/api/utils/response";
import { requireAuth } from "@/app/api/utils/auth";
import { NotFoundError } from "@/app/api/utils/errors";

/**
 * GET /api/users/[id]
 *
 * Returns a user's public profile by id (UUID or public_key).
 * Authenticated users only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  try {
    requireAuth(request);
    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) {
      return errorResponse("Supabase is not configured.", 503);
    }

    // Support lookup by UUID or by public_key (Stellar G...)
    const isPublicKey = id.startsWith("G") && id.length === 56;
    const { data, error } = await supabase
      .from("users")
      .select("id, public_key, username, avatar_url, bio, created_at")
      .match(isPublicKey ? { public_key: id } : { id })
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError("User not found");

    return successResponse(data);
  } catch (err) {
    return handleError(err, requestId);
  }
}
