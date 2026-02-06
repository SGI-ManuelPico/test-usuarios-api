import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, LogIn } from "lucide-react";

interface Empresa {
    id: string;
    nombre: string;
    nit: string;
}

export function LoginPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
    const [loading, setLoading] = useState(true);
    const { setEmpresa } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const { data } = await api.get("/empresas/");
            setEmpresas(data);
        } catch (error) {
            console.error("Failed to fetch empresas", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        if (selectedEmpresa) {
            setEmpresa(selectedEmpresa);
            navigate("/users");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
                    <CardDescription className="text-slate-400">
                        Selecciona la empresa para administrar
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <p className="text-center text-slate-400">Cargando empresas...</p>
                    ) : empresas.length === 0 ? (
                        <p className="text-center text-slate-400">No hay empresas registradas</p>
                    ) : (
                        <div className="space-y-2">
                            {empresas.map((emp) => (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedEmpresa(emp)}
                                    className={`w-full p-4 rounded-lg border text-left transition-all ${selectedEmpresa?.id === emp.id
                                            ? "border-blue-500 bg-blue-500/20 text-white"
                                            : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                                        }`}
                                >
                                    <p className="font-semibold">{emp.nombre}</p>
                                    <p className="text-sm opacity-70">NIT: {emp.nit}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={handleLogin}
                        disabled={!selectedEmpresa}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        <LogIn className="mr-2 h-4 w-4" />
                        Ingresar como Admin
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
