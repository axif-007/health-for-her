import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_image(file_bytes: bytes, folder: str = "health_for_her/gallery") -> dict:
    """Upload an image or video to Cloudinary and return the result."""
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        resource_type="auto"  # handles both images and videos
    )
    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "resource_type": result.get("resource_type")
    }

def delete_image(public_id: str, resource_type: str = "image"):
    """Delete a file from Cloudinary by its public_id."""
    try:
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
