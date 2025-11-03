import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children })
{
  const [cart, setCart] = useState(() =>
  {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() =>
  {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) =>
  {
    setCart(prev =>
    {
      const idx = prev.findIndex(i => i.product === product._id);
      if (idx === -1)
      {
        return [...prev,
          {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: qty,
            seller: product.seller?._id || product.seller,
            store: product.store?._id || product.store
          }];
      }
      else
      {
        const copy = [...prev];
        copy[idx].quantity += qty;
        return copy;
      }
    });
  };

  const updateQty = (productId, qty) =>
  {
    setCart(prev => prev.map(i => i.product === productId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.product !== productId));

  const clearCart = () => setCart([]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}