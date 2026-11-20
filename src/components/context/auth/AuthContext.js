import React, { createContext, useState, useContext, useEffect } from "react";
import { auth, googleProvider } from "../../../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import {
  API_BASE_URL,
  setAuthHeader,
  clearAuthHeader,
  apiFetch,
} from "../../../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncFirebaseUserWithBackend = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken(); // JWT від Firebase
    setAuthHeader(`Bearer ${token}`);

    const fallbackUser = {
      uid: firebaseUser.uid,
      name:
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "Користувач",
      email: firebaseUser.email,
      photo: firebaseUser.photoURL,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
        }),
      });

      const authHeader = response.headers.get("Authorization");
      if (authHeader) {
        setAuthHeader(authHeader);
      }

      if (response.ok) {
        const syncedData = await response.json().catch(() => null);
        const finalUser = {
          uid: syncedData?.uid || fallbackUser.uid,
          name: syncedData?.name || fallbackUser.name,
          email: syncedData?.email || fallbackUser.email,
          photo: syncedData?.photo || fallbackUser.photo,
        };
        setUser(finalUser);
        return finalUser;
      }
    } catch (error) {
      console.warn("Не вдалося синхронізувати користувача з бекендом:", error);
    }

    setUser(fallbackUser);
    return fallbackUser;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncFirebaseUserWithBackend(firebaseUser);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncFirebaseUserWithBackend(result.user);
  };

  const handleBackendAuthResponse = async (response, fallbackInfo = {}) => {
    const authHeader = response.headers.get("Authorization");
    if (authHeader) {
      setAuthHeader(authHeader);
    }

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Помилка авторизації (${response.status})`,
      );
    }

    let userProfile = null;
    if (data && (data.email || data.uid || data.name)) {
      userProfile = {
        uid: data.uid || data.id || fallbackInfo.email,
        name:
          data.name ||
          fallbackInfo.name ||
          (data.email || fallbackInfo.email)?.split("@")[0] ||
          "Користувач",
        email: data.email || fallbackInfo.email,
        photo: data.photo || data.photoUrl || null,
      };
    } else {
      try {
        userProfile = await apiFetch("/api/users/me");
      } catch {
        userProfile = {
          uid: fallbackInfo.email,
          name:
            fallbackInfo.name ||
            fallbackInfo.email?.split("@")[0] ||
            "Користувач",
          email: fallbackInfo.email,
          photo: null,
        };
      }
    }

    setUser(userProfile);
    return userProfile;
  };

  const loginWithBackend = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    return await handleBackendAuthResponse(response, { email });
  };

  const registerWithBackend = async ({ name, email, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    return await handleBackendAuthResponse(response, { name, email });
  };

  const logout = async () => {
    clearAuthHeader();
    setUser(null);
    try {
      await signOut(auth);
    } catch (error) {
      console.warn("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithBackend,
        registerWithBackend,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
