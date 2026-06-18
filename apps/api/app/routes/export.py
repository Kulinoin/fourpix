from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.exporter import export_image_bytes, list_export_profiles


router = APIRouter(tags=["export"])


@router.get("/export/profiles")
def get_export_profiles() -> dict[str, object]:
    return {"profiles": list_export_profiles()}


@router.post("/export")
async def export_photo(
    image: UploadFile = File(...),
    profile_id: str = Form("3x4"),
    format: str = Form("png"),
) -> Response:
    if image.content_type not in {"image/png", "image/jpeg", "image/jpg", "application/octet-stream"}:
        raise HTTPException(
            status_code=400,
            detail="File export harus berupa image JPG/PNG.",
        )

    try:
        image_bytes = await image.read()
        exported_bytes, media_type, filename = export_image_bytes(
            image_bytes,
            profile_id=profile_id,
            output_format=format,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - guardrail for unexpected Pillow failures
        raise HTTPException(status_code=500, detail="Export image gagal diproses.") from exc

    return Response(
        content=exported_bytes,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-4Pix-Filename": filename,
        },
    )
