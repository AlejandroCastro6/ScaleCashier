import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import WeightDisplay from "@/components/WeightDisplay";
import ProductGrid from "@/components/ProductGrid";
import ProductSearch from "@/components/ProductSearch";
import TransactionCart from "@/components/TransactionCart";
import PaymentModal from "@/components/PaymentModal";
import ProductManagement from "@/components/ProductManagement";
import TransactionHistory from "@/components/TransactionHistory";
import Header from "@/components/Header";
import { ShoppingCart, Package, History } from "lucide-react";
import type { Product, CartItem, InsertProduct, Transaction, TransactionItem } from "@shared/schema";

// interface TransactionWithItems extends Transaction {
//   items: TransactionItem[];
// }

export default function CashierSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [currentWeight, setCurrentWeight] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pos");

  // API Queries
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // API Mutations
  const createTransactionMutation = useMutation({
    mutationFn: async (data: { transaction: any; items: any[] }) => {
      const response = await apiRequest("POST", "/api/transactions",  data);
      return response.json();
      // return apiRequest('/api/transactions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products",  product);
      return response.json();
      // return apiRequest('/api/products', {
      //   method: "POST",
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(product)
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: InsertProduct }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`,  product);
      return response.json();
      // return apiRequest(`/api/products/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(product)
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
      // return apiRequest(`/api/products/${productId}`, {
      //   method: 'DELETE'
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  // Handlers
  const handleWeightChange = (weight: number) => {
    setCurrentWeight(weight);
  };


  const roundCOP = (value: number) => {
    const reminder = value % 100;
    if (reminder === 0) {
      return value;
    } else if (reminder < 50) {
      return value - reminder + 50;
    }
    else if (reminder === 50) {
      return value;
    } else {
      return value -reminder + 100
    }
  }


  const handleSelectProduct = (product: Product) => {
    if (currentWeight <= 0) {
      toast({
        title: "No Weight Detected",
        description: "Please ensure there's weight on the scale before adding products.",
        variant: "destructive",
      });
      return;
    }
    let subtotal
    if (product.unit === "g") {
      subtotal = (currentWeight * 1000) * parseFloat(product.pricePerUnit);
    } else {
      subtotal = currentWeight * parseFloat(product.pricePerUnit);
    }

    // subtotal = roundCOP(subtotal);
    const taxRate = parseFloat(product.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    let total = subtotal + taxAmount;
    total = roundCOP(total);

    const cartItem: CartItem = {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      weight: currentWeight,
      pricePerUnit: parseFloat(product.pricePerUnit),
      subtotal,
      taxRate,
      taxAmount,
      total,
      unit: product.unit,
    };

    setCartItems(prev => [...prev, cartItem]);
    setSelectedProduct(product);
    
    toast({
      title: "Producto añadido",
      description: `${product.name} (${currentWeight.toFixed(4)} ${product.unit}) agregado al carrito.`,
    });

    console.log("Product added to cart:", cartItem);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Item removido",
      description: "Item removido del carrito.",
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    setSelectedProduct(null);
    toast({
      title: "Carrito limpio",
      description: "Todos los items fueron removidos del carrito.",
    });
  };

  const handleProcessTransaction = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega items al carrito para procesar la transacción.",
        variant: "destructive",
      });
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = (amountReceived: number, change: number) => {
    const total = cartItems.reduce((sum, item) => sum + item.total, 0);
    
    const transaction = {
      total: total.toString(),
      amountReceived: amountReceived.toString(),
      change: change.toString(),
      itemCount: cartItems.length,
      cashierName: "Molino Turó",
    };

    const items = cartItems.map(item => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      weight: item.weight.toString(),
      pricePerUnit: item.pricePerUnit.toString(),
      subtotal: item.subtotal.toString(),
      taxRate: item.taxRate.toString(),
      taxAmount: item.taxAmount.toString(),
      total: item.total.toString(),
      unit: item.unit,
    }));

    createTransactionMutation.mutate({ transaction, items }, {
      onSuccess: () => {
        setCartItems([]);
        setSelectedProduct(null);
        setIsPaymentModalOpen(false);

        toast({
          title: "Transación completada",
          description: `Transacción procesada correctamente. Cambio: $${change.toFixed(0)}`,
        });
      },
      onError: (error) => {
        console.error("Error en la transsacción:", error);
        toast({
          title: "Transacción fallida",
          description: "Fallo al procesar la transacción. Pro favor intente nuevamente.",
          variant: "destructive",
        });
      }
    });
  };

  const handleAddProduct = (product: InsertProduct) => {
    createProductMutation.mutate(product, {
      onSuccess: () => {
        toast({
          title: "Producto añadido",
          description: `${product.name} se ha añadido a la lista de productos.`,
        });
      },
      onError: (error) => {
        console.error("Product creation error:", error);
        toast({
          title: "Creación de producto Fallida",
          description: "Creacion de producto fallida. Por favor intente nuevamente.",
          variant: "destructive",
        });
      }
    });
  };

  const handleEditProduct = (productId: string, productData: InsertProduct) => {
    updateProductMutation.mutate({ id: productId, product: productData }, {
      onSuccess: () => {
        toast({
          title: "Producto acutalizado",
          description: "El producto ha sido actualizado con éxito.",
        });
      },
      onError: (error) => {
        console.error("Product update error:", error);
        toast({
          title: "Actualización Fallida",
          description: "Actualización fallida. Por favor intente nuevamente.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId, {
      onSuccess: () => {
        toast({
          title: "Producto Borrado",
          description: "El producto ha sido removido de la lista.",
        });
      },
      onError: (error) => {
        console.error("Product deletion error:", error);
        toast({
          title: "Borrado Fallido",
          description: "Fallo al borrar el producto. Por favor intente nuevamente.",
          variant: "destructive",
        });
      }
    });
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        businessName="Molino Turó"
        cashierName="Arturo Castro Ramos"
        onOpenSettings={() => console.log("Open settings")}
        className={"h-12 px-4 flex items-center shadow-sm"}
      />
      
      <main className="flex-1 p-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 mb-6" data-testid="tabs-main">
            <TabsTrigger value="pos" className="flex items-center gap-2" data-testid="tab-pos">
              <ShoppingCart className="w-4 h-4" />
              Punto de venta
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2" data-testid="tab-products">
              <Package className="w-4 h-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2" data-testid="tab-history">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="h-full space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Products and Scale */}
              <div className="space-y-6">
                <WeightDisplay 
                  onWeightChange={handleWeightChange}
                  unit="kg"
                />
                <ProductSearch 
                  onSelectProduct={handleSelectProduct}
                  placeholder="Buscar producto por código o nombre..."
                />
                <ProductGrid 
                  products={products.filter(p => p.isActive === 1)}
                  onSelectProduct={handleSelectProduct}
                  selectedProductId={selectedProduct?.id}
                />
              </div>

              {/* Right Column: Transaction Cart */}
              <div className="col-span-2">
                <TransactionCart 
                  items={cartItems}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onProcessTransaction={handleProcessTransaction}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="h-full">
            <ProductManagement 
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="history" className="h-full">
            <TransactionHistory 
              transactions={transactions}
              onViewReceipt={(transaction) => console.log("View receipt:", transaction)}
            />
          </TabsContent>
        </Tabs>
      </main>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onComplete={handleCompletePayment}
        total={cartTotal}
        items={cartItems}
      />
    </div>
  );
}