import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Package, ArrowDown } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductSearchProps {
  onSelectProduct: (product: Product) => void;
  placeholder?: string;
}

export default function ProductSearch({ 
  onSelectProduct, 
  placeholder = "Search by product code or name..." 
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search products via API
  const { data: searchResults = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/search', searchQuery],
    queryFn: () => 
      searchQuery.trim() 
        ? fetch(`/api/products/search/${encodeURIComponent(searchQuery.trim())}`).then(res => res.json())
        : Promise.resolve([]),
    enabled: searchQuery.trim().length > 0,
  });

  // Update dropdown visibility when search results change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setIsDropdownOpen(searchResults.length > 0);
    setSelectedIndex(-1);
  }, [searchQuery, searchResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectProduct(searchResults[selectedIndex]);
        } else if (searchResults.length === 1) {
          handleSelectProduct(searchResults[0]);
        }
        break;
      
      case "Escape":
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    setSearchQuery("");
    setFilteredProducts([]);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-primary/20 px-0">{part}</mark> : part
    );
  };

  const formatPrice = (price: string, unit: string) => {
    return `$${parseFloat(price).toFixed(2)}/${unit}`;
  };

  return (
    <div className="relative" data-testid="container-product-search">
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Product Search</Label>
        </div>
        
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            className="text-base"
            data-testid="input-product-search"
          />
          
          {isDropdownOpen && searchResults.length > 0 && (
            <Card 
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto"
              data-testid="dropdown-search-results"
            >
              <div className="p-2 space-y-1">
                {searchResults.map((product, index) => (
                  <div
                    key={product.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleSelectProduct(product)}
                    data-testid={`search-result-${product.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={index === selectedIndex ? "secondary" : "outline"}
                            className="font-mono text-xs"
                            data-testid={`result-code-${product.id}`}
                          >
                            {highlightMatch(product.code, searchQuery)}
                          </Badge>
                          {product.category && (
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium mt-1" data-testid={`result-name-${product.id}`}>
                          {highlightMatch(product.name, searchQuery)}
                        </div>
                        <div className="text-sm opacity-75">
                          {formatPrice(product.pricePerUnit, product.unit)}
                          {parseFloat(product.taxRate) > 0 && (
                            <span className="ml-2">
                              ({parseFloat(product.taxRate)}% tax)
                            </span>
                          )}
                        </div>
                      </div>
                      <Package className="w-4 h-4 opacity-50" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
                Use ↑↓ arrows to navigate, Enter to select, Esc to close
              </div>
            </Card>
          )}
        </div>

        {searchQuery && searchResults.length === 0 && !isLoading && (
          <div className="text-sm text-muted-foreground text-center py-2">
            No products found matching "{searchQuery}"
          </div>
        )}

        {isLoading && searchQuery && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Searching...
          </div>
        )}
      </Card>
    </div>
  );
}