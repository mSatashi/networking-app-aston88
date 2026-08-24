import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_app_icon(output_path="mobile_app/assets/icon/app_icon.png"):
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Rectangle / Circle with Dark Gradient Look
    padding = 40
    # Main rounded card background (Deep Indigo / Slate Gradient)
    bg_box = [padding, padding, size - padding, size - padding]
    radius = 220

    # Draw rounded background
    draw.rounded_rectangle(bg_box, radius=radius, fill=(15, 23, 42, 255)) # Slate 900

    # Inner Glow Ring
    inner_box = [padding + 20, padding + 20, size - padding - 20, size - padding - 20]
    draw.rounded_rectangle(inner_box, radius=radius - 15, outline=(99, 102, 241, 180), width=12) # Indigo glow

    # 2. Draw Business Card Shape in Center
    card_w, card_h = 580, 360
    card_x = (size - card_w) // 2
    card_y = (size - card_h) // 2 - 20
    card_box = [card_x, card_y, card_x + card_w, card_y + card_h]

    # White Business Card Body with rounded corners
    draw.rounded_rectangle(card_box, radius=32, fill=(248, 250, 252, 255))

    # Business Card Accent Stripe
    draw.rounded_rectangle([card_x, card_y, card_x + 36, card_y + card_h], radius=16, fill=(99, 102, 241, 255))

    # Business Card Header Line (Name placeholder)
    draw.rectangle([card_x + 70, card_y + 60, card_x + 340, card_y + 90], fill=(30, 41, 59, 255))
    # Subtitle Line (Title placeholder)
    draw.rectangle([card_x + 70, card_y + 110, card_x + 260, card_y + 130], fill=(148, 163, 184, 255))

    # Text / Contact lines placeholders
    draw.rectangle([card_x + 70, card_y + 180, card_x + 480, card_y + 196], fill=(71, 85, 105, 255))
    draw.rectangle([card_x + 70, card_y + 220, card_x + 420, card_y + 236], fill=(71, 85, 105, 255))
    draw.rectangle([card_x + 70, card_y + 260, card_x + 450, card_y + 276], fill=(71, 85, 105, 255))

    # 3. Scanning Camera Lens / Laser Overlay Effect (Cyan Glowing Reticle)
    scan_cx, scan_cy = size // 2, size // 2 + 160
    
    # Scanning Laser Beam (Cyan horizontal line across card)
    draw.line([(card_x - 40, card_y + card_h // 2 + 30), (card_x + card_w + 40, card_y + card_h // 2 + 30)], fill=(6, 182, 212, 255), width=16)

    # Corner Reticle Brackets (Scanner Target Corners)
    r_len = 60
    r_th = 14
    r_color = (6, 182, 212, 255) # Cyan

    # Top-Left Bracket
    draw.line([(card_x - 30, card_y - 30), (card_x - 30 + r_len, card_y - 30)], fill=r_color, width=r_th)
    draw.line([(card_x - 30, card_y - 30), (card_x - 30, card_y - 30 + r_len)], fill=r_color, width=r_th)

    # Top-Right Bracket
    draw.line([(card_x + card_w + 30, card_y - 30), (card_x + card_w + 30 - r_len, card_y - 30)], fill=r_color, width=r_th)
    draw.line([(card_x + card_w + 30, card_y - 30), (card_x + card_w + 30, card_y - 30 + r_len)], fill=r_color, width=r_th)

    # Bottom-Left Bracket
    draw.line([(card_x - 30, card_y + card_h + 30), (card_x - 30 + r_len, card_y + card_h + 30)], fill=r_color, width=r_th)
    draw.line([(card_x - 30, card_y + card_h + 30), (card_x - 30, card_y + card_h + 30 - r_len)], fill=r_color, width=r_th)

    # Bottom-Right Bracket
    draw.line([(card_x + card_w + 30, card_y + card_h + 30), (card_x + card_w + 30 - r_len, card_y + card_h + 30)], fill=r_color, width=r_th)
    draw.line([(card_x + card_w + 30, card_y + card_h + 30), (card_x + card_w + 30, card_y + card_h + 30 - r_len)], fill=r_color, width=r_th)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"✅ Generated 1024x1024 Master App Icon: {output_path}")
    return img

def generate_android_mipmaps(master_img):
    sizes = {
        "mobile_app/android/app/src/main/res/mipmap-mdpi/ic_launcher.png": 48,
        "mobile_app/android/app/src/main/res/mipmap-hdpi/ic_launcher.png": 72,
        "mobile_app/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png": 96,
        "mobile_app/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png": 144,
        "mobile_app/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png": 192,
    }

    for path, sz in sizes.items():
        os.makedirs(os.path.dirname(path), exist_ok=True)
        resized = master_img.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(path, "PNG")
        print(f"  └─ Generated Android Mipmap ({sz}x{sz}): {path}")

if __name__ == "__main__":
    master = create_app_icon()
    generate_android_mipmaps(master)
