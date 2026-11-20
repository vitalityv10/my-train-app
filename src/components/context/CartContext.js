import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./auth/AuthContext";
import { apiFetch } from "../../api/apiClient";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    try {
      const data = await apiFetch("/api/cart");
      if (data && Array.isArray(data.items)) {
        setCart({ items: data.items });
      } else {
        setCart({ items: [] });
      }
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (train) => {
    if (!user) {
      alert("Будь ласка, увійдіть в акаунт, щоб додати квиток у кошик!");
      return;
    }

    // Optimistic local update
    const exists = cart.items.find((i) => i.id === train.id);
    const optimisticItems = exists
      ? cart.items.map((i) =>
          i.id === train.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i,
        )
      : [...cart.items, { ...train, quantity: 1 }];
    setCart({ items: optimisticItems });

    try {
      const data = await apiFetch("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({
          trainId: train.id,
          quantity: 1,
        }),
      });
      if (data && Array.isArray(data.items)) {
        setCart({ items: data.items });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const removeFromCart = async (id) => {
    if (!user) return;

    const optimisticItems = cart.items.filter((i) => i.id !== id);
    setCart({ items: optimisticItems });

    try {
      const data = await apiFetch(`/api/cart/items/${id}`, {
        method: "DELETE",
      });
      if (data && Array.isArray(data.items)) {
        setCart({ items: data.items });
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (!user || newQuantity < 1) return;

    const optimisticItems = cart.items.map((i) =>
      i.id === itemId ? { ...i, quantity: newQuantity } : i,
    );
    setCart({ items: optimisticItems });

    try {
      const data = await apiFetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (data && Array.isArray(data.items)) {
        setCart({ items: data.items });
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    setCart({ items: [] });

    try {
      await apiFetch("/api/cart", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const purchaseTickets = async (
    tickets,
    paymentMethodOverride,
    contactPhoneOverride,
  ) => {
    if (!user || !tickets || tickets.length === 0) return null;

    const resolvedPaymentMethod =
      paymentMethodOverride || tickets[0]?.payment?.method || "card";
    const resolvedContactPhone =
      resolvedPaymentMethod === "cash"
        ? contactPhoneOverride || tickets[0]?.contactPhone || null
        : null;

    const formattedTickets = tickets.map((ticket) => {
      const timeString = ticket.route?.from?.departureTime;
      const departureDate =
        ticket.departureDate ||
        (timeString
          ? new Date(timeString).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]);

      return {
        trainId: ticket.trainId || ticket.id,
        departureDate,
        carriage: ticket.carriage ?? ticket.seat?.carriage ?? 1,
        seatNumber: ticket.seatNumber ?? ticket.seat?.number ?? 1,
      };
    });

    const response = await apiFetch("/api/checkout/purchase", {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: resolvedPaymentMethod,
        contactPhone: resolvedContactPhone,
        tickets: formattedTickets,
      }),
    });

    setCart({ items: [] });
    return response;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        purchaseTickets,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
