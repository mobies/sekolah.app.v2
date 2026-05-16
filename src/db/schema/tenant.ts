import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// Users: Students, Teachers, Staff, Partners, Finance
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["STUDENT", "TEACHER", "STAFF", "FINANCE", "PARTNER", "ADMIN"] }).notNull(),
  metadata: text("metadata", { mode: "json" }), // For student/staff specific info
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  roleIdx: index("role_idx").on(table.role),
}));

// Wallets for Uang Jajan (Managed via Durable Objects)
export const wallets = sqliteTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  balance: real("balance").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index("wallet_user_idx").on(table.userId),
}));

export const walletTransactions = sqliteTable("wallet_transactions", {
  id: text("id").primaryKey(),
  walletId: text("wallet_id").notNull().references(() => wallets.id),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["TOPUP", "PURCHASE", "REFUND", "TRANSFER"] }).notNull(),
  description: text("description"),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  walletIdIdx: index("tx_wallet_idx").on(table.walletId),
}));

// --- NEW: Tabungan Siswa (Savings) ---
export const savingsAccounts = sqliteTable("savings_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["WAJIB", "SUKARELA"] }).notNull(),
  balance: real("balance").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  userSavingsIdx: index("savings_user_idx").on(table.userId),
}));

export const savingsTransactions = sqliteTable("savings_transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => savingsAccounts.id),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["DEPOSIT", "WITHDRAWAL"] }).notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// --- NEW: Sistem Tagihan & SPP (Billing) ---
export const billingItems = sqliteTable("billing_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["MONTHLY", "YEARLY", "INCIDENTAL"] }).notNull(),
  defaultAmount: real("default_amount").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const studentBills = sqliteTable("student_bills", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  billingItemId: text("billing_item_id").notNull().references(() => billingItems.id),
  amount: real("amount").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  status: text("status", { enum: ["UNPAID", "PARTIAL", "PAID"] }).default("UNPAID"),
  dueDate: integer("due_date", { mode: "timestamp" }),
  period: text("period"), // e.g., "2026-05" for monthly
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  billUserIdx: index("bill_user_idx").on(table.userId),
}));

export const billPayments = sqliteTable("bill_payments", {
  id: text("id").primaryKey(),
  billId: text("bill_id").notNull().references(() => studentBills.id),
  amount: real("amount").notNull(),
  method: text("method", { enum: ["WALLET", "CASH", "TRANSFER"] }).notNull(),
  processedBy: text("processed_by").references(() => users.id), // e.g., Finance Staff ID if cash
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Inventory & Marketplace Orders
export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  partnerId: text("partner_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const marketOrders = sqliteTable("market_orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  partnerId: text("partner_id").notNull().references(() => users.id),
  totalAmount: real("total_amount").notNull(),
  status: text("status", { enum: ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"] }).default("PENDING"),
  pickupTime: text("pickup_time"), // e.g., "Break 1" or timestamp
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const marketOrderItems = sqliteTable("market_order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => marketOrders.id),
  inventoryId: text("inventory_id").notNull().references(() => inventory.id),
  quantity: integer("quantity").notNull(),
  priceAtTime: real("price_at_time").notNull(),
});

// Other Existing Tables (Registrations, Logistics, Attendance, Materials, Grades)
export const registrations = sqliteTable("registrations", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["STUDENT", "STAFF"] }).notNull(),
  biodata: text("biodata", { mode: "json" }).notNull(),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] }).default("PENDING"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const busRoutes = sqliteTable("bus_routes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  driverId: text("driver_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const busLogs = sqliteTable("bus_logs", {
  id: text("id").primaryKey(),
  routeId: text("route_id").notNull().references(() => busRoutes.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  routeIdx: index("bus_route_idx").on(table.routeId),
}));

export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["IN", "OUT"] }).notNull(),
  method: text("method", { enum: ["RFID", "QR", "MANUAL"] }).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdTimestampIdx: index("attendance_user_time_idx").on(table.userId, table.timestamp),
}));

export const materials = sqliteTable("materials", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  classId: text("class_id").notNull(),
  teacherId: text("teacher_id").notNull().references(() => users.id),
  fileKey: text("file_key").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  classIdx: index("material_class_idx").on(table.classId),
}));

export const academicGrades = sqliteTable("academic_grades", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  examId: text("exam_id").notNull(),
  subject: text("subject").notNull(),
  score: real("score").notNull(),
  maxScore: real("max_score").notNull().default(100),
  syncedAt: integer("synced_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdExamIdx: index("grade_user_exam_idx").on(table.userId, table.examId),
}));

export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type AcademicGrade = typeof academicGrades.$inferSelect;
export type SavingsAccount = typeof savingsAccounts.$inferSelect;
export type StudentBill = typeof studentBills.$inferSelect;
export type MarketOrder = typeof marketOrders.$inferSelect;
