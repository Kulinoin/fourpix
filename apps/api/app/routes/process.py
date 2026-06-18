from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.background_removal import (
    BackgroundRemovalError,
    InvalidImageError,
    remove_background_bytes,
)

router = APIRouter(prefix="/process", tags=["process"])

MAX_IMAGE_BYTES = 12 * 1024 * 1024
SUPPORTED_CONTENT_TYPES = {"image/jpeg", "image/png"}
SUPPORTED_EXTENSIONS = (".jpg", ".jpeg", ".png")


def _is_supported_image(file: UploadFile) -> bool:
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()
    return content_type in SUPPORTED_CONTENT_TYPES or filename.endswith(SUPPORTED_EXTENSIONS)


@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)) -> Response:
    if not _is_supported_image(file):
        raise HTTPException(
            status_code=415,
            detail="Format file tidak didukung. Gunakan JPG atau PNG.",
        )

    contents = await file.read(MAX_IMAGE_BYTES + 1)
    await file.close()

    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Ukuran file terlalu besar. Maksimal 12 MB untuk MVP.",
        )

    try:
        output_png = remove_background_bytes(contents)
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except BackgroundRemovalError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return Response(
        content=output_png,
        media_type="image/png",
        headers={
            "Content-Disposition": "inline; filename=fourpix-bg-removed.png",
            "X-Fourpix-Processing": "local",
        },
    )
