import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const login = (loginData) => {

        localStorage.setItem("token", loginData.token);

        const userData = {
            userId: loginData.userId,
            name: loginData.name,
            role: loginData.role
        };

        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isLoggedIn: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);