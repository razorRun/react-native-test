import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';

const CartContext = createContext(null);

// Performance Issue: Context triggering unnecessary re-renders
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartHistory, setCartHistory] = useState([]);
  const [cartMetrics, setCartMetrics] = useState({});
  const updateCount = useRef(0);
  
  // Performance Issue: Effect running on every cart update
  useEffect(() => {
    updateCount.current += 1;
    console.log(`Cart updated ${updateCount.current} times`);
    
    // Performance Issue: Complex calculation on every update
    const metrics = {
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      uniqueItems: cartItems.length,
      averageItemValue: cartItems.length > 0 
        ? cartItems.reduce((sum, item) => sum + item.price, 0) / cartItems.length 
        : 0,
      // Performance Issue: Creating new date objects
      lastUpdated: new Date().toISOString(),
      updateHistory: [...Array(updateCount.current)].map((_, i) => ({
        timestamp: new Date(Date.now() - i * 1000),
        action: 'update',
      })),
    };
    
    setCartMetrics(metrics);
    
    // Performance Issue: Emitting events on every update
    DeviceEventEmitter.emit('cartUpdated', { cartItems, metrics });
    
    // Performance Issue: Saving full history without limit
    setCartHistory(prev => [...prev, { cartItems, timestamp: Date.now() }]);
  }, [cartItems]);
  
  const updateCart = (product) => {
    // Performance Issue: Recreating entire array
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, lastAdded: new Date() }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, addedAt: new Date() }];
    });
  };
  
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Performance Issue: Value object recreated on every render
  const value = {
    cartItems,
    cartHistory,
    cartMetrics,
    updateCart,
    removeFromCart,
    clearCart,
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartProvider;