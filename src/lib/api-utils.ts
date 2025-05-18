import { getAuthSession } from "@/lib/auth";
import { Role } from "@prisma/client";
import { z } from "zod";
import { NextResponse } from "next/server";

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

export async function withAdminAuth<T>(
  handler: () => Promise<ApiResponse<T>>
): Promise<Response> {
  try {
    const session = await getAuthSession();

    if (
      !session?.user ||
      (session.user.role !== Role.ADMIN &&
        session.user.role !== Role.SUPERADMIN)
    ) {
      return createResponse({ error: "Unauthorized", status: 401 });
    }

    const result = await handler();
    return createResponse(result);
  } catch (error) {
    console.error("API Error:", error);
    return createResponse({
      error: "An unexpected error occurred",
      status: 500,
    });
  }
}

export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; error?: string }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.message };
    }
    throw error;
  }
}

export function createResponse<T>({
  data,
  error,
  status = 200,
}: ApiResponse<T>): Response {
  const body = error ? { error } : { data };
  return new Response(JSON.stringify(body), { status });
}

export function getQueryParam(req: Request, param: string): string | null {
  const { searchParams } = new URL(req.url);
  return searchParams.get(param);
}

export async function validateResourceOwnership<T>(
  finder: () => Promise<T | null>,
  errorMessage = "Resource not found"
): Promise<{ resource?: T; error?: string; status?: number }> {
  const resource = await finder();

  if (!resource) {
    return { error: errorMessage, status: 404 };
  }

  return { resource };
}
