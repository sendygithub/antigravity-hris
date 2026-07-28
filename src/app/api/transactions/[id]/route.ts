import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import * as transactionService from "@/services/transaction.service";

async function checkAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ success: false, error: "Invalid transaction ID" }, { status: 400 });
    }

    const transaction = await transactionService.getById(transactionId);

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Error in GET /api/transactions/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ success: false, error: "Invalid transaction ID" }, { status: 400 });
    }

    const transaction = await transactionService.cancel(transactionId);

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Error in DELETE /api/transactions/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
