import { z } from "zod";

// ============================================================
// ZOD SCHEMAS — Validasi terpusat, reusable di API & components
// Separation of Concern: logic validasi tidak tersebar.
// ============================================================

// --- Product ---
export const createProductSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  sku: z.string().min(1, "SKU wajib diisi"),
  barcode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.coerce.number().positive("Harga jual harus lebih dari 0"),
  cost: z.coerce.number().min(0, "Harga modal tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif").default(0),
  categoryId: z.coerce.number().int().positive("Kategori wajib dipilih"),
  supplierId: z.coerce.number().int().positive().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// --- Category ---
export const createCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// --- Supplier ---
export const createSupplierSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  email: z.string().email("Email tidak valid").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

// --- Customer ---
export const createCustomerSchema = z.object({
  name: z.string().min(1, "Nama customer wajib diisi"),
  email: z.string().email("Email tidak valid").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// --- Transaction ---
export const createTransactionSchema = z.object({
  customerId: z.coerce.number().int().positive().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1, "Minimal 1 item"),
        price: z.coerce.number().positive(),
      })
    )
    .min(1, "Minimal 1 item dalam transaksi"),
  paidAmount: z.coerce.number().positive("Jumlah bayar harus lebih dari 0"),
});

// --- Stock Adjustment ---
export const createStockAdjustmentSchema = z.object({
  productId: z.coerce.number().int().positive("Produk wajib dipilih"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().min(1, "Quantity minimal 1"),
  note: z.string().nullable().optional(),
});

// --- Auth ---
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
