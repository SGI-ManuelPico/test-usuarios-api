import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Users, Settings, Home, LogOut, Building2 } from "lucide-react";

export function Sidebar() {
    const location = useLocation();
    const { empresa, logout } = useAuth();

    const navItems = [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/users", label: "Users", icon: Users },
        { href: "/configs", label: "Entity Configs", icon: Settings },
    ];

    return (
        <div className="w-64 h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight text-white">Admin Panel</h1>
                {empresa && (
                    <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate">{empresa.nombre}</span>
                    </div>
                )}
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link key={item.href} to={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-2",
                                    isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </Button>
                <p className="text-xs text-slate-500">v1.0.0</p>
            </div>
        </div>
    );
}
