import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count?: { products: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateSupplierInput {
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
} = {}): Promise<PaginatedResult<SupplierData>> {
  const {
    search,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = params;

  const where: Prisma.SupplierWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.SupplierOrderByWithRelationInput = { [sort]: order };

  const [total, data] = await prisma.$transaction([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return {
    data: data as unknown as SupplierData[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getById(
  id: number
): Promise<SupplierData | null> {
  const record = await prisma.supplier.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  return record as unknown as SupplierData | null;
}

export async function create(
  input: CreateSupplierInput
): Promise<SupplierData> {
  const record = await prisma.supplier.create({
    data: {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });
  return record as unknown as SupplierData;
}

export async function update(
  id: number,
  input: UpdateSupplierInput
): Promise<SupplierData | null> {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.address !== undefined) data.address = input.address;

  try {
    const record = await prisma.supplier.update({ where: { id }, data });
    return record as unknown as SupplierData;
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number): Promise<SupplierData | null> {
  try {
    const record = await prisma.supplier.delete({ where: { id } });
    return record as unknown as SupplierData;
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}
