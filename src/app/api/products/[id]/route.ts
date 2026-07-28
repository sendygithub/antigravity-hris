import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized } from "@/lib/auth";
import * as productService from "@/services/product.service";
import { updateProductSchema } from "@/schemas";

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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
    }

    const product = await productService.getById(productId);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error in GET /api/products/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const product = await productService.update(productId, parsed.data);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error in PATCH /api/products/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await checkAuth();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
    }

    const product = await productService.remove(productId);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error in DELETE /api/products/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
