from typing import Dict, Any, Type, List, Literal, Annotated, Union, Optional
from pydantic import create_model, Field, BaseModel, ValidationError, StringConstraints

# Mapeo de tipos de texto a tipos de Python básicos
TYPE_MAPPING = {
    "string": str,
    "integer": int,
    "boolean": bool,
}

def create_dynamic_model(field_definitions: list) -> Type[BaseModel]:
    """
    Crea una clase Pydantic dinámicamente basada en la configuración de la DB.
    Incluye validación de Literal para selects y regex para strings.
    """
    fields_dict = {}
    
    for field in field_definitions:
        field_name = field['name']
        field_type = field['type']
        is_required = field.get('required', False)
        
        # 1. Determinar el tipo base y las restricciones
        if field_type == "select":
            options = field.get('options', [])
            if options:
                # Extraer los valores permitidos (value)
                allowed_values = [opt['value'] for opt in options]
                # Literal requiere pasar los argumentos desempaquetados
                python_type = Literal[tuple(allowed_values)] # type: ignore
                # Nota: Literal[tuple(...)] no funciona directamente, 
                # pero Literal.__getitem__(tuple(allowed_values)) sí.
                # Sin embargo, en Python 3.11+ Literal[*allowed_values] es lo mejor.
                python_type = Literal.__getitem__(tuple(allowed_values))
            else:
                python_type = str
        
        elif field_type == "string" and field.get('regex'):
            # Usar StringConstraints para validación de regex
            python_type = Annotated[str, StringConstraints(pattern=field['regex'])]
        
        else:
            # Tipos básicos
            python_type = TYPE_MAPPING.get(field_type, str)
        
        # 2. Configurar si es opcional o requerido
        if is_required:
            # En Pydantic, ... indica que el campo es requerido
            field_config = (python_type, Field(...))
        else:
            # Si no es requerido, permitimos None y el valor por defecto es None
            field_config = (Optional[python_type], Field(None))
            
        fields_dict[field_name] = field_config
    
    # Crea la clase al vuelo
    return create_model('DynamicValidator', **fields_dict)

def validate_custom_data(custom_data: Dict[str, Any], config_schema: Dict[str, Any]):
    """
    Función principal para llamar desde tu servicio
    """
    # 1. Obtenemos la lista de campos de la configuración
    fields_def = config_schema.get('fields', [])
    
    # 2. Creamos el modelo validador específico
    DynamicModel = create_dynamic_model(fields_def)
    
    # 3. Validamos
    # Si hay errores, Pydantic lanzará ValidationError
    return DynamicModel.model_validate(custom_data)