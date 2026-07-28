import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockHistoryData {
  id: number;
  productId: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  note: string | null;
  product?: { id: number; name: string; sku: string } | null;
  createdAt: Date;
}

export interface CreateStockHistoryInput {
  productId: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  note?: string | null;
}

const stockInclude = {
  product: { select: { id: true, name: true, sku: true } },
} as const;

export async function getAll(params: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  productId?: number;
} = {}): Promise<PaginatedResult<StockHistoryData>> {
  const {
    search,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
    productId,
  } = params;

  const where: Prisma.StockHistoryWhereInput = {};
  if (search) {
    where.product = {
      name: { contains: search, mode: "insensitive" },
    };
  }
  if (productId !== undefined) {
    where.productId = productId;
  }

  const orderBy: Prisma.StockHistoryOrderByWithRelationInput = {
    [sort]: order,
  };

  const [total, data] = await prisma.$transaction([
    prisma.stockHistory.count({ where }),
    prisma.stockHistory.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: stockInclude,
    }),
  ]);

  return {
    data: data as unknown as StockHistoryData[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getById(
  id: number
): Promise<StockHistoryData | null> {
  const record = await prisma.stockHistory.findUnique({
    where: { id },
    include: stockInclude,
  });
  return record as unknown as StockHistoryData | null;
}

export async function getByProduct(
  productId: number,
  params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  } = {}
): Promise<PaginatedResult<StockHistoryData>> {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = params;

  const where: Prisma.StockHistoryWhereInput = { productId };

  const orderBy: Prisma.StockHistoryOrderByWithRelationInput = {
    [sort]: order,
  };

  const [total, data] = await prisma.$transaction([
    prisma.stockHistory.count({ where }),
    prisma.stockHistory.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: stockInclude,
    }),
  ]);

  return {
    data: data as unknown as StockHistoryData[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function create(
  input: CreateStockHistoryInput
): Promise<StockHistoryData> {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });
  if (!product) throw new Error("Product not found");

  let newStock: number;
  switch (input.type) {
    case "IN":
      newStock = product.stock + input.quantity;
      break;
    case "OUT":
      if (product.stock < input.quantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock}, requested: ${input.quantity}`
        );
      }
      newStock = product.stock - input.quantity;
      break;
    case "ADJUSTMENT":
      newStock = input.quantity;
      break;
    default:
      throw new Error(`Invalid stock type: ${input.type}`);
  }

  const [record] = await prisma.$transaction([
    prisma.stockHistory.create({
      data: {
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        note: input.note ?? null,
      },
      include: stockInclude,
    }),
    prisma.product.update({
      where: { id: input.productId },
      data: { stock: newStock },
    }),
  ]);

  return record as unknown as StockHistoryData;
}

export async function remove(id: number): Promise<StockHistoryData | null> {
  try {
    const record = await prisma.stockHistory.delete({
      where: { id },
      include: stockInclude,
    });
    return record as unknown as StockHistoryData;
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}
