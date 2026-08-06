import { createContext, useCallback, useMemo, useState } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ product, quantity }]
  const [customer, setCustomer] = useState(null);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomer(null);
  }, []);

  const unitPriceFor = useCallback(
    (product) => (customer?.is_wholesale && product.wholesale_price ? product.wholesale_price : product.price),
    [customer],
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(unitPriceFor(item.product)) * item.quantity, 0),
    [items, unitPriceFor],
  );

  const value = useMemo(
    () => ({
      items,
      customer,
      setCustomer,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      unitPriceFor,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [items, customer, addItem, updateQuantity, removeItem, clearCart, unitPriceFor, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
