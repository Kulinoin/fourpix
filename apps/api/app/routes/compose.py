from __future__ import annotations

import json
from typing import Any, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.compositor import (
    TemplateCompositionError,
    TemplateNotFoundError,
    compose_template_image,
)

router = APIRouter(prefix="/process", tags=["process"])


@router.post("/compose")
async def compose_photo(
    subject: Optional[UploadFile] = File(default=None),
    file: Optional[UploadFile] = File(default=None),
    image: Optional[UploadFile] = File(default=None),
    template_id: str = Form(...),
    background_color: str = Form("#E53935"),
    transform: Optional[str] = Form(default=None),
) -> Response:
    upload = subject or file or image
    if upload is None:
        raise HTTPException(status_code=422, detail="Subject image wajib dikirim.")

    parsed_transform: dict[str, Any] | None = None
    if transform:
        try:
            loaded = json.loads(transform)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=422, detail="Transform JSON tidak valid.") from exc

        if not isinstance(loaded, dict):
            raise HTTPException(status_code=422, detail="Transform harus berupa object JSON.")
        parsed_transform = loaded

    try:
        output_png = compose_template_image(
            subject_bytes=await upload.read(),
            template_id=template_id,
            background_color=background_color,
            transform=parsed_transform,
        )
    except TemplateNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except TemplateCompositionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Compositing gagal diproses.") from exc

    return Response(
        content=output_png,
        media_type="image/png",
        headers={"Cache-Control": "no-store"},
    )
