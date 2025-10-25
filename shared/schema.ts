import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products table for items sold by weight
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(), // Product code for quick search
  name: text("name").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(), // Price per kg/gram
  unit: varchar("unit", { length: 10 }).notNull().default("kg"), // kg or g
  category: text("category"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"), // Tax rate as percentage (0%, 5%, 19%)
  isActive: integer("is_active").notNull().default(1), // 1 for active, 0 for inactive
  createdAt: timestamp("created_at").defaultNow(),
  qrUrlData: text("qr_url_data")
});

// Transaction line items
export const transactionItems = pgTable("transaction_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  productCode: varchar("product_code", { length: 20 }).notNull(), // Store code at time of sale
  productName: text("product_name").notNull(), // Store name at time of sale
  weight: decimal("weight", { precision: 10, scale: 3 }).notNull(), // Weight in selected unit
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(), // Price at time of sale
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // Price × weight
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(), // Tax rate at time of sale
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(), // Tax amount
  total: decimal("total", { precision: 10, scale: 2 }).notNull(), // Subtotal + tax
  unit: varchar("unit", { length: 10 }).notNull(),
});

// Main transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  amountReceived: decimal("amount_received", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  itemCount: integer("item_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  cashierName: text("cashier_name"),
});

// Relations definitions
export const productsRelations = relations(products, ({ many }) => ({
  transactionItems: many(transactionItems),
}));

export const transactionsRelations = relations(transactions, ({ many }) => ({
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionItemSchema = createInsertSchema(transactionItems).omit({
  id: true,
});

// Schema for creating new transaction items (omits transactionId since it's set by the server)
export const createTransactionItemSchema = insertTransactionItemSchema.omit({
  transactionId: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;
export type CreateTransactionItem = z.infer<typeof createTransactionItemSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Cart item for frontend state (before saving to DB)
export const cartItemSchema = z.object({
  productId: z.string(),
  productCode: z.string(),
  productName: z.string(),
  weight: z.number(),
  pricePerUnit: z.number(),
  subtotal: z.number(), // Price × weight
  taxRate: z.number(), // Tax rate as percentage
  taxAmount: z.number(), // Tax amount
  total: z.number(), // Subtotal + tax
  unit: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;