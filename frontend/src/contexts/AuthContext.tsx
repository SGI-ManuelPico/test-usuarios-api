import { createContext, useContext, useState, type ReactNode } from "react";

interface Empresa {
    id: string;
    nombre: string;
    nit: string;
}

interface AuthContextType {
    empresa: Empresa | null;
    setEmpresa: (empresa: Empresa | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [empresa, setEmpresaState] = useState<Empresa | null>(() => {
        const saved = localStorage.getItem("selected_empresa");
        return saved ? JSON.parse(saved) : null;
    });

    const setEmpresa = (emp: Empresa | null) => {
        setEmpresaState(emp);
        if (emp) {
            localStorage.setItem("selected_empresa", JSON.stringify(emp));
        } else {
            localStorage.removeItem("selected_empresa");
        }
    };

    const logout = () => {
        setEmpresa(null);
    };

    return (
        <AuthContext.Provider
            value={{
                empresa,
                setEmpresa,
                isAuthenticated: !!empresa,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
