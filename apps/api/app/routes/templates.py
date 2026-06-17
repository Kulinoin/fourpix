from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.template_registry import (
    TemplateNotFoundError,
    get_template_asset_path,
    list_templates,
)

router = APIRouter(tags=["templates"])


@router.get("/templates")
def get_templates() -> list[dict]:
    return list_templates()


@router.get("/templates/{template_id}/{asset_name}")
def get_template_asset(template_id: str, asset_name: str) -> FileResponse:
    try:
        asset_path = get_template_asset_path(template_id, asset_name)
    except TemplateNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return FileResponse(asset_path)
