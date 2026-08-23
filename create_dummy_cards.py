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
    # Standard high-resolution business card 1050 x 600 px (300 DPI equivalent)
    width, height = 1050, 600
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Top accent bar
    draw.rectangle([0, 0, width, 20], fill=accent_color)
    
    # Left accent block
    draw.rectangle([0, 0, 28, height], fill=accent_color)

    # Try loading Helvetica font, fallback to default if not present
    try:
        font_large = ImageFont.truetype("Helvetica", 42)
        font_medium = ImageFont.truetype("Helvetica", 26)
        font_regular = ImageFont.truetype("Helvetica", 22)
    except IOError:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_regular = ImageFont.load_default()

    # Company Name Header
    draw.text((70, 55), company.upper(), fill=accent_color, font=font_medium)
    
    # Divider Line
    draw.line([(70, 102), (980, 102)], fill=(226, 232, 240), width=2)

    # Full Name & Job Title
    draw.text((70, 130), name, fill=text_color, font=font_large)
    draw.text((70, 190), title, fill=(100, 116, 139), font=font_medium)

    # Contact Info Section
    y_start = 275
    line_gap = 38

    contact_lines = [
        f"Email:    {email}",
        f"Phone:    {phone}",
        f"Website:  {website}",
        f"Address:  {address}"
    ]

    for i, line in enumerate(contact_lines):
        draw.text((70, y_start + i * line_gap), line, fill=(51, 65, 85), font=font_regular)

    # Bottom accent bar
    draw.rectangle([0, height - 14, width, height], fill=accent_color)

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, quality=95)
    print(f"✅ Generated: {filename} ({name} - {title})")

DUMMY_CARDS_DATA = [
    {
        "filename": "samples/card_01_budi_santoso.jpg",
        "name": "Budi Santoso",
        "title": "Chief Executive Officer",
        "company": "PT Nusantara Digital Utama",
        "email": "budi.santoso@nusantaradigital.co.id",
        "phone": "+62 811 1234 5678",
        "website": "www.nusantaradigital.co.id",
        "address": "Menara BCA Lt. 45, Grand Indonesia, Jakarta Pusat",
        "accent_color": (30, 41, 59) # Slate Dark
    },
    {
        "filename": "samples/card_02_dewi_lestari.jpg",
        "name": "Dewi Lestari",
        "title": "Lead Software Architect",
        "company": "CloudTech Indonesia",
        "email": "dewi.lestari@cloudtech.id",
        "phone": "+62 812 2345 6789",
        "website": "www.cloudtech.id",
        "address": "Gedung Cyber 1 Lt. 8, Kuningan, Jakarta Selatan",
        "accent_color": (37, 99, 235) # Sapphire Blue
    },
    {
        "filename": "samples/card_03_hendra_wijaya.jpg",
        "name": "Hendra Wijaya",
        "title": "VP of Sales & Marketing",
        "company": "Mega Growth Solutions",
        "email": "hendra.wijaya@megagrowth.com",
        "phone": "+62 813 3456 7890",
        "website": "www.megagrowth.com",
        "address": "Office Park SCBD Lot 11, Jakarta Selatan",
        "accent_color": (5, 150, 105) # Emerald Green
    },
    {
        "filename": "samples/card_04_rina_rose.jpg",
        "name": "Rina Rose",
        "title": "Senior Product Designer",
        "company": "Studio Creative Labs",
        "email": "rina.rose@creativelabs.design",
        "phone": "+62 814 4567 8901",
        "website": "www.creativelabs.design",
        "address": "Jl. Kemang Raya No. 45, Jakarta Selatan",
        "accent_color": (147, 51, 234) # Purple
    },
    {
        "filename": "samples/card_05_fajar_firmansyah.jpg",
        "name": "Fajar Firmansyah",
        "title": "Head of Human Resources",
        "company": "Capital People Partner",
        "email": "fajar.f@capitalpeople.co.id",
        "phone": "+62 815 5678 9012",
        "website": "www.capitalpeople.co.id",
        "address": "Wisma 46 Kota BNI, Jend. Sudirman, Jakarta",
        "accent_color": (79, 70, 229) # Indigo
    },
    {
        "filename": "samples/card_06_michael_chen.jpg",
        "name": "Michael Chen",
        "title": "Chief Financial Officer",
        "company": "Apex Global Ventures",
        "email": "michael.chen@apexglobal.sg",
        "phone": "+65 6789 0123",
        "website": "www.apexglobal.sg",
        "address": "Marina Bay Financial Centre Tower 2, Singapore",
        "accent_color": (15, 23, 42) # Midnight Navy
    },
    {
        "filename": "samples/card_07_siti_rahma.jpg",
        "name": "Siti Rahma",
        "title": "Full Stack Developer",
        "company": "CodeCraft Studio",
        "email": "siti.rahma@codecraft.io",
        "phone": "+62 817 7890 1234",
        "website": "www.codecraft.io",
        "address": "Bandung Digital Valley, Jl. Gegerkalongsari, Bandung",
        "accent_color": (14, 116, 144) # Deep Cyan
    },
    {
        "filename": "samples/card_08_andry_kurniawan.jpg",
        "name": "Andry Kurniawan",
        "title": "Operations Manager",
        "company": "Logistik Express Indonesia",
        "email": "andry.kurniawan@logistikexpress.co.id",
        "phone": "+62 818 8901 2345",
        "website": "www.logistikexpress.co.id",
        "address": "Kawasan Industri MM2100, Cikarang, Jawa Barat",
        "accent_color": (217, 119, 6) # Amber Orange
    },
    {
        "filename": "samples/card_09_dian_sastro.jpg",
        "name": "Dian Sastro",
        "title": "Head of Brand Marketing",
        "company": "Creative Hype Agency",
        "email": "dian.sastro@creativehype.id",
        "phone": "+62 819 9012 3456",
        "website": "www.creativehype.id",
        "address": "Senopati Suites Lt. 3, Kebayoran Baru, Jakarta",
        "accent_color": (225, 29, 72) # Rose Pink
    },
    {
        "filename": "samples/card_10_reza_rahadian.jpg",
        "name": "Reza Rahadian",
        "title": "Managing Director",
        "company": "Prima Karya Group",
        "email": "reza.rahadian@primakarya.com",
        "phone": "+62 810 0123 4567",
        "website": "www.primakarya.com",
        "address": "Pacific Century Place Lt. 28, SCBD, Jakarta Pusat",
        "accent_color": (120, 53, 15) # Dark Copper
    }
]

if __name__ == "__main__":
    print("🎨 Generating 10 Dummy Business Card Dataset Images...")
    for item in DUMMY_CARDS_DATA:
        create_business_card(
            filename=item["filename"],
            name=item["name"],
            title=item["title"],
            company=item["company"],
            email=item["email"],
            phone=item["phone"],
            website=item["website"],
            address=item["address"],
            accent_color=item["accent_color"]
        )
    print("✨ Successfully generated 10 business card images in samples/ directory!")
