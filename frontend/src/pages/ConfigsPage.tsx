import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Eye } from "lucide-react";

interface ValidationParam {
    name: string;
    type: string;
    options?: string[];
    label: string;
}

interface ValidationMetadata {
    label: string;
    params: ValidationParam[];
    applicable_types: string[];
}

interface FieldOption {
    label: string;
    value: string | number;
}

interface FieldDefinition {
    name: string;
    label: string;
    type: string;
    required: boolean;
    validations: ValidationRule[];
    options?: FieldOption[];
}

interface ValidationRule {
    action: string;
    params: Record<string, string | number>;
    error_message: string;
}

interface EntityConfigResponse {
    id: number;
    entity_type: string;
    config: {
        fields: FieldDefinition[];
    };
}

const FIELD_TYPES = [
    { value: "string", label: "Texto" },
    { value: "integer", label: "Número entero" },
    { value: "float", label: "Número decimal" },
    { value: "date", label: "Fecha" },
    { value: "datetime", label: "Fecha y Hora" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Teléfono" },
    { value: "url", label: "URL" },
    { value: "select", label: "Selección (Select)" },
];

const OPERATOR_LABELS: Record<string, string> = {
    gt: "> (Mayor que)",
    lt: "< (Menor que)",
    gte: ">= (Mayor o igual)",
    lte: "<= (Menor o igual)",
    eq: "= (Igual a)",
    neq: "!= (Diferente de)",
    now: "Ahora (Fecha/Hora)",
    today: "Hoy (Solo Fecha)",
    custom: "Fecha específica",
};

export function ConfigsPage() {
    const { empresa } = useAuth();
    const [entityType, setEntityType] = useState("usuario");
    const [fields, setFields] = useState<FieldDefinition[]>([]);
    const [fetchedConfig, setFetchedConfig] = useState<EntityConfigResponse | null>(null);
    const [validationMetadata, setValidationMetadata] = useState<Record<string, ValidationMetadata>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchValidationMetadata();
    }, []);

    useEffect(() => {
        if (empresa) {
            fetchConfig();
        }
    }, [empresa, entityType]);

    const fetchValidationMetadata = async () => {
        try {
            const { data } = await api.get("/entity-config/validations");
            setValidationMetadata(data);
        } catch (error) {
            console.error("Failed to fetch validation metadata", error);
        }
    };

    const fetchConfig = async () => {
        if (!empresa) return;
        try {
            const { data } = await api.get(`/entity-config/${empresa.id}/${entityType}`);
            setFetchedConfig(data);
            setFields(data.config.fields || []);
        } catch {
            setFetchedConfig(null);
            setFields([]);
        }
    };

    const addField = () => {
        setFields([
            ...fields,
            {
                name: "",
                label: "",
                type: "string",
                required: false,
                validations: [],
            },
        ]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, updates: Partial<FieldDefinition>) => {
        setFields(
            fields.map((field, i) => (i === index ? { ...field, ...updates } : field))
        );
    };

    const addOption = (fieldIndex: number) => {
        const field = fields[fieldIndex];
        const newOptions = [...(field.options || []), { label: "", value: "" }];
        updateField(fieldIndex, { options: newOptions });
    };

    const updateOption = (fieldIndex: number, optionIndex: number, updates: Partial<FieldOption>) => {
        const field = fields[fieldIndex];
        const newOptions = field.options?.map((opt, i) =>
            i === optionIndex ? { ...opt, ...updates } : opt
        );
        updateField(fieldIndex, { options: newOptions });
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const field = fields[fieldIndex];
        const newOptions = field.options?.filter((_, i) => i !== optionIndex);
        updateField(fieldIndex, { options: newOptions });
    };

    const addValidation = (fieldIndex: number) => {
        const field = fields[fieldIndex];
        // Find first applicable validation
        const firstApplicable = Object.entries(validationMetadata).find(
            ([_, meta]) => meta.applicable_types.includes(field.type)
        );

        if (!firstApplicable) return;

        const [actionName, meta] = firstApplicable;

        // Initialize default params
        const defaultParams: Record<string, string | number> = {};
        meta.params.forEach(p => {
            defaultParams[p.name] = p.options ? p.options[0] : "";
        });

        updateField(fieldIndex, {
            validations: [
                ...field.validations,
                {
                    action: actionName,
                    params: defaultParams,
                    error_message: "",
                },
            ],
        });
    };

    const updateValidationAction = (fieldIndex: number, validationIndex: number, newAction: string) => {
        const field = fields[fieldIndex];
        const meta = validationMetadata[newAction];
        if (!meta) return;

        // Reset params for new action
        const defaultParams: Record<string, string | number> = {};
        meta.params.forEach(p => {
            defaultParams[p.name] = p.options ? p.options[0] : "";
        });

        const newValidations = field.validations.map((v, i) =>
            i === validationIndex ? { ...v, action: newAction, params: defaultParams } : v
        );
        updateField(fieldIndex, { validations: newValidations });
    };

    const updateValidation = (
        fieldIndex: number,
        validationIndex: number,
        updates: Partial<ValidationRule>
    ) => {
        const field = fields[fieldIndex];
        const newValidations = field.validations.map((v, i) =>
            i === validationIndex ? { ...v, ...updates } : v
        );
        updateField(fieldIndex, { validations: newValidations });
    };

    const removeValidation = (fieldIndex: number, validationIndex: number) => {
        const field = fields[fieldIndex];
        updateField(fieldIndex, {
            validations: field.validations.filter((_, i) => i !== validationIndex),
        });
    };

    const saveConfig = async () => {
        if (!empresa) return;
        setSaving(true);
        try {
            if (fetchedConfig) {
                // Si ya existe, usamos PUT
                const payload = {
                    entity_type: entityType,
                    config: { fields },
                };
                await api.put(`/entity-config/${fetchedConfig.id}`, payload);
            } else {
                // Si es nueva, usamos POST
                const payload = {
                    entity_type: entityType,
                    empresa_id: empresa.id,
                    config: { fields },
                };
                await api.post("/entity-config/", payload);
            }
            alert("Configuración guardada!");
            fetchConfig();
        } catch (error) {
            console.error("Error saving config", error);
            alert("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    if (!empresa) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                    <p className="text-muted-foreground">
                        Configurando campos dinámicos para <span className="font-semibold">{empresa.nombre}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Config Builder */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Constructor de Campos</CardTitle>
                            <CardDescription>
                                Define los campos personalizados para el tipo de entidad
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Label>Tipo de Entidad</Label>
                                    <Input
                                        value={entityType}
                                        onChange={(e) => setEntityType(e.target.value)}
                                        placeholder="usuario, producto, etc."
                                    />
                                </div>
                                <Button variant="outline" onClick={fetchConfig}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Cargar
                                </Button>
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                {fields.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label className="text-xs">Nombre (key)</Label>
                                                <Input
                                                    value={field.name}
                                                    onChange={(e) =>
                                                        updateField(fieldIndex, { name: e.target.value })
                                                    }
                                                    placeholder="nombre_campo"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-xs">Etiqueta</Label>
                                                <Input
                                                    value={field.label}
                                                    onChange={(e) =>
                                                        updateField(fieldIndex, { label: e.target.value })
                                                    }
                                                    placeholder="Nombre del Campo"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <Label className="text-xs">Tipo</Label>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                                    value={field.type}
                                                    onChange={(e) =>
                                                        updateField(fieldIndex, {
                                                            type: e.target.value,
                                                            validations: [], // Clear validations when type changes
                                                        })
                                                    }
                                                >
                                                    {FIELD_TYPES.map((t) => (
                                                        <option key={t.value} value={t.value}>
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeField(fieldIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={(e) =>
                                                        updateField(fieldIndex, { required: e.target.checked })
                                                    }
                                                />
                                                Requerido
                                            </label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addValidation(fieldIndex)}
                                                disabled={!Object.values(validationMetadata).some((m) =>
                                                    m.applicable_types.includes(field.type)
                                                )}
                                            >
                                                + Validación
                                            </Button>

                                            {field.type === "select" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                                    onClick={() => addOption(fieldIndex)}
                                                >
                                                    + Opción
                                                </Button>
                                            )}
                                        </div>

                                        {/* Options for Select */}
                                        {field.type === "select" && (field.options?.length ?? 0) > 0 && (
                                            <div className="ml-4 p-3 border-l-4 border-purple-400 bg-purple-50 space-y-2">
                                                <Label className="text-xs font-bold text-purple-700 italic">Opciones del Menú</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {field.options?.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex gap-2 items-center bg-white p-2 rounded shadow-sm">
                                                            <div className="flex-1">
                                                                <Input
                                                                    placeholder="Etiqueta"
                                                                    className="h-8 text-xs"
                                                                    value={option.label}
                                                                    onChange={(e) => updateOption(fieldIndex, optIndex, { label: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Input
                                                                    placeholder="Valor"
                                                                    className="h-8 text-xs"
                                                                    value={option.value}
                                                                    onChange={(e) => updateOption(fieldIndex, optIndex, { value: e.target.value })}
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-purple-400 hover:text-red-500"
                                                                onClick={() => removeOption(fieldIndex, optIndex)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Validations */}
                                        {field.validations.map((validation, vIndex) => {
                                            const meta = validationMetadata[validation.action];
                                            const availableValidators = Object.entries(validationMetadata).filter(
                                                ([_, m]) => m.applicable_types.includes(field.type)
                                            );

                                            return (
                                                <div
                                                    key={vIndex}
                                                    className="ml-4 p-3 border-l-4 border-blue-400 bg-blue-50 space-y-2"
                                                >
                                                    <div className="flex gap-2 items-center">
                                                        <select
                                                            className="flex h-8 rounded-md border border-input bg-transparent px-2 text-sm font-semibold text-blue-700"
                                                            value={validation.action}
                                                            onChange={(e) => updateValidationAction(fieldIndex, vIndex, e.target.value)}
                                                        >
                                                            {availableValidators.map(([key, m]) => (
                                                                <option key={key} value={key}>{m.label}</option>
                                                            ))}
                                                        </select>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeValidation(fieldIndex, vIndex)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    {meta && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {meta.params.map(param => (
                                                                <div key={param.name} className="flex flex-col">
                                                                    <Label className="text-[10px] text-muted-foreground">{param.label}</Label>
                                                                    {param.type === 'select' ? (
                                                                        <select
                                                                            className="flex h-8 rounded-md border border-input bg-white px-2 text-sm"
                                                                            value={validation.params[param.name]}
                                                                            onChange={(e) =>
                                                                                updateValidation(fieldIndex, vIndex, {
                                                                                    params: { ...validation.params, [param.name]: e.target.value }
                                                                                })
                                                                            }
                                                                        >
                                                                            {param.options?.map(opt => (
                                                                                <option key={opt} value={opt}>
                                                                                    {OPERATOR_LABELS[opt] || opt}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <Input
                                                                            type={param.type}
                                                                            className="h-8 min-w-[100px]"
                                                                            value={validation.params[param.name]}
                                                                            onChange={(e) =>
                                                                                updateValidation(fieldIndex, vIndex, {
                                                                                    params: { ...validation.params, [param.name]: param.type === 'number' ? parseFloat(e.target.value) : e.target.value }
                                                                                })
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <Input
                                                        className="h-8"
                                                        placeholder="Mensaje de error"
                                                        value={validation.error_message}
                                                        onChange={(e) =>
                                                            updateValidation(fieldIndex, vIndex, {
                                                                error_message: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}

                                <Button variant="outline" className="w-full" onClick={addField}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Campo
                                </Button>
                            </div>

                            <div className="border-t pt-4">
                                <Button onClick={saveConfig} disabled={saving} className="w-full">
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? "Guardando..." : "Guardar Configuración"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vista Previa JSON</CardTitle>
                            <CardDescription>Así se guardará la configuración</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[500px]">
                                {JSON.stringify({ fields }, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>

                    {fetchedConfig && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-sm">Config Actual (DB)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-[200px]">
                                    {JSON.stringify(fetchedConfig.config, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
