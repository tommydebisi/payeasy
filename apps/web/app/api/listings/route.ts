import { NextRequest } from "next/server";
import { createClient } from "@/lib/superbase/server";
import { successResponse, handleError } from "@/app/api/utils/response";

/**
 * GET /api/listings
 *
 * Returns a list of listings with optional search/query params.
 * Public (no auth required for browse).
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const offset = Number(searchParams.get("offset")) || 0;
    const status = searchParams.get("status") ?? "active";

    if (!supabase) {
      return successResponse({ listings: [], limit, offset });
    }

    const { data, error } = await supabase
      .from("listings")
      .select("id, landlord_id, title, description, monthly_rent_xlm, contract_id, status, created_at, updated_at", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse({
      listings: data ?? [],
      limit,
      offset,
    });
  } catch (err) {
    return handleError(err, requestId);
  }
}
