from typing import Any, Callable, Dict, Optional
from datetime import datetime, date

class ValidationRegistry:
    _instance = None
    _validators: Dict[str, Callable] = {}
    _metadata: Dict[str, Dict[str, Any]] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ValidationRegistry, cls).__new__(cls)
        return cls._instance

    @classmethod
    def register(cls, name: str, metadata: Dict[str, Any] = None):
        def decorator(func: Callable):
            cls._validators[name] = func
            if metadata:
                cls._metadata[name] = metadata
            return func
        return decorator
    
    @classmethod
    def get_all_metadata(cls) -> Dict[str, Dict[str, Any]]:
        return cls._metadata

    @classmethod
    def get_validator(cls, name: str) -> Optional[Callable]:
        return cls._validators.get(name)

    @classmethod
    def execute(cls, name: str, value: Any, **kwargs) -> bool:
        validator = cls.get_validator(name)
        if not validator:
            raise ValueError(f"Validator '{name}' not found")
        return validator(value, **kwargs)

# Generic Validators

@ValidationRegistry.register("numeric_comparation", metadata={
    "label": "Min/Max/Equivalencia",
    "params": [
        {"name": "operator", "type": "select", "options": ["gt", "lt", "gte", "lte", "eq", "neq"], "label": "Operador"},
        {"name": "threshold", "type": "number", "label": "Valor límite"}
    ],
    "applicable_types": ["integer", "float"]
})
def numeric_comparation(value: Any, threshold: float, operator: str) -> bool:
    """
    Compares a numeric value against a threshold.
    Operators: 'gt', 'lt', 'gte', 'lte', 'eq', 'neq'
    """
    try:
        val = float(value)
        thresh = float(threshold)
    except (ValueError, TypeError):
        return False # Or raise specific error depending on requirements

    if operator == "gt":
        return val > thresh
    elif operator == "lt":
        return val < thresh
    elif operator == "gte":
        return val >= thresh
    elif operator == "lte":
        return val <= thresh
    elif operator == "eq":
        return val == thresh
    elif operator == "neq":
        return val != thresh
    return False

@ValidationRegistry.register("date_comparation", metadata={
    "label": "Fecha relativa",
    "params": [
        {"name": "operator", "type": "select", "options": ["gt", "lt", "gte", "lte", "eq", "neq"], "label": "Operador"},
        {"name": "reference_date", "type": "select", "options": ["now", "today", "custom"], "label": "Fecha referencia"}
    ],
    "applicable_types": ["date", "datetime"]
})
def date_comparation(value: Any, reference_date: str, operator: str) -> bool:
    """
    Compares a date value against a reference date.
    Reference date can be 'now' or 'today' or a ISO date string.
    Operators: 'gt', 'lt', 'gte', 'lte', 'eq', 'neq'
    """
    if not value:
        return False
        
    # Parse value
    if isinstance(value, str):
        try:
            val_date = datetime.fromisoformat(value).date()
        except ValueError:
            return False
    elif isinstance(value, (datetime, date)):
         val_date = value if isinstance(value, date) else value.date()
    else:
        return False

    # Parse reference
    if reference_date in ("now", "today"):
        ref_date = date.today()
    else:
        try:
            ref_date = datetime.fromisoformat(reference_date).date()
        except ValueError:
             return False # invalid config

    if operator == "gt":
        return val_date > ref_date
    elif operator == "lt":
        return val_date < ref_date
    elif operator == "gte":
        return val_date >= ref_date
    elif operator == "lte":
        return val_date <= ref_date
    elif operator == "eq":
        return val_date == ref_date
    elif operator == "neq":
        return val_date != ref_date
    return False
