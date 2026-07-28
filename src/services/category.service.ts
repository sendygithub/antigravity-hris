import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryData {
  id: number;
  name: string;
  description: string | null;
  _count?: { products: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
}

export async function getAll(params: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
} = {}): Promise<PaginatedResult<CategoryData>> {
  const {
    search,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = params;

  const where: Prisma.CategoryWhereInput = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const orderBy: Prisma.CategoryOrderByWithRelationInput = { [sort]: order };

  const [total, data] = await prisma.$transaction([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return {
    data: data as unknown as CategoryData[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getById(
  id: number
): Promise<CategoryData | null> {
  const record = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  return record as unknown as CategoryData | null;
}

export async function create(
  input: CreateCategoryInput
): Promise<CategoryData> {
  const record = await prisma.category.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });
  return record as unknown as CategoryData;
}

export async function update(
  id: number,
  input: UpdateCategoryInput
): Promise<CategoryData | null> {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;

  try {
    const record = await prisma.category.update({
      where: { id },
      data,
    });
    return record as unknown as CategoryData;
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}

export async function remove(id: number): Promise<CategoryData | null> {
  try {
    const record = await prisma.category.delete({ where: { id } });
    return record as unknown as CategoryData;
  } catch (e: any) {
    if (e.code === "P2025") return null;
    throw e;
  }
}
