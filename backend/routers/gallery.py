from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from database import get_db
from dependencies import get_current_user
import models, schemas
from services.cloudinary_service import upload_image, delete_image

router = APIRouter(prefix="/api/gallery", tags=["Gallery"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    caption: str = Form(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    ext = os.path.splitext(file.filename)[1].lower()
    file_type = "video" if ext in [".mp4", ".mov", ".avi", ".webm"] else "image"

    # Upload to Cloudinary
    result = upload_image(file_bytes, folder="health_for_her/gallery")
    
    gallery_item = models.GalleryItem(
        user_id=current_user.id,
        filename=file.filename,
        file_path=result["url"],             # Store Cloudinary URL directly
        file_type=file_type,
        caption=caption,
        cloudinary_public_id=result.get("public_id")  # Store for future deletion
    )
    db.add(gallery_item)
    db.commit()
    db.refresh(gallery_item)
    return schemas.GalleryItemOut.model_validate(gallery_item)


@router.get("/", response_model=List[schemas.GalleryItemOut])
def get_gallery(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.GalleryItem).filter(
        models.GalleryItem.user_id == current_user.id
    ).order_by(models.GalleryItem.uploaded_at.desc()).all()


@router.put("/{item_id}/favourite")
def toggle_favourite(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.GalleryItem).filter(
        models.GalleryItem.id == item_id,
        models.GalleryItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_favourite = not item.is_favourite
    db.commit()
    return {"is_favourite": item.is_favourite}


@router.delete("/{item_id}")
def delete_gallery_item(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.GalleryItem).filter(
        models.GalleryItem.id == item_id,
        models.GalleryItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Delete from Cloudinary if we have the public_id
    if item.cloudinary_public_id:
        resource_type = "video" if item.file_type == "video" else "image"
        delete_image(item.cloudinary_public_id, resource_type=resource_type)

    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
