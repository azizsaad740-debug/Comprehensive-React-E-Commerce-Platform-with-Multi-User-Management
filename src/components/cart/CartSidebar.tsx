"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';

const CartSidebar = () => {
  const navigate = useNavigate();
  const { 
    items, 
    isOpen, 
    setCartOpen, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    clearCart
  } = useCartStore();
  const { toast } = useToast();

  const handleQuantityChange = (productId: string, variantId: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId, variantId);
      toast({
        title: "Item removed",
        description: "Product removed from cart",
      });
    } else {
      updateQuantity(productId, variantId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, variantId: string | undefined) => {
    removeItem(productId, variantId);
    toast({
      title: "Item removed",
      description: "Product removed from cart",
    });
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    setCartOpen(false);
    navigate('/products');
  };

  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({items.length} items)</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button 
                  variant="outline" 
                  onClick={handleContinueShopping}
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.variantId || 'default'}-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                        {item.product.images[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-md" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        {item.variantId && (
                          <p className="text-sm text-gray-500">
                            {item.product.variants.find(v => v.id === item.variantId)?.name}
                          </p>
                        )}
                        
                        {/* Customization Preview */}
                        {item.customization.texts.some(text => text.trim()) && (
                          <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-700 font-medium mb-1">Customization:</p>
                            {item.customization.texts.filter(text => text.trim()).map((text, idx) => (
                              <p key={idx} className="text-xs text-blue-600">
                                "{text}"
                              </p>
                            ))}
                            {item.customization.font && (
                              <p className="text-xs text-blue-600">
                                Font: {item.customization.font}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(
                                item.productId, 
                                item.variantId, 
                                item.quantity - 1
                              )}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(
                                item.productId, 
                                item.variantId, 
                                item.quantity + 1
                              )}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId, item.variantId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right mt-2">
                          <span className="text-sm font-medium">
                            ${((item.product.discountedPrice || item.product.basePrice) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <>
              <Separator />
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleContinueShopping}
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                </div>
                
                {/* Shipping Info */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {totalPrice >= 50 
                      ? '🚚 Free shipping included!' 
                      : `Add $${(50 - totalPrice).toFixed(2)} more for free shipping`
                    }
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;