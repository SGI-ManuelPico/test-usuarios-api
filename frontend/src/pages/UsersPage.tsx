import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CreateUserDialog } from "@/pages/CreateUserDialog";

interface FieldDefinition {
    name: string;
    label: string;
    type: string;
}

interface EntityConfig {
    config: {
        fields: FieldDefinition[];
    };
}

interface User {
    id: string;
    email: string;
    nombre: string;
    custom_data: Record<string, any>;
}

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [config, setConfig] = useState<EntityConfig | null>(null);
    const { empresa } = useAuth();

    useEffect(() => {
        if (empresa) {
            fetchUsers();
            fetchConfig();
        }
    }, [empresa]);

    const fetchUsers = async () => {
        if (!empresa) return;
        try {
            const { data } = await api.get("/usuarios/", {
                params: { empresa_id: empresa.id }
            });
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const fetchConfig = async () => {
        try {
            const { data } = await api.get(`/entity-config/${empresa?.id}/usuario`);
            setConfig(data);
        } catch (error) {
            console.error("Failed to fetch entity config", error);
            setConfig(null);
        }
    };

    if (!empresa) return null;

    // Get dynamic fields from config or fallback to empty
    const dynamicFields = config?.config?.fields || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
                    <p className="text-muted-foreground">
                        Administrando usuarios de <span className="font-semibold">{empresa.nombre}</span>
                    </p>
                </div>
                <CreateUserDialog empresaId={empresa.id} onUserCreated={fetchUsers} />
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Nombre</TableHead>
                            {/* Dynamic Headers */}
                            {dynamicFields.map((field) => (
                                <TableHead key={field.name}>{field.label}</TableHead>
                            ))}
                            {dynamicFields.length === 0 && <TableHead>Custom Data (Raw)</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3 + Math.max(1, dynamicFields.length)}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>{user.nombre || "-"}</TableCell>

                                    {/* Dynamic Cells */}
                                    {dynamicFields.map((field) => {
                                        const value = user.custom_data?.[field.name];
                                        return (
                                            <TableCell key={field.name}>
                                                {value !== undefined && value !== null ? String(value) : "-"}
                                            </TableCell>
                                        );
                                    })}

                                    {/* Fallback if no config */}
                                    {dynamicFields.length === 0 && (
                                        <TableCell>
                                            <pre className="text-xs text-muted-foreground bg-slate-50 p-2 rounded max-w-md overflow-auto">
                                                {JSON.stringify(user.custom_data, null, 2)}
                                            </pre>
                                        </TableCell>
                                    )}

                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
