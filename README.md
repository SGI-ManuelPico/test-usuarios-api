## Migrations

uv run alembic revision --autogenerate -m "descripcion de los cambios"
uv run alembic upgrade head
uv run alembic downgrade -1
uv run alembic upgrade +1