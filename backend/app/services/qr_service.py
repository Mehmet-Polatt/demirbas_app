import os
import io
import base64
import json
import qrcode
from app.core.config import settings

def ensure_qr_dir_exists():
    """Ensure the static QR code directory exists"""
    os.makedirs(settings.QR_CODE_DIR, exist_ok=True)

def generate_device_qr_code(asset_tag: str, metadata: dict = None) -> tuple[str, str]:
    """
    Generates a high-quality QR code image for a device asset tag.
    Returns:
        (file_relative_path, base64_image_data_uri)
    """
    ensure_qr_dir_exists()
    
    # Payload format can include JSON structure for scanner versatility
    payload = {
        "system": "IT_DEMIRBAS_YS",
        "asset_tag": asset_tag,
        "type": "DEVICE_TAG"
    }
    if metadata:
        payload.update(metadata)
        
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(json.dumps(payload, ensure_ascii=False))
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")

    filename = f"qr_{asset_tag.replace('/', '_').replace(' ', '_')}.png"
    filepath = os.path.join(settings.QR_CODE_DIR, filename)
    img.save(filepath)

    # Also generate base64 representation for direct client rendering
    buffered = io.BytesIO()
    img.save(buffered)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    data_uri = f"data:image/png;base64,{img_str}"

    relative_url = f"/static/qrcodes/{filename}"
    return relative_url, data_uri
