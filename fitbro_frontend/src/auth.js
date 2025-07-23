// src/auth.js

export function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getUserRole() {
    return sessionStorage.getItem("role");
}

export function getUserName() {
    return sessionStorage.getItem("name");
}

export function getToken() {
    return sessionStorage.getItem("token");
}

export function isLoggedIn() {
    return !!getToken();
}

export function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("name");
}
