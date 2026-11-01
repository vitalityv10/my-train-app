import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/auth/AuthContext";
import { CartProvider } from "./components/context/CartContext";
import ProtectedRoute from "./components/context/auth/ProtectedRoute";
import AppNavbar from "./components/menu/AppNavbar";
import Footer from "./components/menu/Footer";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import UserProfile from "./pages/UserProfile";
import LoginPage from "./pages/auth/LoginPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
