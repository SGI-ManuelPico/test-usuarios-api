import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface FieldDefinition {
    name: string;
    label: string;
    type: string;
    required: boolean;
}

interface EntityConfig {
    config: {
        fields: FieldDefinition[];
    };
}

interface CreateUserDialogProps {
    empresaId: string;
    onUserCreated: () => void;
}

export function CreateUserDialog({ empresaId, onUserCreated }: CreateUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<EntityConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(false);

    const form = useForm({
        defaultValues: {
            email: "",
            nombre: "",
            password: "",
            custom_data: {} as Record<string, string | number>,
        },
    });

    useEffect(() => {
        if (open) {
            fetchConfig();
        }
    }, [open, empresaId]);

    const fetchConfig = async () => {
        setLoadingConfig(true);
        try {
            const { data } = await api.get(`/entity-config/${empresaId}/usuario`);
            setConfig(data);
        } catch {
            setConfig(null);
        } finally {
            setLoadingConfig(false);
        }
    };

    const onSubmit = async (data: { email: string; nombre: string; password?: string; custom_data: Record<string, string | number> }) => {
        try {
            const payload = {
                ...data,
                password: data.password || "123456", // Default if not provided (though we'll make it required or visible)
                empresa_id: empresaId,
            };

            await api.post("/usuarios/", payload);
            setOpen(false);
            form.reset();
            onUserCreated();
        } catch (error: any) {
            console.error("Create error", error);
            const detail = error.response?.data?.detail;

            if (detail) {
                let errors = [];
                if (Array.isArray(detail)) {
                    errors = detail;
                } else if (detail.errors && Array.isArray(detail.errors)) {
                    errors = detail.errors;
                }

                errors.forEach((err: any) => {
                    const fieldPath = err.loc.join(".");
                    // Handle 'custom_data' prefix if present in location but not in form path format
                    // Standard 422: ['body', 'email'] -> 'email'
                    // Custom 400: ['custom_data', 'field'] -> 'custom_data.field'

                    let formField = fieldPath;
                    if (fieldPath.startsWith("body.")) {
                        formField = fieldPath.replace("body.", "");
                    }

                    form.setError(formField as any, {
                        type: "server",
                        message: err.msg,
                    });
                });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle>Crear Usuario</DialogTitle>
                    <DialogDescription>
                        Agrega un nuevo usuario.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            rules={{ required: "El email es requerido" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            rules={{ required: "La contraseña es requerida" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Perez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {loadingConfig && <p className="text-sm text-muted-foreground">Loading config...</p>}

                        {config?.config?.fields.map((fieldDef) => (
                            <FormField
                                key={fieldDef.name}
                                control={form.control}
                                name={`custom_data.${fieldDef.name}`}
                                rules={{
                                    required: fieldDef.required ? `${fieldDef.label} es requerido` : false,
                                }}
                                render={({ field }) => {
                                    let inputType = "text";
                                    if (fieldDef.type === "integer" || fieldDef.type === "float") inputType = "number";
                                    else if (fieldDef.type === "date") inputType = "date";
                                    else if (fieldDef.type === "datetime") inputType = "datetime-local";
                                    else if (fieldDef.type === "email") inputType = "email";
                                    else if (fieldDef.type === "phone") inputType = "tel";
                                    else if (fieldDef.type === "url") inputType = "url";

                                    return (
                                        <FormItem>
                                            <FormLabel>{fieldDef.label}</FormLabel>
                                            <FormControl>
                                                {fieldDef.type === "select" ? (
                                                    <select
                                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                        value={field.value || ""}
                                                    >
                                                        <option value="">Seleccione una opción</option>
                                                        {(fieldDef as any).options?.map((opt: any) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <Input
                                                        type={inputType}
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        ))}

                        <div className="flex justify-end pt-4">
                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
