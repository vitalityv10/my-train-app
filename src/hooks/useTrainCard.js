import { useState } from "react";
import { useAuth } from "../components/context/auth/AuthContext";
import { useCart } from "../components/context/CartContext";
import { formatDateUk, formatTimeUk } from "../utils/dateUtils";

export function useTrainCard(train) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      alert("Увійдіть в систему, щоб додати квиток у кошик!");
      return;
    }
    addToCart(train);
  };

  const departureTime = formatTimeUk(train.route.from.departureTime);
  const arrivalTime = formatTimeUk(train.route.to.arrivalTime);
  const departureDate = formatDateUk(train.route.from.departureTime);

  return {
    showModal,
    setShowModal,
    handleAddToCart,
    departureTime,
    arrivalTime,
    departureDate,
  };
}
