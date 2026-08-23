from PIL import Image, ImageDraw, ImageFont
import os

def create_business_card(
    filename: str,
    name: str,
    title: str,
    company: str,
    email: str,
    phone: str,
    website: str,
    address: str,
    bg_color=(255, 255, 255),
    accent_color=(30, 41, 59),
    text_color=(15, 23, 42)
):
    # Standard business card ratio 3.5" x 2" at 300 DPI -> 1050 x 600 px
    width, height = 1050, 600
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Accent top border bar
    draw.rectangle([0, 0, width, 18], fill=accent_color)
    
    # Left accent block
    draw.rectangle([0, 0, 24, height], fill=accent_color)

    # Load default or truetype font
    try:
        font_large = ImageFont.truetype("Helvetica", 42)
        font_medium = ImageFont.truetype("Helvetica", 26)
        font_regular = ImageFont.truetype("Helvetica", 22)
    except IOError:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_regular = ImageFont.load_default()

    # Draw Company Name
    draw.text((70, 60), company.upper(), fill=accent_color, font=font_medium)
    
    # Draw Divider Line
    draw.line([(70, 105), (980, 105)], fill=(226, 232, 240), width=2)

    # Draw Person Name & Title
    draw.text((70, 135), name, fill=text_color, font=font_large)
    draw.text((70, 195), title, fill=(100, 116, 139), font=font_medium)

    # Draw Contact Details Block
    y_start = 280
    line_gap = 38

    contact_info = [
        f"Email:    {email}",
        f"Phone:    {phone}",
        f"Website:  {website}",
        f"Address:  {address}"
    ]

    for i, line in enumerate(contact_info):
        draw.text((70, y_start + i * line_gap), line, fill=(51, 65, 85), font=font_regular)

    # Bottom decorative stripe
    draw.rectangle([0, height - 12, width, height], fill=accent_color)

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, quality=95)
    print(f"✅ Business card generated: {filename}")

if __name__ == "__main__":
    create_business_card(
        filename="samples/dummy_card_alex.jpg",
        name="Alex Pratama",
        title="Chief Technology Officer",
        company="Aston Tech Innovations",
        email="alex.pratama@astontech.co.id",
        phone="+62 812 9876 5432",
        website="www.astontech.co.id",
        address="Jl. Jend. Sudirman No. 88, Jakarta Pusat"
    )

    create_business_card(
        filename="samples/dummy_card_sarah.jpg",
        name="Sarah Wijaya",
        title="Senior Product Manager",
        company="Digital Media Nusantara",
        email="sarah.wijaya@digitalmedia.id",
        phone="+62 811 2345 6789",
        website="www.digitalmedia.id",
        address="Gedung Cyber 2, Kuningan, Jakarta Selatan",
        accent_color=(14, 116, 144)
    )
