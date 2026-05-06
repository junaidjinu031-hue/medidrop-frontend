import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedPharmacy = localStorage.getItem('selectedPharmacy');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedPharmacy) {
      setSelectedPharmacy(JSON.parse(savedPharmacy));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (selectedPharmacy) {
      localStorage.setItem('selectedPharmacy', JSON.stringify(selectedPharmacy));
    }
  }, [selectedPharmacy]);

  const addToCart = (item, type = 'medicine') => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item.id && cartItem.type === type
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id && cartItem.type === type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, type, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId, type) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === itemId && item.type === type))
    );
  };

  const updateQuantity = (itemId, type, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, type);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId && item.type === type
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedPharmacy,
        setSelectedPharmacy,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
