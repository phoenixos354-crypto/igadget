import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null = checking, false = anon, obj = logged in
    const [ready, setReady] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
        } catch {
            setUser(false);
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        if (data?.token) localStorage.setItem("igs_token", data.token);
        setUser(data);
        return data;
    };

    const register = async (payload) => {
        const { data } = await api.post("/auth/register", payload);
        if (data?.token) localStorage.setItem("igs_token", data.token);
        setUser(data);
        return data;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            /* ignore */
        }
        localStorage.removeItem("igs_token");
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, ready, login, register, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
