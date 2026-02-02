import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cyna_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cyna_cart', JSON.stringify(cart));
  }, [cart]);

  // AJOUTER (+)
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Par défaut : Quantité 1, Durée "Mensuel"
        return [...prevCart, { ...product, quantity: 1, duration: 'monthly' }];
      }
    });
  };

  // MISE À JOUR QUANTITÉ (Input direct)
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: parseInt(newQuantity) } : item
      )
    );
  };

  // MISE À JOUR DURÉE (Mensuel/Annuel)
  const updateDuration = (productId, newDuration) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, duration: newDuration } : item
      )
    );
  };

  // SUPPRIMER
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // CALCULS
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calcul total (Prix * Quantité * (12 si Annuel))
  const cartTotal = cart.reduce((total, item) => {
    const multiplier = item.duration === 'yearly' ? 12 : 1;
    return total + (item.price * item.quantity * multiplier);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, 
      updateDuration, 
      removeFromCart, 
      cartCount, 
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);