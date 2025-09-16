import { products, transactions, transactionItems, type Product, type InsertProduct, type Transaction, type InsertTransaction, type TransactionItem, type InsertTransactionItem, type CreateTransactionItem } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: InsertProduct): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Transaction Items
  getTransactionItems(transactionId: string): Promise<TransactionItem[]>;
  createTransactionItem(item: InsertTransactionItem): Promise<TransactionItem>;
  
  // Atomic transaction creation
  createTransactionWithItems(
    transaction: InsertTransaction,
    items: CreateTransactionItem[]
  ): Promise<{ transaction: Transaction; items: TransactionItem[] }>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  // Transaction Items
  async getTransactionItems(transactionId: string): Promise<TransactionItem[]> {
    return await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));
  }

  async createTransactionItem(insertItem: InsertTransactionItem): Promise<TransactionItem> {
    const [item] = await db
      .insert(transactionItems)
      .values(insertItem)
      .returning();
    return item;
  }

  // Atomic transaction creation
  async createTransactionWithItems(
    transaction: InsertTransaction,
    items: CreateTransactionItem[]
  ): Promise<{ transaction: Transaction; items: TransactionItem[] }> {
    return await db.transaction(async (tx) => {
      // First, create the main transaction
      const [createdTransaction] = await tx
        .insert(transactions)
        .values(transaction)
        .returning();

      if (!createdTransaction) {
        throw new Error("Failed to create transaction");
      }

      // Then create all transaction items with the transaction ID
      const createdItems: TransactionItem[] = [];
      
      for (const item of items) {
        const itemWithTransactionId = {
          ...item,
          transactionId: createdTransaction.id,
        };
        
        const [createdItem] = await tx
          .insert(transactionItems)
          .values(itemWithTransactionId)
          .returning();
          
        if (!createdItem) {
          throw new Error("Failed to create transaction item");
        }
        
        createdItems.push(createdItem);
      }

      return {
        transaction: createdTransaction,
        items: createdItems,
      };
    });
  }
}

export const storage = new DatabaseStorage();
