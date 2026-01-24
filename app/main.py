from fastapi import FastAPI
from app.api.v1 import router as v1_router

app = FastAPI(title="API Usuarios")

app.include_router(v1_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "API de Usuarios con validación dinámica lista"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
