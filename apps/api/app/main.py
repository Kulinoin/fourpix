from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

APP_NAME = "4Pix Studio"
APP_SLUG = "fourpix"

app = FastAPI(
    title=f"{APP_NAME} API",
    version="0.1.0",
    description="Local-first API foundation for 4Pix Studio.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5174",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "app": APP_NAME,
        "slug": APP_SLUG,
        "service": "api",
    }

# Slice 01: Template Registry
from app.routes.templates import router as templates_router

app.include_router(templates_router)

