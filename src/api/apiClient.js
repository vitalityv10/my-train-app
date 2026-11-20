import { auth } from "../firebase";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

let inMemoryAuthHeader = null;

export const setAuthHeader = (tokenOrHeader) => {
  if (!tokenOrHeader) {
    inMemoryAuthHeader = null;
    return;
  }
  const trimmed = tokenOrHeader.trim();
  inMemoryAuthHeader = trimmed.startsWith("Bearer ")
    ? trimmed
    : `Bearer ${trimmed}`;
};

export const clearAuthHeader = () => {
  inMemoryAuthHeader = null;
};

export const getAuthorizationHeader = async () => {
  if (inMemoryAuthHeader) {
    return inMemoryAuthHeader;
  }

  if (auth.currentUser) {
    try {
      const firebaseToken = await auth.currentUser.getIdToken();
      inMemoryAuthHeader = `Bearer ${firebaseToken}`;
      return inMemoryAuthHeader;
    } catch (err) {
      console.warn("Failed to get Firebase ID token:", err);
    }
  }

  return null;
};

export const apiFetch = async (path, options = {}) => {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (!headers.Authorization) {
    const authHeader = await getAuthorizationHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseAuthHeader = response.headers.get("Authorization");
  if (responseAuthHeader) {
    setAuthHeader(responseAuthHeader);
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.error || `HTTP Error ${response.status}`,
    );
    error.status = response.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return data;
};
