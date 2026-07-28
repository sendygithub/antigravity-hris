import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import * as transactionService from "@/services/transaction.service";
import { createTransactionSchema } from "@/schemas";

async function checkAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const rawStatus = searchParams.get("status");
    const status = (["PENDING", "PAID", "CANCELLED"] as const).includes(rawStatus as any)
      ? (rawStatus as "PENDING" | "PAID" | "CANCELLED")
      : undefined;

    const result = await transactionService.getAll({
      search,
      page,
      limit,
      startDate,
      endDate,
      status,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in GET /api/transactions:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const transaction = await transactionService.create({
      ...parsed.data,
      cashierId: session.id,
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/transactions:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
