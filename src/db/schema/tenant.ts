import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// Users: Students, Teachers, Staff, Partners
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["STUDENT", "TEACHER", "STAFF", "PARTNER", "ADMIN"] }).notNull(),
  metadata: text("metadata", { mode: "json" }), // For student/staff specific info
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  roleIdx: index("role_idx").on(table.role),
}));

// Wallets for Students/Staff
export const wallets = sqliteTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  balance: real("balance").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index("wallet_user_idx").on(table.userId),
}));

// Wallet Transactions
export const walletTransactions = sqliteTable("wallet_transactions", {
  id: text("id").primaryKey(),
  walletId: text("wallet_id").notNull().references(() => wallets.id),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["TOPUP", "PURCHASE", "REFUND", "TRANSFER"] }).notNull(),
  description: text("description"),
  metadata: text("metadata", { mode: "json" }), // e.g., product details
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  walletIdIdx: index("tx_wallet_idx").on(table.walletId),
}));

// Inventory for Canteen/Koperasi
export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(), // "CANTEEN", "COOP", etc.
  partnerId: text("partner_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Registrations (Student/Staff biodata)
export const registrations = sqliteTable("registrations", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["STUDENT", "STAFF"] }).notNull(),
  biodata: text("biodata", { mode: "json" }).notNull(),
  status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] }).default("PENDING"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Logistics: Bus Routes
export const busRoutes = sqliteTable("bus_routes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  driverId: text("driver_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Logistics: Bus Logs (Coordinates)
export const busLogs = sqliteTable("bus_logs", {
  id: text("id").primaryKey(),
  routeId: text("route_id").notNull().references(() => busRoutes.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  routeIdx: index("bus_route_idx").on(table.routeId),
}));

// Smart Attendance
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["IN", "OUT"] }).notNull(),
  method: text("method", { enum: ["RFID", "QR", "MANUAL"] }).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdTimestampIdx: index("attendance_user_time_idx").on(table.userId, table.timestamp),
}));

// E-Learning Materials
export const materials = sqliteTable("materials", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  classId: text("class_id").notNull(), // Target class/subject
  teacherId: text("teacher_id").notNull().references(() => users.id),
  fileKey: text("file_key").notNull(), // R2 object key
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  classIdx: index("material_class_idx").on(table.classId),
}));

// Academic Grades (Pushed from external CBT)
export const academicGrades = sqliteTable("academic_grades", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  examId: text("exam_id").notNull(), // ID from external CBT system
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
