// ============================================================
// TYPES — All shared types for POS + Inventory Management
// Separation of Concern: types berdiri sendiri, tidak dicampur
// di component files.
// ============================================================

// --- Product ---
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
  category?: CategoryData;
  supplier?: SupplierData | null;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateProductInput extends Partial<CreateProductInput> {}

// --- Category ---
export interface CategoryData {
  id: number;
  name: string;
  description: string | null;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

// --- Supplier ---
export interface SupplierData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

// --- Customer ---
export interface CustomerData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count?: { transactions: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

// --- Transaction ---
export interface TransactionData {
  id: number;
  invoiceNo: string;
  customerId: number | null;
  cashierId: number;
  total: number;
  paidAmount: number;
  change: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  customer?: CustomerData | null;
  cashier?: { id: number; name: string; email: string };
  items?: TransactionItemData[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItemData {
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: ProductData;
}

export interface CreateTransactionInput {
  customerId?: number | null;
  items: { productId: number; quantity: number; price: number }[];
  paidAmount: number;
}

// --- Stock History ---
export interface StockHistoryData {
  id: number;
  productId: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  note: string | null;
  product?: ProductData;
  createdAt: string;
}

export interface CreateStockHistoryInput {
  productId: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  note?: string | null;
}

// --- Dashboard ---
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  todaySales: number;
  todayTransactions: number;
  lowStockProducts: number;
  monthlyRevenue: number;
}

export interface SalesChartData {
  date: string;
  total: number;
  count: number;
}

export interface TopProductData {
  id: number;
  name: string;
  totalSold: number;
  revenue: number;
}

// --- API Response Wrapper ---
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// --- Pagination ---
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
