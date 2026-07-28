import { prisma } from "@/lib/db";
import type { Prisma, TransactionStatus } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionItemOutput {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: { id: number; name: string; sku: string };
}

export interface TransactionData {
  id: number;
  invoiceNo: string;
  customerId: number | null;
  cashierId: number;
  total: number;
  paidAmount: number;
  change: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  customer?: { id: number; name: string } | null;
  cashier?: { id: number; name: string } | null;
  items?: TransactionItemOutput[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionItemInput {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateTransactionInput {
  customerId?: number | null;
  cashierId: number;
  items: CreateTransactionItemInput[];
  paidAmount: number;
  status?: "PENDING" | "PAID";
}

const transactionInclude = {
  customer: { select: { id: true, name: true } },
  cashier: { select: { id: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
  },
} as const;

function toTransactionData(record: any): TransactionData {
  return {
    ...record,
    total: Number(record.total),
    paidAmount: Number(record.paidAmount),
    change: Number(record.change),
    items: record.items?.map((item: any) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
  };
}

async function generateInvoiceNo(): Promise<string> {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const prefix = `INV-${dateStr}-`;

  const lastTransaction = await prisma.transaction.findFirst({
    where: { invoiceNo: { startsWith: prefix } },
    orderBy: { invoiceNo: "desc" },
    select: { invoiceNo: true },
  });

  let seq = 1;
  if (lastTransaction) {
    const parts = lastTransaction.invoiceNo.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(3, "0")}`;
}

async function findOrCreateGeneralCustomer(): Promise<number> {
  const existing = await prisma.customer.findFirst({
    where: { name: "Pelanggan Umum" },
  });
  if (existing) return existing.id;

  const created = await prisma.customer.create({
    data: { name: "Pelanggan Umum" },
  });
  return created.id;
}

export async function getAll(params: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  status?: string;
} = {}): Promise<PaginatedResult<TransactionData>> {
  const {
    search,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
    startDate,
    endDate,
    status,
  } = params;

  const where: Prisma.TransactionWhereInput = {};

  if (search) {
    where.OR = [
      { invoiceNo: { contains: search, mode: "insensitive" } },
      {
        customer: {
          name: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  if (status) {
    where.status = status as TransactionStatus;
  }

  const orderBy: Prisma.TransactionOrderByWithRelationInput = {
    [sort]: order,
  };

  const [total, data] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: transactionInclude,
    }),
  ]);

  return {
    data: data.map(toTransactionData),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getById(
  id: number
): Promise<TransactionData | null> {
  const record = await prisma.transaction.findUnique({
    where: { id },
    include: transactionInclude,
  });
  return record ? toTransactionData(record) : null;
}

export async function getByInvoiceNo(
  invoiceNo: string
): Promise<TransactionData | null> {
  const record = await prisma.transaction.findUnique({
    where: { invoiceNo },
    include: transactionInclude,
  });
  return record ? toTransactionData(record) : null;
}

export async function create(
  input: CreateTransactionInput
): Promise<TransactionData> {
  // Determine customer
  let customerId = input.customerId;
  if (!customerId) {
    customerId = await findOrCreateGeneralCustomer();
  }

  // Generate invoice number
  const invoiceNo = await generateInvoiceNo();

  // Validate stock availability for all items
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map<number, { id: number; name: string; stock: number }>(
    products.map((p: { id: number; name: string; stock: number }) => [p.id, p])
  );

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`
      );
    }
  }

  // Calculate totals
  const itemsData = input.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity,
  }));

  const total = itemsData.reduce((sum, item) => sum + item.subtotal, 0);
  const paidAmount = input.paidAmount;
  const change = paidAmount - total;

  if (change < 0) {
    throw new Error(
      `Insufficient payment. Total: ${total}, Paid: ${paidAmount}`
    );
  }

  // Create transaction with items, decrement stock, and create stock histories
  const [transaction] = await prisma.$transaction(
    async (tx: any) => {
    const created = await tx.transaction.create({
      data: {
        invoiceNo,
        customerId,
        cashierId: input.cashierId,
        total,
        paidAmount,
        change,
        status: input.status ?? "PAID",
        items: {
          create: itemsData,
        },
      },
      include: transactionInclude,
    });

    // Decrement stock and create stock history for each item
    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.stockHistory.create({
        data: {
          productId: item.productId,
          type: "OUT",
          quantity: item.quantity,
          note: `Transaction ${invoiceNo}`,
        },
      });
    }

    return [created];
  });

  return toTransactionData(transaction);
}

export async function update(
  id: number,
  input: Partial<CreateTransactionInput> & { status?: "PENDING" | "PAID" | "CANCELLED" }
): Promise<TransactionData | null> {
  // Only allow updating status for existing transactions via this generic update
  const data: Record<string, unknown> = {};
  if (input.status !== undefined) data.status = input.status;
  if (input.customerId !== undefined) data.customerId = input.customerId;

  try {
    const record = await prisma.transaction.update({
      where: { id },
      data,
      include: transactionInclude,
    });
    return toTransactionData(record);
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number): Promise<TransactionData | null> {
  // Delete items first, then the transaction
  try {
    const [record] = await prisma.$transaction([
      prisma.transaction.delete({
        where: { id },
        include: transactionInclude,
      }),
      prisma.transactionItem.deleteMany({ where: { transactionId: id } }),
    ]);
    return toTransactionData(record);
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}

export async function cancel(
  id: number
): Promise<TransactionData> {
  const existing = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existing) throw new Error("Transaction not found");
  if (existing.status === "CANCELLED") {
    throw new Error("Transaction is already cancelled");
  }

  const [record] = await prisma.$transaction(
    async (tx: any) => {
    // Update status to CANCELLED
    const updated = await tx.transaction.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: transactionInclude,
    });

    // Restore stock for each item
    for (const item of existing.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });

      await tx.stockHistory.create({
        data: {
          productId: item.productId,
          type: "IN",
          quantity: item.quantity,
          note: `Cancelled transaction ${existing.invoiceNo}`,
        },
      });
    }

    return [updated];
  });

  return toTransactionData(record);
}

export async function getSalesChart(
  days: number = 30
): Promise<{ date: string; total: number; count: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      status: "PAID",
      createdAt: { gte: startDate },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dailyMap = new Map<string, { total: number; count: number }>();

  for (const tx of transactions) {
    const dateKey = tx.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey) || { total: 0, count: 0 };
    existing.total += Number(tx.total);
    existing.count += 1;
    dailyMap.set(dateKey, existing);
  }

  // Fill in missing dates with zeroes
  const result: { date: string; total: number; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const data = dailyMap.get(dateKey) || { total: 0, count: 0 };
    result.push({ date: dateKey, total: data.total, count: data.count });
  }

  return result;
}

export async function getTopProducts(
  limit: number = 5
): Promise<{ id: number; name: string; totalSold: number; revenue: number }[]> {
  const items = await prisma.transactionItem.findMany({
    where: {
      transaction: { status: "PAID" },
    },
    include: {
      product: { select: { id: true, name: true } },
    },
  });

  const productMap = new Map<
    number,
    { id: number; name: string; totalSold: number; revenue: number }
  >();

  for (const item of items) {
    const existing = productMap.get(item.productId) || {
      id: item.product.id,
      name: item.product.name,
      totalSold: 0,
      revenue: 0,
    };
    existing.totalSold += item.quantity;
    existing.revenue += Number(item.subtotal);
    productMap.set(item.productId, existing);
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
}
