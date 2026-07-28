import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("🌱 Seeding POS database...");

  // ── Users ────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);
  const cashierPassword = await bcrypt.hash("cashier123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@company.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: "cashier@company.com" },
    update: {},
    create: {
      name: "Cashier User",
      email: "cashier@company.com",
      password: cashierPassword,
      role: "CASHIER",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@company.com" },
    update: {},
    create: {
      name: "Manager User",
      email: "manager@company.com",
      password: managerPassword,
      role: "MANAGER",
    },
  });

  console.log(
    `  ✅ Users: ${admin.name} (ADMIN), ${cashier.name} (CASHIER), ${manager.name} (MANAGER)`,
  );

  // ── Categories ───────────────────────────────────────────────────
  const categoryData = [
    { name: "Makanan Ringan", description: "Snack dan cemilan" },
    { name: "Minuman", description: "Minuman ringan dan kemasan" },
    { name: "Makanan Berat", description: "Makanan siap saji" },
    { name: "Alat Tulis", description: "ATK dan perlengkapan kantor" },
    {
      name: "Elektronik",
      description: "Aksesoris dan perlengkapan elektronik",
    },
    { name: "Kebersihan", description: "Produk kebersihan dan perawatan" },
    {
      name: "Minuman Kemasan",
      description: "Minuman dalam kemasan botol/kaleng",
    },
    { name: "Rokok", description: "Produk tembakau" },
    { name: "Obat-obatan", description: "Obat bebas dan suplemen" },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      }),
    ),
  );
  console.log(`  ✅ Categories: ${categories.length} created`);

  // ── Suppliers ────────────────────────────────────────────────────
  const supplierData = [
    {
      name: "PT Indofood Sukses Makmur",
      email: "indofood@example.com",
      phone: "021-12345678",
      address: "Jakarta",
    },
    {
      name: "PT Unilever Indonesia",
      email: "unilever@example.com",
      phone: "021-23456789",
      address: "Tangerang",
    },
    {
      name: "CV Maju Jaya",
      email: "majujaya@example.com",
      phone: "021-34567890",
      address: "Bekasi",
    },
    {
      name: "PT Coca-Cola Indonesia",
      email: "cocacola@example.com",
      phone: "021-45678901",
      address: "Jakarta",
    },
    {
      name: "PT Djarum",
      email: "djarum@example.com",
      phone: "021-56789012",
      address: "Kudus",
    },
    {
      name: "PT Kimia Farma",
      email: "kimiafarma@example.com",
      phone: "021-67890123",
      address: "Jakarta",
    },
    {
      name: "PT Nestle Indonesia",
      email: "nestle@example.com",
      phone: "021-78901234",
      address: "Jakarta",
    },
    {
      name: "PT Wings Group",
      email: "wings@example.com",
      phone: "021-89012345",
      address: "Surabaya",
    },
  ];

  const suppliers = await Promise.all(
    supplierData.map((s) =>
      prisma.supplier.upsert({
        where: { name: s.name },
        update: {},
        create: s,
      }),
    ),
  );
  console.log(`  ✅ Suppliers: ${suppliers.length} created`);

  // ── Customers ────────────────────────────────────────────────────
  const customerData = [
    { name: "Pelanggan Umum", email: null, phone: null, address: null },
    {
      name: "Budi Santoso",
      email: "budi@example.com",
      phone: "08123456789",
      address: "Jl. Merdeka No. 1, Jakarta",
    },
    {
      name: "Siti Rahayu",
      email: "siti@example.com",
      phone: "08198765432",
      address: "Jl. Sudirman No. 5, Bandung",
    },
    {
      name: "Ahmad Rizki",
      email: "ahmad@example.com",
      phone: "08234567890",
      address: "Jl. Gatot Subroto No. 10, Tangerang",
    },
    {
      name: "Dewi Lestari",
      email: "dewi@example.com",
      phone: "08345678901",
      address: "Jl. Thamrin No. 15, Jakarta",
    },
    {
      name: "Rudi Hartono",
      email: "rudi@example.com",
      phone: "08456789012",
      address: "Jl. Diponegoro No. 20, Surabaya",
    },
    {
      name: "Ani Wijaya",
      email: "ani@example.com",
      phone: "08567890123",
      address: "Jl. Ahmad Yani No. 8, Medan",
    },
    {
      name: "Tono Suhartono",
      email: "tono@example.com",
      phone: "08678901234",
      address: "Jl. Pahlawan No. 3, Semarang",
    },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.customer.upsert({
        where: { name: c.name },
        update: {},
        create: c,
      }),
    ),
  );
  console.log(`  ✅ Customers: ${customers.length} created`);

  // ── Products ─────────────────────────────────────────────────────
  const productData = [
    // Makanan Ringan (index 0)
    {
      name: "Indomie Goreng",
      sku: "IDM-001",
      barcode: "8991002101234",
      price: 3500,
      cost: 2800,
      stock: 200,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: "Indomie Kuah Soto",
      sku: "IDM-002",
      barcode: "8991002101241",
      price: 3500,
      cost: 2800,
      stock: 150,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: "Lays Classic 68g",
      sku: "LAYS-001",
      barcode: "8992772888888",
      price: 12000,
      cost: 9000,
      stock: 2,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: "Tango Wafer Coklat",
      sku: "TNG-001",
      barcode: "8991002201234",
      price: 8000,
      cost: 6000,
      stock: 75,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: "Oreo Original 137g",
      sku: "OREO-001",
      barcode: "8991002301234",
      price: 10000,
      cost: 7500,
      stock: 60,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: "Chitato Sapi Panggang 68g",
      sku: "CHT-001",
      barcode: "8991002401234",
      price: 11000,
      cost: 8500,
      stock: 45,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: "Silver Queen 62g",
      sku: "SQ-001",
      barcode: "8991002501234",
      price: 15000,
      cost: 12000,
      stock: 30,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    // Minuman (index 1)
    {
      name: "Aqua 600ml",
      sku: "AQUA-001",
      barcode: "8992772111111",
      price: 5000,
      cost: 3500,
      stock: 300,
      categoryId: categories[1].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Teh Botol Sosro 500ml",
      sku: "SOSRO-001",
      barcode: "8992772777777",
      price: 6000,
      cost: 4000,
      stock: 120,
      categoryId: categories[6].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Pocari Sweat 500ml",
      sku: "POC-001",
      barcode: "8992772222222",
      price: 8000,
      cost: 5500,
      stock: 90,
      categoryId: categories[1].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Coca-Cola 330ml Kaleng",
      sku: "CC-001",
      barcode: "8992772133333",
      price: 7000,
      cost: 5000,
      stock: 180,
      categoryId: categories[6].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Fanta Strawberry 330ml",
      sku: "FNT-001",
      barcode: "8992772144444",
      price: 7000,
      cost: 5000,
      stock: 100,
      categoryId: categories[6].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Sprite 330ml",
      sku: "SPR-001",
      barcode: "8992772155555",
      price: 7000,
      cost: 5000,
      stock: 95,
      categoryId: categories[6].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Kopi Kapal Api 200ml",
      sku: "KOPI-001",
      barcode: "8992772333333",
      price: 5000,
      cost: 3500,
      stock: 140,
      categoryId: categories[1].id,
      supplierId: suppliers[6].id,
    },
    // Makanan Berat (index 2)
    {
      name: "Nasi Goreng Siap Saji",
      sku: "MKN-001",
      barcode: null,
      price: 15000,
      cost: 10000,
      stock: 50,
      categoryId: categories[2].id,
      supplierId: null,
    },
    {
      name: "Mie Ayam Siap Saji",
      sku: "MKN-002",
      barcode: null,
      price: 12000,
      cost: 8000,
      stock: 40,
      categoryId: categories[2].id,
      supplierId: null,
    },
    {
      name: "Nasi Uduk Siap Saji",
      sku: "MKN-003",
      barcode: null,
      price: 13000,
      cost: 9000,
      stock: 35,
      categoryId: categories[2].id,
      supplierId: null,
    },
    // Alat Tulis (index 3)
    {
      name: "Pulpen Standard AE7",
      sku: "ATK-001",
      barcode: "8993088111111",
      price: 3000,
      cost: 2000,
      stock: 500,
      categoryId: categories[3].id,
      supplierId: suppliers[2].id,
    },
    {
      name: "Buku Tulis Sidu 38 Lembar",
      sku: "ATK-002",
      barcode: "8993088222222",
      price: 5000,
      cost: 3500,
      stock: 0,
      categoryId: categories[3].id,
      supplierId: suppliers[2].id,
    },
    {
      name: "Pensil 2B Faber-Castell",
      sku: "ATK-003",
      barcode: "8993088333333",
      price: 4000,
      cost: 2500,
      stock: 200,
      categoryId: categories[3].id,
      supplierId: suppliers[2].id,
    },
    {
      name: "Penghapus Joyko",
      sku: "ATK-004",
      barcode: "8993088444444",
      price: 2000,
      cost: 1000,
      stock: 150,
      categoryId: categories[3].id,
      supplierId: suppliers[2].id,
    },
    {
      name: "Spidol Snowman",
      sku: "ATK-005",
      barcode: "8993088555555",
      price: 8000,
      cost: 5500,
      stock: 80,
      categoryId: categories[3].id,
      supplierId: suppliers[2].id,
    },
    // Elektronik (index 4)
    {
      name: "Charger USB Cable",
      sku: "ELC-001",
      barcode: "8991234567890",
      price: 25000,
      cost: 15000,
      stock: 40,
      categoryId: categories[4].id,
      supplierId: null,
    },
    {
      name: "Power Bank 10000mAh",
      sku: "ELC-002",
      barcode: "8991234567891",
      price: 85000,
      cost: 60000,
      stock: 15,
      categoryId: categories[4].id,
      supplierId: null,
    },
    {
      name: "Earphone Wired",
      sku: "ELC-003",
      barcode: "8991234567892",
      price: 35000,
      cost: 20000,
      stock: 25,
      categoryId: categories[4].id,
      supplierId: null,
    },
    {
      name: "Mouse USB",
      sku: "ELC-004",
      barcode: "8991234567893",
      price: 45000,
      cost: 30000,
      stock: 4,
      categoryId: categories[4].id,
      supplierId: null,
    },
    // Kebersihan (index 5)
    {
      name: "Sabun Lifebuoy 100ml",
      sku: "LFB-001",
      barcode: "8992772555555",
      price: 12000,
      cost: 9000,
      stock: 85,
      categoryId: categories[5].id,
      supplierId: suppliers[1].id,
    },
    {
      name: "Pasta Gigi Pepsodent 120g",
      sku: "PEP-001",
      barcode: "8992772666666",
      price: 10000,
      cost: 7500,
      stock: 3,
      categoryId: categories[5].id,
      supplierId: suppliers[1].id,
    },
    {
      name: "Shampoo Clear 100ml",
      sku: "CLR-001",
      barcode: "8992772777778",
      price: 14000,
      cost: 10000,
      stock: 55,
      categoryId: categories[5].id,
      supplierId: suppliers[1].id,
    },
    {
      name: "Sabun Cuci Piring Sunlight 450ml",
      sku: "SUN-001",
      barcode: "8992772888889",
      price: 15000,
      cost: 11000,
      stock: 70,
      categoryId: categories[5].id,
      supplierId: suppliers[7].id,
    },
    {
      name: "Pembersih Lantai So Klin 800ml",
      sku: "SKL-001",
      barcode: "8992772999990",
      price: 18000,
      cost: 13000,
      stock: 40,
      categoryId: categories[5].id,
      supplierId: suppliers[7].id,
    },
    // Rokok (index 7)
    {
      name: "Rokok Sampoerna Mild 16",
      sku: "ROK-001",
      barcode: "8992772000001",
      price: 28000,
      cost: 25000,
      stock: 100,
      categoryId: categories[7].id,
      supplierId: suppliers[4].id,
    },
    {
      name: "Rokok Djarum Super 12",
      sku: "ROK-002",
      barcode: "8992772000002",
      price: 22000,
      cost: 19000,
      stock: 80,
      categoryId: categories[7].id,
      supplierId: suppliers[4].id,
    },
    // Obat-obatan (index 8)
    {
      name: "Paracetamol 500mg",
      sku: "OBT-001",
      barcode: "8992772000003",
      price: 8000,
      cost: 5000,
      stock: 200,
      categoryId: categories[8].id,
      supplierId: suppliers[5].id,
    },
    {
      name: "Antangin JRG",
      sku: "OBT-002",
      barcode: "8992772000004",
      price: 3000,
      cost: 2000,
      stock: 150,
      categoryId: categories[8].id,
      supplierId: suppliers[5].id,
    },
    {
      name: "Bodrex",
      sku: "OBT-003",
      barcode: "8992772000005",
      price: 4000,
      cost: 2500,
      stock: 180,
      categoryId: categories[8].id,
      supplierId: suppliers[5].id,
    },
  ];

  for (const p of productData) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log(`  ✅ Products: ${productData.length} created`);

  // ── Get all products for transactions ────────────────────────────
  const allProducts = await prisma.product.findMany({ orderBy: { id: "asc" } });

  // ── Helper to create date in the past ────────────────────────────
  function daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(
      8 + Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 60),
      0,
      0,
    );
    return d;
  }

  // ── Stock Histories (IN - initial stock) ─────────────────────────
  const existingStockHistories = await prisma.stockHistory.count();
  if (existingStockHistories === 0) {
    for (const product of allProducts) {
      if (product.stock > 0) {
        await prisma.stockHistory.create({
          data: {
            productId: product.id,
            type: "IN",
            quantity: product.stock,
            note: "Initial stock",
            createdAt: daysAgo(60),
          },
        });
      }
    }
    console.log(
      `  ✅ Initial stock histories created for ${allProducts.length} products`,
    );
  }

  // ── Sample Transactions ──────────────────────────────────────────
  const existingTxCount = await prisma.transaction.count();
  if (existingTxCount === 0) {
    const transactionData = [
      // Transaction 1: 30 days ago - small purchase
      {
        invoiceNo: "INV-20250628-001",
        daysAgo: 30,
        cashierId: cashier.id,
        customerId: customers[1].id,
        items: [
          {
            productId: allProducts[0].id,
            quantity: 5,
            price: Number(allProducts[0].price),
          },
          {
            productId: allProducts[1].id,
            quantity: 3,
            price: Number(allProducts[1].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 2: 28 days ago - larger purchase
      {
        invoiceNo: "INV-20250630-001",
        daysAgo: 28,
        cashierId: cashier.id,
        customerId: customers[2].id,
        items: [
          {
            productId: allProducts[7].id,
            quantity: 10,
            price: Number(allProducts[7].price),
          },
          {
            productId: allProducts[10].id,
            quantity: 6,
            price: Number(allProducts[10].price),
          },
          {
            productId: allProducts[13].id,
            quantity: 4,
            price: Number(allProducts[13].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 3: 25 days ago
      {
        invoiceNo: "INV-20250703-001",
        daysAgo: 25,
        cashierId: admin.id,
        customerId: customers[3].id,
        items: [
          {
            productId: allProducts[14].id,
            quantity: 2,
            price: Number(allProducts[14].price),
          },
          {
            productId: allProducts[15].id,
            quantity: 3,
            price: Number(allProducts[15].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 4: 21 days ago - big purchase
      {
        invoiceNo: "INV-20250707-001",
        daysAgo: 21,
        cashierId: cashier.id,
        customerId: customers[4].id,
        items: [
          {
            productId: allProducts[3].id,
            quantity: 8,
            price: Number(allProducts[3].price),
          },
          {
            productId: allProducts[4].id,
            quantity: 5,
            price: Number(allProducts[4].price),
          },
          {
            productId: allProducts[5].id,
            quantity: 4,
            price: Number(allProducts[5].price),
          },
          {
            productId: allProducts[6].id,
            quantity: 3,
            price: Number(allProducts[6].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 5: 18 days ago
      {
        invoiceNo: "INV-20250710-001",
        daysAgo: 18,
        cashierId: cashier.id,
        customerId: customers[1].id,
        items: [
          {
            productId: allProducts[8].id,
            quantity: 4,
            price: Number(allProducts[8].price),
          },
          {
            productId: allProducts[9].id,
            quantity: 2,
            price: Number(allProducts[9].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 6: 15 days ago - cancelled
      {
        invoiceNo: "INV-20250713-001",
        daysAgo: 15,
        cashierId: cashier.id,
        customerId: customers[5].id,
        items: [
          {
            productId: allProducts[11].id,
            quantity: 3,
            price: Number(allProducts[11].price),
          },
          {
            productId: allProducts[12].id,
            quantity: 2,
            price: Number(allProducts[12].price),
          },
        ],
        status: "CANCELLED" as const,
      },
      // Transaction 7: 12 days ago
      {
        invoiceNo: "INV-20250716-001",
        daysAgo: 12,
        cashierId: admin.id,
        customerId: customers[6].id,
        items: [
          {
            productId: allProducts[17].id,
            quantity: 10,
            price: Number(allProducts[17].price),
          },
          {
            productId: allProducts[19].id,
            quantity: 5,
            price: Number(allProducts[19].price),
          },
          {
            productId: allProducts[20].id,
            quantity: 8,
            price: Number(allProducts[20].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 8: 10 days ago
      {
        invoiceNo: "INV-20250718-001",
        daysAgo: 10,
        cashierId: cashier.id,
        customerId: customers[2].id,
        items: [
          {
            productId: allProducts[21].id,
            quantity: 2,
            price: Number(allProducts[21].price),
          },
          {
            productId: allProducts[22].id,
            quantity: 1,
            price: Number(allProducts[22].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 9: 7 days ago
      {
        invoiceNo: "INV-20250721-001",
        daysAgo: 7,
        cashierId: cashier.id,
        customerId: customers[7].id,
        items: [
          {
            productId: allProducts[24].id,
            quantity: 3,
            price: Number(allProducts[24].price),
          },
          {
            productId: allProducts[25].id,
            quantity: 2,
            price: Number(allProducts[25].price),
          },
          {
            productId: allProducts[26].id,
            quantity: 4,
            price: Number(allProducts[26].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 10: 5 days ago - pending
      {
        invoiceNo: "INV-20250723-001",
        daysAgo: 5,
        cashierId: cashier.id,
        customerId: customers[3].id,
        items: [
          {
            productId: allProducts[30].id,
            quantity: 2,
            price: Number(allProducts[30].price),
          },
          {
            productId: allProducts[31].id,
            quantity: 1,
            price: Number(allProducts[31].price),
          },
        ],
        status: "PENDING" as const,
      },
      // Transaction 11: 3 days ago
      {
        invoiceNo: "INV-20250725-001",
        daysAgo: 3,
        cashierId: admin.id,
        customerId: customers[4].id,
        items: [
          {
            productId: allProducts[0].id,
            quantity: 8,
            price: Number(allProducts[0].price),
          },
          {
            productId: allProducts[7].id,
            quantity: 6,
            price: Number(allProducts[7].price),
          },
          {
            productId: allProducts[10].id,
            quantity: 4,
            price: Number(allProducts[10].price),
          },
          {
            productId: allProducts[13].id,
            quantity: 5,
            price: Number(allProducts[13].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 12: 1 day ago
      {
        invoiceNo: "INV-20250727-001",
        daysAgo: 1,
        cashierId: cashier.id,
        customerId: customers[1].id,
        items: [
          {
            productId: allProducts[2].id,
            quantity: 3,
            price: Number(allProducts[2].price),
          },
          {
            productId: allProducts[14].id,
            quantity: 2,
            price: Number(allProducts[14].price),
          },
        ],
        status: "PAID" as const,
      },
      // Transaction 13: today
      {
        invoiceNo: "INV-20250728-001",
        daysAgo: 0,
        cashierId: cashier.id,
        customerId: null,
        items: [
          {
            productId: allProducts[7].id,
            quantity: 4,
            price: Number(allProducts[7].price),
          },
          {
            productId: allProducts[8].id,
            quantity: 2,
            price: Number(allProducts[8].price),
          },
          {
            productId: allProducts[17].id,
            quantity: 3,
            price: Number(allProducts[17].price),
          },
        ],
        status: "PAID" as const,
      },
    ];

    for (const tx of transactionData) {
      const itemsData = tx.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const total = itemsData.reduce((sum, item) => sum + item.subtotal, 0);
      const paidAmount = tx.status === "PAID" ? total : 0;
      const change = paidAmount - total;

      const createdAt = daysAgo(tx.daysAgo);

      await prisma.transaction.create({
        data: {
          invoiceNo: tx.invoiceNo,
          cashierId: tx.cashierId,
          customerId: tx.customerId,
          total,
          paidAmount,
          change,
          status: tx.status,
          createdAt,
          items: { create: itemsData },
        },
      });

      // Create stock histories and update stock for PAID transactions
      if (tx.status === "PAID") {
        for (const item of tx.items) {
          await prisma.stockHistory.create({
            data: {
              productId: item.productId,
              type: "OUT",
              quantity: item.quantity,
              note: `Transaction ${tx.invoiceNo}`,
              createdAt,
            },
          });

          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    console.log(
      `  ✅ ${transactionData.length} sample transactions created with stock histories`,
    );
  } else {
    console.log(
      `  ⏭️  Transactions already exist (${existingTxCount}), skipping transaction seed`,
    );
  }

  // ── Additional Stock Movements ───────────────────────────────────
  const existingMovements = await prisma.stockHistory.count();
  const expectedMinMovements = 30; // initial stock entries + transaction entries

  if (existingMovements < expectedMinMovements) {
    // Add some IN movements (restock)
    const restockMovements = [
      {
        productId: allProducts[0].id,
        quantity: 50,
        note: "Restock - weekly delivery",
        daysAgo: 20,
      },
      {
        productId: allProducts[7].id,
        quantity: 100,
        note: "Restock - large shipment",
        daysAgo: 14,
      },
      {
        productId: allProducts[10].id,
        quantity: 60,
        note: "Restock - distributor",
        daysAgo: 10,
      },
      {
        productId: allProducts[17].id,
        quantity: 200,
        note: "Restock - monthly order",
        daysAgo: 7,
      },
      {
        productId: allProducts[24].id,
        quantity: 30,
        note: "Restock - supplier",
        daysAgo: 5,
      },
      {
        productId: allProducts[30].id,
        quantity: 50,
        note: "Restock - warehouse transfer",
        daysAgo: 3,
      },
    ];

    for (const mov of restockMovements) {
      const exists = await prisma.stockHistory.findFirst({
        where: { productId: mov.productId, type: "IN", note: mov.note },
      });
      if (!exists) {
        await prisma.stockHistory.create({
          data: {
            productId: mov.productId,
            type: "IN",
            quantity: mov.quantity,
            note: mov.note,
            createdAt: daysAgo(mov.daysAgo),
          },
        });
        await prisma.product.update({
          where: { id: mov.productId },
          data: { stock: { increment: mov.quantity } },
        });
      }
    }

    // Add some ADJUSTMENT movements
    const adjustmentMovements = [
      {
        productId: allProducts[18].id,
        quantity: 5,
        note: "Stock opname - found missing",
        daysAgo: 12,
      },
      {
        productId: allProducts[23].id,
        quantity: -2,
        note: "Stock opname - damaged item",
        daysAgo: 8,
      },
      {
        productId: allProducts[27].id,
        quantity: 3,
        note: "Stock opname - correction",
        daysAgo: 6,
      },
    ];

    for (const mov of adjustmentMovements) {
      const exists = await prisma.stockHistory.findFirst({
        where: { productId: mov.productId, type: "ADJUSTMENT", note: mov.note },
      });
      if (!exists) {
        await prisma.stockHistory.create({
          data: {
            productId: mov.productId,
            type: "ADJUSTMENT",
            quantity: Math.abs(mov.quantity),
            note: mov.note,
            createdAt: daysAgo(mov.daysAgo),
          },
        });
        await prisma.product.update({
          where: { id: mov.productId },
          data: { stock: { increment: mov.quantity } },
        });
      }
    }

    console.log(`  ✅ Additional stock movements created`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("  Login admin:   admin@company.com / admin123");
  console.log("  Login cashier:  cashier@company.com / cashier123");
  console.log("  Login manager:  manager@company.com / manager123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
