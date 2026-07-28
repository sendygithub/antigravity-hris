import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count?: { transactions: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export async function getAll(params: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
} = {}): Promise<PaginatedResult<CustomerData>> {
  const {
    search,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = params;

  const where: Prisma.CustomerWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.CustomerOrderByWithRelationInput = { [sort]: order };

  const [total, data] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { transactions: true } } },
    }),
  ]);

  return {
    data: data as unknown as CustomerData[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getById(
  id: number
): Promise<CustomerData | null> {
  const record = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { transactions: true } } },
  });
  return record as unknown as CustomerData | null;
}

export async function create(
  input: CreateCustomerInput
): Promise<CustomerData> {
  const record = await prisma.customer.create({
    data: {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });
  return record as unknown as CustomerData;
}

export async function update(
  id: number,
  input: UpdateCustomerInput
): Promise<CustomerData | null> {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.address !== undefined) data.address = input.address;

  try {
    const record = await prisma.customer.update({ where: { id }, data });
    return record as unknown as CustomerData;
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number): Promise<CustomerData | null> {
  try {
    const record = await prisma.customer.delete({ where: { id } });
    return record as unknown as CustomerData;
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}
