from datetime import date, timedelta
from app.core.validation_registry import ValidationRegistry
from app.schemas.entity_config import EntityConfigBase, ConfigSchema, FieldDefinition, FieldTypeEnum, ValidationRule

# 1. Setup Mock Config with Validations
salary_validation = ValidationRule(
    action="numeric_comparation",
    params={"threshold": 50000, "operator": "lte"},
    error_message="El salario no puede ser mayor a 50000"
)

date_validation = ValidationRule(
    action="date_comparation",
    params={"reference_date": "now", "operator": "gt"},
    error_message="La fecha debe ser futura"
)

config = EntityConfigBase(
    entity_type="user",
    config=ConfigSchema(
        fields=[
            FieldDefinition(
                name="salary",
                label="Salario",
                type=FieldTypeEnum.INTEGER,
                validations=[salary_validation]
            ),
            FieldDefinition(
                name="contract_end",
                label="Fin de Contrato",
                type=FieldTypeEnum.STRING,
                validations=[date_validation]
            )
        ]
    )
)

print("Config created successfully.")

# 2. Simulate Form Submission Validation
def validate_submission(submission_data: dict, config: EntityConfigBase):
    errors = []
    field_map = {f.name: f for f in config.config.fields}
    
    for field_name, value in submission_data.items():
        field_def = field_map.get(field_name)
        if not field_def or not field_def.validations:
            continue
            
        for rule in field_def.validations:
            is_valid = ValidationRegistry.execute(rule.action, value, **rule.params)
            if not is_valid:
                errors.append(f"Field '{field_def.label}': {rule.error_message}")
                
    return errors

# 3. Test Cases
print("\n--- Testing Valid Data ---")
valid_data = {
    "salary": 40000,
    "contract_end": (date.today() + timedelta(days=30)).isoformat()
}
errors = validate_submission(valid_data, config)
if not errors:
    print("SUCCESS: Valid data passed.")
else:
    print(f"FAILURE: Valid data failed: {errors}")

print("\n--- Testing Invalid Data ---")
invalid_data = {
    "salary": 60000, # Should fail (> 50000)
    "contract_end": (date.today() - timedelta(days=1)).isoformat() # Should fail (past)
}
errors = validate_submission(invalid_data, config)
if len(errors) == 2:
    print("SUCCESS: Invalid data caught correctly.")
    for e in errors:
        print(f" - {e}")
else:
    print(f"FAILURE: Expected 2 errors, got: {errors}")
