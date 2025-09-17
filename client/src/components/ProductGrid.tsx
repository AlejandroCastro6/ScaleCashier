import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  selectedProductId?: string;
}

export default function ProductGrid({ 
  products, 
  onSelectProduct, 
  onEditProduct, 
  onDeleteProduct,
  selectedProductId 
}: ProductGridProps) {
  const formatPrice = (price: string, unit: string) => {
    return `$${parseFloat(price).toFixed(2)}/${unit}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Productos</h3>
        <Badge variant="secondary" data-testid="text-product-count">
          {products.length} items
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className={`p-4 hover-elevate cursor-pointer transition-all ${
              selectedProductId === product.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectProduct(product)}
            data-testid={`card-product-${product.id}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight truncate" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h4>
                  {product.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  {onEditProduct && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(product);
                      }}
                      data-testid={`button-edit-${product.id}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  )}
                  {onDeleteProduct && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProduct(product.id);
                      }}
                      data-testid={`button-delete-${product.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-lg font-semibold text-primary" data-testid={`text-price-${product.id}`}>
                  {formatPrice(product.pricePerUnit, product.unit)}
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(product);
                  }}
                  data-testid={`button-select-${product.id}`}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}