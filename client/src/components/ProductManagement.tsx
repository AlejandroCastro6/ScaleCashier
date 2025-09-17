import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit2, Trash2, Hash, Percent } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProductSchema, type Product, type InsertProduct } from "@shared/schema";

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (product: InsertProduct) => void;
  onEditProduct: (productId: string, product: InsertProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function ProductManagement({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}: ProductManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      code: "",
      name: "",
      pricePerUnit: "0",
      unit: "kg",
      category: "",
      taxRate: "0",
      isActive: 1,
    },
  });

  const handleSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      onEditProduct(editingProduct.id, data);
    } else {
      onAddProduct(data);
    }
    
    setIsDialogOpen(false);
    setEditingProduct(null);
    form.reset();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      code: product.code,
      name: product.name,
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      category: product.category || "",
      taxRate: product.taxRate,
      isActive: product.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const formatPrice = (price: string, unit: string) => {
    return `$${parseFloat(price).toFixed(2)}/${unit}`;
  };

  const formatTaxRate = (taxRate: string) => {
    const rate = parseFloat(taxRate);
    return rate > 0 ? `${rate}% tax` : "Tax-free";
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <Card className="p-6" data-testid="card-product-management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Gestión de productos</h3>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" />
                Agregar producto
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-product-form">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código del producto</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., APL001" 
                            {...field}
                            className="font-mono"
                            data-testid="input-product-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del producto</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter product name" 
                            {...field} 
                            data-testid="input-product-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pricePerUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por unidad</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                              data-testid="input-product-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product-unit">
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                              <SelectItem value="g">Gramo (g)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tasa impuesto (%)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product-tax-rate">
                                <SelectValue placeholder="Select tax rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0% (sin-IVA)</SelectItem>
                              <SelectItem value="5">5% (Tasa reducida)</SelectItem>
                              <SelectItem value="19">19% (Tasa éstandar)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categorias (Opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Fruits, Vegetables, Meat" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-product-category"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-product"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" data-testid="button-save-product">
                      {editingProduct ? "Save Changes" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay productos añadidos aún</p>
              <p className="text-sm">Añade tu primer producto para empezar</p>
            </div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="p-4" data-testid={`card-manage-product-${product.id}`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        <Hash className="w-2 h-2 mr-1" />
                        {product.code}
                      </Badge>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                      {parseFloat(product.taxRate) > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Percent className="w-2 h-2 mr-1" />
                          {parseFloat(product.taxRate)}%
                        </Badge>
                      )}
                      {product.isActive === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium" data-testid={`text-manage-product-name-${product.id}`}>
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span data-testid={`text-manage-product-price-${product.id}`}>
                        {formatPrice(product.pricePerUnit, product.unit)}
                      </span>
                      <span>•</span>
                      <span>{formatTaxRate(product.taxRate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      data-testid={`button-edit-product-${product.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Categories Summary */}
        {categories.length > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2 block">Categorias</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category} ({products.filter(p => p.category === category).length})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}