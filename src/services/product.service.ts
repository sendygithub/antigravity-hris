import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductData {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  categoryId: number;
  supplierId: number | null;
  category?: { id: number; name: string } | null;
  supplier?: { id: number; name: string } | null;
  _count?: { transactionItems: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  price: number;
  cost: number;
  stock?: number;
  categoryId: number;
  supplierId?: number | null;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  barcode?: string | null;
  description?: string | null;
  price?: number;
  cost?: number;
  stock?: number;
  categoryId?: number;
  supplierId?: number | null;
}

const productInclude = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  _count: { select: { transactionItems: true } },
} as const;

function toProductData(record: any): ProductData {
  return {
    ...record,
    price: Number(record.price),
    cost: Number(record.cost),
  };
}

export async function getAll(params: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  categoryId?: number;
  supplierId?: number;
} = {}): Promise<PaginatedResult<ProductData>> {
  const {
    search,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
    categoryId,
    supplierId,
  } = params;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId !== undefined) where.categoryId = categoryId;
  if (supplierId !== undefined) where.supplierId = supplierId;

  const orderBy: Prisma.ProductOrderByWithRelationInput = { [sort]: order };

  const [total, data] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: productInclude,
    }),
  ]);

  return {
    data: data.map(toProductData),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getById(
  id: number
): Promise<ProductData | null> {
  const record = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  return record ? toProductData(record) : null;
}

export async function getBySku(
  sku: string
): Promise<ProductData | null> {
  const record = await prisma.product.findUnique({
    where: { sku },
    include: productInclude,
  });
  return record ? toProductData(record) : null;
}

export async function getByBarcode(
  barcode: string
): Promise<ProductData | null> {
  const record = await prisma.product.findUnique({
    where: { barcode },
    include: productInclude,
  });
  return record ? toProductData(record) : null;
}

export async function create(
  input: CreateProductInput
): Promise<ProductData> {
  const data: Prisma.ProductCreateInput = {
    name: input.name,
    sku: input.sku,
    barcode: input.barcode ?? null,
    description: input.description ?? null,
    price: input.price,
    cost: input.cost,
    stock: input.stock ?? 0,
    category: { connect: { id: input.categoryId } },
  };
  if (input.supplierId) {
    data.supplier = { connect: { id: input.supplierId } };
  }

  const record = await prisma.product.create({
    data,
    include: productInclude,
  });
  return toProductData(record);
}

export async function update(
  id: number,
  input: UpdateProductInput
): Promise<ProductData | null> {
  const data: Prisma.ProductUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.sku !== undefined) data.sku = input.sku;
  if (input.barcode !== undefined) data.barcode = input.barcode;
  if (input.description !== undefined) data.description = input.description;
  if (input.price !== undefined) data.price = input.price;
  if (input.cost !== undefined) data.cost = input.cost;
  if (input.stock !== undefined) data.stock = input.stock;
  if (input.categoryId !== undefined) {
    data.category = { connect: { id: input.categoryId } };
  }
  if (input.supplierId !== undefined) {
    data.supplier =
      input.supplierId === null
        ? { disconnect: true }
        : { connect: { id: input.supplierId } };
  }

  try {
    const record = await prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });
    return toProductData(record);
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number): Promise<ProductData | null> {
  // Check if product is used in any transactions
  const usageCount = await prisma.transactionItem.count({
    where: { productId: id },
  });
  if (usageCount > 0) {
    throw new Error(
      `Cannot delete product: it is used in ${usageCount} transaction(s). Archive it instead.`
    );
  }

  try {
    const record = await prisma.product.delete({
      where: { id },
      include: productInclude,
    });
    return toProductData(record);
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}

export async function getLowStock(
  threshold: number = 10
): Promise<ProductData[]> {
  const records = await prisma.product.findMany({
    where: { stock: { lte: threshold } },
    orderBy: { stock: "asc" },
    include: productInclude,
  });
  return records.map(toProductData);
}

export async function adjustStock(
  id: number,
  quantity: number,
  type: "IN" | "OUT" | "ADJUSTMENT",
  note?: string
): Promise<ProductData> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Product not found");

  let newStock: number;
  switch (type) {
    case "IN":
      newStock = product.stock + quantity;
      break;
    case "OUT":
      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock}, requested: ${quantity}`
        );
      }
      newStock = product.stock - quantity;
      break;
    case "ADJUSTMENT":
      newStock = quantity;
      break;
    default:
      throw new Error(`Invalid stock type: ${type}`);
  }

  const [record] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { stock: newStock },
      include: productInclude,
    }),
    prisma.stockHistory.create({
      data: {
        productId: id,
        type,
        quantity: Math.abs(quantity),
        note: note ?? null,
      },
    }),
  ]);

  return toProductData(record);
}
