import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertProductSchema, insertTransactionSchema, createTransactionItemSchema } from "@shared/schema";
import { WebSocketServer } from "ws"
import { onWeightUpdate } from "./weightController.ts";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Weight API route
  // app.get("/api/scale/weight", async (req, res) => {
  //   res.json({ weight: getWeight() });
  // });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else if (error.message === "Product not found") {
        res.status(404).json({ error: "Product not found" });
      } else {
        res.status(500).json({ error: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      const items = await storage.getTransactionItems(id);
      res.json({ ...transaction, items });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  // Create transaction with items atomically
  const createTransactionWithItemsSchema = z.object({
    transaction: insertTransactionSchema,
    items: z.array(createTransactionItemSchema)
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const { transaction, items } = createTransactionWithItemsSchema.parse(req.body);
      
      const result = await storage.createTransactionWithItems(
        transaction,
        items
      );
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });

  // Search products by code or name
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const allProducts = await storage.getProducts();
      
      // Filter products by code or name (case-insensitive)
      const filteredProducts = allProducts.filter(product => 
        product.isActive && (
          product.code.toLowerCase().includes(query.toLowerCase()) ||
          product.name.toLowerCase().includes(query.toLowerCase())
        )
      );
      
      res.json(filteredProducts);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" })

  wss.on("connection", (ws) => {
    // console.log("Client connected to the scale")
    ws.on("close", () => {
      // console.log("Client disconnected from the scale")
    })
  })

  onWeightUpdate ((weight)=>{
    const msg = JSON.stringify({ type: "weight", weight });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        // console.log(msg, " fiooooooooo")
        client.send(msg);
      }
    })
  })
  return httpServer;
}
