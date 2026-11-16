import os
import math
from PIL import Image, ImageDraw, ImageFont

OUT = r'c:\Users\Acer\Desktop\ACCREDITATION SYSTEM\figures'
os.makedirs(OUT, exist_ok=True)

FONT_DIR = r'C:\Windows\Fonts'

def get_font(size, bold=False):
    name = 'arialbd.ttf' if bold else 'arial.ttf'
    path = os.path.join(FONT_DIR, name)
    if not os.path.exists(path):
        name = 'timesbd.ttf' if bold else 'times.ttf'
        path = os.path.join(FONT_DIR, name)
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# Academic Publication Grayscale & Subtle UI Accent Palette
WHITE = (255, 255, 255)
BG_CANVAS = (245, 247, 250)
NAV_DARK = (24, 30, 42)
TEXT_WHITE = (255, 255, 255)
TEXT_DARK = (20, 24, 33)
TEXT_MUTED = (90, 100, 115)
TEXT_MUTED_LIGHT = (140, 150, 165)
BORDER_SUBTLE = (218, 224, 233)
BORDER_DARK = (30, 36, 48)
CARD_BG = (255, 255, 255)
CARD_HEADER_BG = (240, 243, 248)

# RAG Badges & Status Colors (Slightly muted for elegant academic publication)
COLOR_GREEN_BG = (235, 247, 238)
COLOR_GREEN_TEXT = (22, 115, 50)
COLOR_GREEN_BORDER = (163, 222, 178)

COLOR_AMBER_BG = (254, 247, 230)
COLOR_AMBER_TEXT = (180, 105, 14)
COLOR_AMBER_BORDER = (245, 205, 130)

COLOR_RED_BG = (253, 237, 237)
COLOR_RED_TEXT = (192, 40, 40)
COLOR_RED_BORDER = (240, 160, 160)

COLOR_BLUE_BG = (235, 244, 255)
COLOR_BLUE_TEXT = (25, 100, 200)
COLOR_BLUE_BORDER = (175, 210, 250)

COLOR_GRAY_BG = (240, 242, 245)
COLOR_GRAY_TEXT = (100, 110, 125)
COLOR_GRAY_BORDER = (210, 215, 222)

def rounded_box(draw, box, radius=8, fill=CARD_BG, outline=BORDER_SUBTLE, width=1):
    x0, y0, x1, y1 = box
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_badge(draw, x, y, text, font, bg_col, text_col, border_col, pad_x=12, pad_y=4):
    w = draw.textlength(text, font=font)
    h = font.size + pad_y * 2
    box = (x, y, x + w + pad_x * 2, y + h)
    draw.rounded_rectangle(box, radius=4, fill=bg_col, outline=border_col, width=1)
    draw.text((x + pad_x, y + pad_y), text, font=font, fill=text_col)
    return box[2]

def draw_top_browser_bar(draw, W, title_text, url_text):
    # Simulated browser chrome
    draw.rectangle([0, 0, W, 70], fill=(232, 235, 240))
    draw.line([0, 70, W, 70], fill=(205, 210, 218), width=1)
    # Window controls
    draw.ellipse([20, 26, 34, 40], fill=(235, 95, 90))
    draw.ellipse([42, 26, 56, 40], fill=(245, 185, 60))
    draw.ellipse([64, 26, 78, 40], fill=(80, 195, 75))
    # URL bar
    draw.rounded_rectangle([120, 18, W - 120, 52], radius=6, fill=WHITE, outline=(200, 205, 212), width=1)
    f_url = get_font(18, bold=False)
    draw.text((140, 25), "🔒 https://accreditation.sti.edu" + url_text, font=f_url, fill=(70, 75, 85))

def draw_app_navbar(draw, W, active_tab="Dashboard"):
    y0 = 70
    h = 75
    draw.rectangle([0, y0, W, y0 + h], fill=NAV_DARK)
    
    # Institution Logo / System Title
    f_brand = get_font(22, bold=True)
    draw.text((35, y0 + 16), "STI WEST NEGROS UNIVERSITY", font=f_brand, fill=TEXT_WHITE)
    f_subbrand = get_font(14, bold=False)
    draw.text((35, y0 + 44), "Accreditation Management & Readiness Assessment System", font=f_subbrand, fill=(170, 185, 205))
    
    # Nav links
    tabs = ["Dashboard", "Evidence Repository", "Verification Queue", "What-If Simulation", "Compliance Matrix"]
    f_nav = get_font(18, bold=True)
    x = 650
    for t in tabs:
        w = draw.textlength(t, font=f_nav)
        is_active = (t == active_tab)
        if is_active:
            draw.rounded_rectangle([x - 12, y0 + 18, x + w + 12, y0 + 58], radius=6, fill=(45, 55, 75))
            draw.text((x, y0 + 26), t, font=f_nav, fill=TEXT_WHITE)
            draw.rectangle([x - 12, y0 + 70, x + w + 12, y0 + 74], fill=(70, 140, 240))
        else:
            draw.text((x, y0 + 26), t, font=f_nav, fill=(160, 175, 195))
        x += w + 45
        
    # User badge right
    f_user = get_font(16, bold=True)
    f_role = get_font(13, bold=False)
    draw.ellipse([W - 250, y0 + 18, W - 212, y0 + 56], fill=(55, 70, 95), outline=(120, 140, 175), width=1)
    draw.text((W - 240, y0 + 26), "CT", font=f_user, fill=TEXT_WHITE)
    draw.text((W - 200, y0 + 19), "Clyde Taburada", font=f_user, fill=TEXT_WHITE)
    draw.text((W - 200, y0 + 41), "Program Head - BSCS", font=f_role, fill=(160, 180, 210))

# ==============================================================================
# FIGURE 16: Executive 5x2 Command Dashboard
# ==============================================================================
def generate_figure16():
    W, H = 2000, 1250
    im = Image.new('RGB', (W, H), BG_CANVAS)
    d = ImageDraw.Draw(im)
    
    draw_top_browser_bar(d, W, "STI WNU Accreditation - Dashboard", "/dashboard")
    draw_app_navbar(d, W, active_tab="Dashboard")
    
    # Executive Banner
    top_y = 170
    rounded_box(d, (35, top_y, W - 35, top_y + 115), radius=10, fill=WHITE, outline=BORDER_SUBTLE, width=2)
    
    f_h1 = get_font(28, bold=True)
    d.text((60, top_y + 20), "Executive Accreditation Command Dashboard (PACUCOA Framework)", font=f_h1, fill=TEXT_DARK)
    
    f_desc = get_font(17, bold=False)
    d.text((60, top_y + 65), "Academic Program: Bachelor of Science in Computer Science (BSCS) | Survey Status: PACUCOA Level I Accreditation Preparation", font=f_desc, fill=TEXT_MUTED)
    
    # KPI Badges in Banner
    kpi_x = W - 780
    f_kpi_lbl = get_font(14, bold=True)
    f_kpi_val = get_font(26, bold=True)
    
    # Baseline Score Card
    rounded_box(d, (kpi_x, top_y + 15, kpi_x + 220, top_y + 98), radius=6, fill=COLOR_BLUE_BG, outline=COLOR_BLUE_BORDER, width=1)
    d.text((kpi_x + 15, top_y + 22), "INDICATIVE RATING", font=f_kpi_lbl, fill=COLOR_BLUE_TEXT)
    d.text((kpi_x + 15, top_y + 48), "3.22 / 5.00", font=f_kpi_val, fill=COLOR_BLUE_TEXT)
    
    # Total Exhibits Card
    rounded_box(d, (kpi_x + 240, top_y + 15, kpi_x + 460, top_y + 98), radius=6, fill=COLOR_GREEN_BG, outline=COLOR_GREEN_BORDER, width=1)
    d.text((kpi_x + 255, top_y + 22), "TOTAL EXHIBITS LOADED", font=f_kpi_lbl, fill=COLOR_GREEN_TEXT)
    d.text((kpi_x + 255, top_y + 48), "142 Files", font=f_kpi_val, fill=COLOR_GREEN_TEXT)
    
    # Floor Constraint Status Card
    rounded_box(d, (kpi_x + 480, top_y + 15, kpi_x + 720, top_y + 98), radius=6, fill=COLOR_AMBER_BG, outline=COLOR_AMBER_BORDER, width=1)
    d.text((kpi_x + 495, top_y + 22), "LEVEL I FLOOR STATUS", font=f_kpi_lbl, fill=COLOR_AMBER_TEXT)
    d.text((kpi_x + 495, top_y + 48), "3 Area Deficits", font=f_kpi_val, fill=COLOR_AMBER_TEXT)
    
    # 5x2 GRID OF PACUCOA AREAS
    areas = [
        # Row 1 (Areas I to V)
        ("Area I: Philosophy and Objectives", 1, "4.20", "Compliant", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER, 15, 15),
        ("Area II: Faculty", 6, "3.85", "Compliant", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER, 28, 28),
        ("Area III: Instruction", 6, "3.60", "Compliant", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER, 24, 25),
        ("Area IV: Laboratories", 4, "2.67", "Below Floor (3.00)", COLOR_AMBER_BG, COLOR_AMBER_TEXT, COLOR_AMBER_BORDER, 11, 16),
        ("Area V: Research", 2, "2.82", "Below Floor (3.00)", COLOR_AMBER_BG, COLOR_AMBER_TEXT, COLOR_AMBER_BORDER, 9, 14),
        # Row 2 (Areas VI to X)
        ("Area VI: Library", 3, "3.75", "Compliant", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER, 18, 19),
        ("Area VII: Community Extension", 1, "1.30", "Critical Deficit", COLOR_RED_BG, COLOR_RED_TEXT, COLOR_RED_BORDER, 4, 12),
        ("Area VIII: Student Services", 3, "3.80", "Compliant", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER, 16, 17),
        ("Area IX: Physical Plant", 2, "3.50", "Compliant", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER, 10, 11),
        ("Area X: Organization & Admin", 2, "4.10", "Compliant", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER, 12, 12),
    ]
    
    grid_y = 315
    card_w = 368
    card_h = 425
    gap_x = 22
    gap_y = 30
    
    f_area_title = get_font(18, bold=True)
    f_area_sub = get_font(14, bold=False)
    f_score_num = get_font(38, bold=True)
    f_score_lbl = get_font(14, bold=False)
    f_badge = get_font(13, bold=True)
    f_detail = get_font(14, bold=False)
    
    for idx, (title, weight, score, status, bg_c, txt_c, brd_c, verified, total) in enumerate(areas):
        row = idx // 5
        col = idx % 5
        cx0 = 35 + col * (card_w + gap_x)
        cy0 = grid_y + row * (card_h + gap_y)
        cx1 = cx0 + card_w
        cy1 = cy0 + card_h
        
        # Outer Card
        rounded_box(d, (cx0, cy0, cx1, cy1), radius=8, fill=CARD_BG, outline=brd_c if status != "Compliant" else BORDER_SUBTLE, width=2 if status != "Compliant" else 1)
        
        # Card Header
        d.rounded_rectangle([cx0, cy0, cx1, cy0 + 65], radius=8, fill=CARD_HEADER_BG)
        d.rectangle([cx0, cy0 + 55, cx1, cy0 + 65], fill=CARD_HEADER_BG)
        d.line([cx0, cy0 + 65, cx1, cy0 + 65], fill=BORDER_SUBTLE, width=1)
        
        # Title & Weight
        d.text((cx0 + 16, cy0 + 14), title, font=f_area_title, fill=TEXT_DARK)
        d.text((cx0 + 16, cy0 + 38), f"Assigned PACUCOA Weight: {weight} / 30", font=f_area_sub, fill=TEXT_MUTED)
        
        # Status Badge top right inside card body
        draw_badge(d, cx0 + 16, cy0 + 82, status, f_badge, bg_c, txt_c, brd_c)
        
        # Large Score Display
        d.text((cx0 + 16, cy0 + 130), score, font=f_score_num, fill=txt_c if status != "Compliant" else TEXT_DARK)
        d.text((cx0 + 115, cy0 + 152), "/ 5.00 Area Mean", font=f_score_lbl, fill=TEXT_MUTED)
        
        # Progress Bar
        pct = float(score) / 5.0
        bar_w = card_w - 32
        d.rounded_rectangle([cx0 + 16, cy0 + 200, cx0 + 16 + bar_w, cy0 + 214], radius=4, fill=COLOR_GRAY_BG)
        fill_col = (40, 167, 69) if status == "Compliant" else ((255, 193, 7) if "Floor" in status else (220, 53, 69))
        d.rounded_rectangle([cx0 + 16, cy0 + 200, cx0 + 16 + int(bar_w * pct), cy0 + 214], radius=4, fill=fill_col)
        
        # Documentary Evidence Metrics
        d.line([cx0 + 16, cy0 + 245, cx1 - 16, cy0 + 245], fill=BORDER_SUBTLE, width=1)
        d.text((cx0 + 16, cy0 + 265), "Verified Documents:", font=f_detail, fill=TEXT_MUTED)
        d.text((cx1 - 85, cy0 + 265), f"{verified} / {total}", font=get_font(14, bold=True), fill=TEXT_DARK)
        
        d.text((cx0 + 16, cy0 + 300), "Completeness Ratio:", font=f_detail, fill=TEXT_MUTED)
        ratio_pct = int((verified / total) * 100)
        d.text((cx1 - 65, cy0 + 300), f"{ratio_pct}%", font=get_font(14, bold=True), fill=TEXT_DARK)
        
        # Quick Drill-Down Button
        btn_box = (cx0 + 16, cy1 - 55, cx1 - 16, cy1 - 16)
        d.rounded_rectangle(btn_box, radius=6, fill=COLOR_GRAY_BG, outline=BORDER_SUBTLE, width=1)
        d.text((cx0 + 105, cy1 - 42), "Drill-Down Criteria ->", font=get_font(14, bold=True), fill=TEXT_DARK)
        
    out_path = os.path.join(OUT, "figure16_executive_dashboard.png")
    im.save(out_path, dpi=(300, 300))
    print(f"[SUCCESS] Generated {out_path}")

# ==============================================================================
# FIGURE 17: Accreditation Evidence Repository and Upload Interface
# ==============================================================================
def generate_figure17():
    W, H = 2000, 1250
    im = Image.new('RGB', (W, H), BG_CANVAS)
    d = ImageDraw.Draw(im)
    
    draw_top_browser_bar(d, W, "STI WNU Accreditation - Evidence Upload", "/evidence")
    draw_app_navbar(d, W, active_tab="Evidence Repository")
    
    # Page Header
    top_y = 170
    f_h1 = get_font(28, bold=True)
    d.text((60, top_y), "Documentary Evidence Ingestion & Mapping Repository", font=f_h1, fill=TEXT_DARK)
    f_desc = get_font(17, bold=False)
    d.text((60, top_y + 42), "Upload, tag, and associate official institutional artifacts with PACUCOA Area criteria and validity windows.", font=f_desc, fill=TEXT_MUTED)
    
    # Two Columns: Left = Upload Dropzone & Metadata Form; Right = Ingested Evidence Grid
    col_w_left = 850
    col_w_right = 990
    y_content = 250
    
    # LEFT PANEL: UPLOAD & METADATA
    left_x0 = 60
    left_x1 = left_x0 + col_w_left
    rounded_box(d, (left_x0, y_content, left_x1, y_content + 920), radius=10, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    
    # Panel Title
    d.text((left_x0 + 30, y_content + 25), "Upload New Documentary Exhibit", font=get_font(22, bold=True), fill=TEXT_DARK)
    d.line([left_x0 + 30, y_content + 65, left_x1 - 30, y_content + 65], fill=BORDER_SUBTLE, width=1)
    
    # Select Area Dropdown
    d.text((left_x0 + 30, y_content + 85), "Target PACUCOA Area:", font=get_font(16, bold=True), fill=TEXT_DARK)
    rounded_box(d, (left_x0 + 30, y_content + 115, left_x1 - 30, y_content + 165), radius=6, fill=COLOR_GRAY_BG, outline=BORDER_SUBTLE, width=1)
    d.text((left_x0 + 50, y_content + 130), "Area IV: Laboratories & Computing Facilities (Weight: 4)", font=get_font(16, bold=False), fill=TEXT_DARK)
    d.text((left_x1 - 65, y_content + 130), "[v]", font=get_font(14, bold=False), fill=TEXT_MUTED)
    
    # Select Criterion Dropdown
    d.text((left_x0 + 30, y_content + 185), "Criterion Benchmark:", font=get_font(16, bold=True), fill=TEXT_DARK)
    rounded_box(d, (left_x0 + 30, y_content + 215, left_x1 - 30, y_content + 265), radius=6, fill=COLOR_GRAY_BG, outline=BORDER_SUBTLE, width=1)
    d.text((left_x0 + 50, y_content + 230), "Criterion IV.1 - Software Licensing and Lab Maintenance Logs", font=get_font(16, bold=False), fill=TEXT_DARK)
    d.text((left_x1 - 65, y_content + 230), "[v]", font=get_font(14, bold=False), fill=TEXT_MUTED)
    
    # Drag and Drop Box
    drop_box = (left_x0 + 30, y_content + 295, left_x1 - 30, y_content + 495)
    rounded_box(d, drop_box, radius=8, fill=(248, 250, 254), outline=(150, 185, 230), width=2)
    # Upload icon & text
    d.text((left_x0 + 260, y_content + 340), "[ FILE UPLOAD DROPZONE ]", font=get_font(26, bold=True), fill=COLOR_BLUE_TEXT)
    d.text((left_x0 + 210, y_content + 395), "Drag and drop PDF exhibit here, or browse files", font=get_font(18, bold=True), fill=TEXT_DARK)
    d.text((left_x0 + 180, y_content + 430), "Supported formats: PDF, DOCX, XLSX, PNG (Max file size: 25MB)", font=get_font(14, bold=False), fill=TEXT_MUTED)
    
    # Auto-Extraction Heuristic Badge Box
    auto_box = (left_x0 + 30, y_content + 520, left_x1 - 30, y_content + 610)
    rounded_box(d, auto_box, radius=6, fill=COLOR_BLUE_BG, outline=COLOR_BLUE_BORDER, width=1)
    d.text((left_x0 + 50, y_content + 535), "[HEURISTIC PARSER] Rule-Based Text Extraction (Server-Side):", font=get_font(15, bold=True), fill=COLOR_BLUE_TEXT)
    d.text((left_x0 + 50, y_content + 565), "Detected Title: 'Computer Lab Software License Inventory AY 2025-2026' | Validated: 15-Page PDF", font=get_font(14, bold=False), fill=TEXT_DARK)
    
    # Metadata Fields
    d.text((left_x0 + 30, y_content + 635), "Exhibit Display Title:", font=get_font(16, bold=True), fill=TEXT_DARK)
    rounded_box(d, (left_x0 + 30, y_content + 665, left_x1 - 30, y_content + 715), radius=6, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    d.text((left_x0 + 50, y_content + 680), "Computer Laboratory License Inventory and Preventive Maintenance Log", font=get_font(16, bold=False), fill=TEXT_DARK)
    
    d.text((left_x0 + 30, y_content + 735), "Document Effective Date:", font=get_font(16, bold=True), fill=TEXT_DARK)
    rounded_box(d, (left_x0 + 30, y_content + 765, left_x0 + 380, y_content + 815), radius=6, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    d.text((left_x0 + 50, y_content + 780), "August 15, 2026", font=get_font(16, bold=False), fill=TEXT_DARK)
    
    d.text((left_x0 + 420, y_content + 735), "Validity Window Period:", font=get_font(16, bold=True), fill=TEXT_DARK)
    rounded_box(d, (left_x0 + 420, y_content + 765, left_x1 - 30, y_content + 815), radius=6, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    d.text((left_x0 + 440, y_content + 780), "3 Years (Valid until August 2029)", font=get_font(16, bold=False), fill=TEXT_DARK)
    
    # Submit Button
    btn_sub = (left_x0 + 30, y_content + 845, left_x1 - 30, y_content + 895)
    d.rounded_rectangle(btn_sub, radius=6, fill=(35, 115, 230))
    d.text((left_x0 + 260, y_content + 860), "Submit Exhibit to Verification Queue ->", font=get_font(17, bold=True), fill=WHITE)
    
    # RIGHT PANEL: INGESTED EXHIBIT REPOSITORY TABLE
    right_x0 = left_x1 + 30
    right_x1 = right_x0 + col_w_right
    rounded_box(d, (right_x0, y_content, right_x1, y_content + 920), radius=10, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    
    d.text((right_x0 + 30, y_content + 25), "Recently Ingested Institutional Exhibits (BSCS)", font=get_font(22, bold=True), fill=TEXT_DARK)
    d.line((right_x0 + 30, y_content + 65, right_x1 - 30, y_content + 65), fill=BORDER_SUBTLE, width=1)
    
    # Table Header
    th_y = y_content + 85
    d.rectangle([right_x0 + 20, th_y, right_x1 - 20, th_y + 45], fill=CARD_HEADER_BG)
    d.text((right_x0 + 35, th_y + 12), "EXHIBIT CODE & TITLE", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((right_x0 + 480, th_y + 12), "AREA", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((right_x0 + 630, th_y + 12), "EFFECTIVE DATE", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((right_x0 + 810, th_y + 12), "STATUS", font=get_font(14, bold=True), fill=TEXT_DARK)
    
    recent_docs = [
        ("EX-IV-001: Lab Equipment Calibration Certs", "Area IV (Labs)", "Aug 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
        ("EX-IV-002: Computer Maintenance Logbooks", "Area IV (Labs)", "Jul 2026", "Pending", COLOR_AMBER_BG, COLOR_AMBER_TEXT, COLOR_AMBER_BORDER),
        ("EX-V-001: CICT Faculty Publication Compendium", "Area V (Research)", "Sep 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
        ("EX-V-002: Student Research Colloquium Proceedings", "Area V (Research)", "Jun 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
        ("EX-VII-001: Barangay Banago Literacy Outreach MoA", "Area VII (Ext)", "Aug 2026", "Pending", COLOR_AMBER_BG, COLOR_AMBER_TEXT, COLOR_AMBER_BORDER),
        ("EX-III-004: BSCS Curriculum Matrix CMO 25 s2015", "Area III (Instr)", "May 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
        ("EX-II-008: Faculty Development Transcripts", "Area II (Faculty)", "Aug 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
        ("EX-VIII-002: Guidance Counseling Annual Report", "Area VIII (Stud)", "Jul 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
        ("EX-X-001: CICT Organizational Structure Chart", "Area X (Org)", "Jun 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
        ("EX-VI-003: IT Book Acquisition Invoices 2026", "Area VI (Library)", "Sep 2026", "Verified", COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER),
    ]
    
    row_y = th_y + 55
    for title, area, dt, st, b_bg, b_txt, b_brd in recent_docs:
        d.line([right_x0 + 20, row_y - 8, right_x1 - 20, row_y - 8], fill=BORDER_SUBTLE, width=1)
        d.text((right_x0 + 35, row_y + 4), title, font=get_font(15, bold=False), fill=TEXT_DARK)
        d.text((right_x0 + 480, row_y + 4), area, font=get_font(14, bold=False), fill=TEXT_MUTED)
        d.text((right_x0 + 630, row_y + 4), dt, font=get_font(14, bold=False), fill=TEXT_MUTED)
        draw_badge(d, right_x0 + 810, row_y, st, get_font(13, bold=True), b_bg, b_txt, b_brd)
        row_y += 70
        
    out_path = os.path.join(OUT, "figure17_evidence_management.png")
    im.save(out_path, dpi=(300, 300))
    print(f"[SUCCESS] Generated {out_path}")

# ==============================================================================
# FIGURE 18: Independent Verification Queue with Self-Verification Block
# ==============================================================================
def generate_figure18():
    W, H = 2000, 1250
    im = Image.new('RGB', (W, H), BG_CANVAS)
    d = ImageDraw.Draw(im)
    
    draw_top_browser_bar(d, W, "STI WNU Accreditation - Verification Queue", "/verification")
    draw_app_navbar(d, W, active_tab="Verification Queue")
    
    # Page Header
    top_y = 170
    f_h1 = get_font(28, bold=True)
    d.text((60, top_y), "Independent Evidence Verification Queue & Segregation of Duties", font=f_h1, fill=TEXT_DARK)
    f_desc = get_font(17, bold=False)
    d.text((60, top_y + 42), "Area Chairs and Program Heads review exhibits. Self-verification blocking prevents uploaders from validating their own submissions.", font=f_desc, fill=TEXT_MUTED)
    
    # Active Audit Banner Box
    banner_y = 250
    rounded_box(d, (60, banner_y, W - 60, banner_y + 90), radius=8, fill=COLOR_AMBER_BG, outline=COLOR_AMBER_BORDER, width=2)
    d.text((85, banner_y + 18), "[SECURITY POLICY] ENFORCED AUDIT CONTROL (PACUCOA & ISO/IEC 25010):", font=get_font(16, bold=True), fill=COLOR_AMBER_TEXT)
    d.text((85, banner_y + 48), "PostgreSQL Row-Level Security rule 'rls_prevent_self_verification' actively blocks any user from approving their own documentary exhibits.", font=get_font(15, bold=False), fill=TEXT_DARK)
    
    # Verification Table Container
    table_y = 365
    rounded_box(d, (60, table_y, W - 60, table_y + 800), radius=10, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    
    # Table Header
    th_h = 50
    d.rectangle([60, table_y, W - 60, table_y + th_h], fill=CARD_HEADER_BG)
    d.line([60, table_y + th_h, W - 60, table_y + th_h], fill=BORDER_SUBTLE, width=1)
    
    d.text((85, table_y + 15), "DOCUMENT TITLE & EXHIBIT ID", font=get_font(15, bold=True), fill=TEXT_DARK)
    d.text((580, table_y + 15), "PACUCOA CRITERION", font=get_font(15, bold=True), fill=TEXT_DARK)
    d.text((950, table_y + 15), "SUBMITTED BY", font=get_font(15, bold=True), fill=TEXT_DARK)
    d.text((1220, table_y + 15), "SUBMISSION DATE", font=get_font(15, bold=True), fill=TEXT_DARK)
    d.text((1460, table_y + 15), "VERIFICATION STATUS & ACTION", font=get_font(15, bold=True), fill=TEXT_DARK)
    
    queue_rows = [
        # (title, crit, uploader, is_self, dt, notes)
        ("EX-IV-002: Lab Preventive Maintenance Schedule AY 25-26", "Area IV - Criterion 2 (Safety & Logs)", "Prof. Maria Santos (Faculty)", False, "Oct 24, 2026", "Independent Review"),
        ("EX-IV-003: Software License Certificate of Authenticity", "Area IV - Criterion 1 (Software Systems)", "Clyde Taburada (Logged In Proponent)", True, "Oct 25, 2026", "SELF-UPLOAD DETECTED"),
        ("EX-V-003: Research Ethics Committee Protocol Approvals", "Area V - Criterion 1 (Research Agenda)", "Dr. Evelyn Perez (Area Chair)", False, "Oct 22, 2026", "Independent Review"),
        ("EX-VII-002: Community Needs Assessment Survey Report", "Area VII - Criterion 1 (Extension Programs)", "Prof. Noel Ramos (Faculty)", False, "Oct 20, 2026", "Independent Review"),
        ("EX-VII-003: Student Volunteer Community Hours Ledger", "Area VII - Criterion 2 (Student Participation)", "Clyde Taburada (Logged In Proponent)", True, "Oct 26, 2026", "SELF-UPLOAD DETECTED"),
        ("EX-III-006: OBE Syllabus & Assessment Alignment Matrix", "Area III - Criterion 3 (Outcomes Evaluation)", "Prof. Allan De la Cruz (Faculty)", False, "Oct 21, 2026", "Independent Review"),
        ("EX-II-012: Faculty Retention & Promotion Committee Report", "Area II - Criterion 4 (Faculty Welfare)", "Dr. Liza Gomez (Dean)", False, "Oct 19, 2026", "Independent Review"),
    ]
    
    curr_y = table_y + th_h
    for title, crit, uploader, is_self, dt, note in queue_rows:
        row_h = 100
        d.line([60, curr_y + row_h, W - 60, curr_y + row_h], fill=BORDER_SUBTLE, width=1)
        
        # Doc title & badge
        d.text((85, curr_y + 20), title, font=get_font(16, bold=True), fill=TEXT_DARK)
        d.text((85, curr_y + 52), "Signed URL: [Preview PDF in Cloud Sandbox]", font=get_font(14, bold=False), fill=COLOR_BLUE_TEXT)
        
        # Criterion
        d.text((580, curr_y + 35), crit, font=get_font(15, bold=False), fill=TEXT_DARK)
        
        # Uploader
        d.text((950, curr_y + 35), uploader, font=get_font(15, bold=True if is_self else False), fill=COLOR_RED_TEXT if is_self else TEXT_DARK)
        
        # Date
        d.text((1220, curr_y + 35), dt, font=get_font(14, bold=False), fill=TEXT_MUTED)
        
        # Action Buttons
        if not is_self:
            # Independent review allowed
            btn_verify = (1460, curr_y + 22, 1630, curr_y + 68)
            d.rounded_rectangle(btn_verify, radius=6, fill=(40, 167, 69))
            d.text((1485, curr_y + 35), "[+] Verify Exhibit", font=get_font(14, bold=True), fill=WHITE)
            
            btn_reject = (1650, curr_y + 22, 1780, curr_y + 68)
            d.rounded_rectangle(btn_reject, radius=6, fill=COLOR_GRAY_BG, outline=BORDER_SUBTLE, width=1)
            d.text((1680, curr_y + 35), "Reject", font=get_font(14, bold=False), fill=TEXT_DARK)
        else:
            # Self-Verification Block Enforced!
            btn_disabled = (1460, curr_y + 18, 1880, curr_y + 76)
            d.rounded_rectangle(btn_disabled, radius=6, fill=COLOR_RED_BG, outline=COLOR_RED_BORDER, width=1)
            d.text((1480, curr_y + 26), "[BLOCKED] Self-Uploaded Exhibit", font=get_font(14, bold=True), fill=COLOR_RED_TEXT)
            d.text((1480, curr_y + 50), "Requires Peer Review by Another Area Chair", font=get_font(12, bold=False), fill=COLOR_RED_TEXT)
            
        curr_y += row_h
        
    out_path = os.path.join(OUT, "figure18_verification_queue.png")
    im.save(out_path, dpi=(300, 300))
    print(f"[SUCCESS] Generated {out_path}")

# ==============================================================================
# FIGURE 19: What-If Readiness Simulation Sandbox
# ==============================================================================
def generate_figure19():
    W, H = 2000, 1250
    im = Image.new('RGB', (W, H), BG_CANVAS)
    d = ImageDraw.Draw(im)
    
    draw_top_browser_bar(d, W, "STI WNU Accreditation - What-If Simulation", "/simulation")
    draw_app_navbar(d, W, active_tab="What-If Simulation")
    
    top_y = 170
    f_h1 = get_font(28, bold=True)
    d.text((60, top_y), "Isolated What-If Readiness Simulation Sandbox", font=f_h1, fill=TEXT_DARK)
    f_desc = get_font(17, bold=False)
    d.text((60, top_y + 42), "Hypothetical scenario analysis on priority deficit criteria to forecast Level I floor compliance and Level II readiness gains.", font=f_desc, fill=TEXT_MUTED)
    
    y_content = 250
    col_w_left = 1000
    col_w_right = 840
    
    # LEFT PANEL: CRITERIA SELECTION CHECKBOXES
    left_x0 = 60
    left_x1 = left_x0 + col_w_left
    rounded_box(d, (left_x0, y_content, left_x1, y_content + 920), radius=10, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    
    d.text((left_x0 + 30, y_content + 25), "Target Deficit Criteria Selection (Max 10 Hypotheses)", font=get_font(22, bold=True), fill=TEXT_DARK)
    d.text((left_x0 + 30, y_content + 55), "Simulate the immediate mathematical impact of completing documentary exhibits in deficit areas:", font=get_font(15, bold=False), fill=TEXT_MUTED)
    d.line([left_x0 + 30, y_content + 85, left_x1 - 30, y_content + 85], fill=BORDER_SUBTLE, width=1)
    
    sim_criteria = [
        # (code, desc, area, checked)
        ("Criterion IV.1", "Software licensing agreements & genuine OS verification", "Area IV (Labs)", True),
        ("Criterion IV.4", "Annual computing facility preventive maintenance schedule", "Area IV (Labs)", True),
        ("Criterion V.1", "Institutional research agenda alignment & faculty grants", "Area V (Research)", True),
        ("Criterion V.2", "Peer-reviewed journal publications in Scopus/WoS/CHED", "Area V (Research)", True),
        ("Criterion V.3", "Patent/Copyright filing on student capstone inventions", "Area V (Research)", True),
        ("Criterion VII.1", "Adopted community program MoA with Banago Barangay", "Area VII (Extension)", True),
        ("Criterion VII.2", "Faculty-led technological transfer training workshops", "Area VII (Extension)", True),
        ("Criterion VII.3", "Student community extension participation documentation", "Area VII (Extension)", True),
        ("Criterion VII.4", "Impact assessment survey of community outreach projects", "Area VII (Extension)", True),
        ("Criterion VII.5", "Sustained budgetary allocation for social outreach", "Area VII (Extension)", True),
    ]
    
    crit_y = y_content + 105
    for code, desc, area, checked in sim_criteria:
        box_y0 = crit_y
        box_y1 = crit_y + 65
        rounded_box(d, (left_x0 + 30, box_y0, left_x1 - 30, box_y1), radius=6, fill=COLOR_BLUE_BG if checked else WHITE, outline=COLOR_BLUE_BORDER if checked else BORDER_SUBTLE, width=1)
        
        # Checkbox square
        cb_x0, cb_y0, cb_x1, cb_y1 = left_x0 + 45, box_y0 + 18, left_x0 + 75, box_y0 + 48
        d.rounded_rectangle([cb_x0, cb_y0, cb_x1, cb_y1], radius=4, fill=(35, 115, 230) if checked else WHITE, outline=(35, 115, 230), width=2)
        if checked:
            # Draw vector checkmark
            d.line([cb_x0 + 7, cb_y0 + 15, cb_x0 + 13, cb_y0 + 22], fill=WHITE, width=3)
            d.line([cb_x0 + 13, cb_y0 + 22, cb_x0 + 23, cb_y0 + 8], fill=WHITE, width=3)
            
        d.text((left_x0 + 95, box_y0 + 14), f"{code}: {desc}", font=get_font(16, bold=True), fill=TEXT_DARK)
        d.text((left_x0 + 95, box_y0 + 38), f"Deficit Classification: {area} | Target Simulated Score: 4.00 (Exemplary)", font=get_font(13, bold=False), fill=TEXT_MUTED)
        
        crit_y += 75
        
    # Run Simulation Button
    btn_sim = (left_x0 + 30, y_content + 850, left_x1 - 30, y_content + 900)
    d.rounded_rectangle(btn_sim, radius=6, fill=(35, 115, 230))
    d.text((left_x0 + 340, y_content + 865), "Recompute What-If Simulation Sandbox ->", font=get_font(18, bold=True), fill=WHITE)
    
    # RIGHT PANEL: SIMULATION RESULTS & FORECAST
    right_x0 = left_x1 + 30
    right_x1 = right_x0 + col_w_right
    rounded_box(d, (right_x0, y_content, right_x1, y_content + 920), radius=10, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    
    d.text((right_x0 + 30, y_content + 25), "Simulated PACUCOA Eligibility Forecast", font=get_font(22, bold=True), fill=TEXT_DARK)
    d.line([right_x0 + 30, y_content + 65, right_x1 - 30, y_content + 65], fill=BORDER_SUBTLE, width=1)
    
    # Large Comparison Card (Baseline vs Simulated)
    comp_box = (right_x0 + 30, y_content + 85, right_x1 - 30, y_content + 240)
    rounded_box(d, comp_box, radius=8, fill=COLOR_GRAY_BG, outline=BORDER_SUBTLE, width=1)
    
    d.text((right_x0 + 60, y_content + 105), "BASELINE PROGRAM RATING", font=get_font(14, bold=True), fill=TEXT_MUTED)
    d.text((right_x0 + 60, y_content + 130), "3.22", font=get_font(44, bold=True), fill=TEXT_DARK)
    d.text((right_x0 + 60, y_content + 195), "Eligible: Candidate Status Only", font=get_font(14, bold=False), fill=COLOR_AMBER_TEXT)
    
    # Vector Arrow
    arr_x, arr_y = right_x0 + 340, y_content + 155
    d.line([arr_x, arr_y, arr_x + 55, arr_y], fill=COLOR_BLUE_TEXT, width=4)
    d.polygon([(arr_x + 55, arr_y - 10), (arr_x + 75, arr_y), (arr_x + 55, arr_y + 10)], fill=COLOR_BLUE_TEXT)
    
    d.text((right_x0 + 460, y_content + 105), "SIMULATED PROGRAM RATING", font=get_font(14, bold=True), fill=COLOR_GREEN_TEXT)
    d.text((right_x0 + 460, y_content + 130), "3.57 (+0.35)", font=get_font(44, bold=True), fill=COLOR_GREEN_TEXT)
    d.text((right_x0 + 460, y_content + 195), "Meets Level I Floor & Level II Mean!", font=get_font(14, bold=True), fill=COLOR_GREEN_TEXT)
    
    # Area Projections Table
    d.text((right_x0 + 30, y_content + 265), "Target Area Impact Breakdown:", font=get_font(18, bold=True), fill=TEXT_DARK)
    
    t_y = y_content + 305
    d.rectangle([right_x0 + 30, t_y, right_x1 - 30, t_y + 40], fill=CARD_HEADER_BG)
    d.text((right_x0 + 45, t_y + 10), "DEFICIT AREA", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((right_x0 + 350, t_y + 10), "BASELINE", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((right_x0 + 490, t_y + 10), "SIMULATED", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((right_x0 + 650, t_y + 10), "GAIN", font=get_font(14, bold=True), fill=TEXT_DARK)
    
    proj_rows = [
        ("Area IV: Laboratories", "2.67", "3.40", "+0.73", COLOR_GREEN_TEXT),
        ("Area V: Research", "2.82", "3.62", "+0.80", COLOR_GREEN_TEXT),
        ("Area VII: Community Extension", "1.30", "3.30", "+2.00", COLOR_GREEN_TEXT),
    ]
    
    p_y = t_y + 50
    for a_lbl, b_val, s_val, g_val, col in proj_rows:
        d.line([right_x0 + 30, p_y - 6, right_x1 - 30, p_y - 6], fill=BORDER_SUBTLE, width=1)
        d.text((right_x0 + 45, p_y + 4), a_lbl, font=get_font(15, bold=True), fill=TEXT_DARK)
        d.text((right_x0 + 365, p_y + 4), b_val, font=get_font(15, bold=False), fill=COLOR_RED_TEXT)
        d.text((right_x0 + 505, p_y + 4), s_val, font=get_font(15, bold=True), fill=COLOR_GREEN_TEXT)
        d.text((right_x0 + 665, p_y + 4), g_val, font=get_font(15, bold=True), fill=col)
        p_y += 55
        
    # Dual-Constraint Floor Rule Cards
    d.text((right_x0 + 30, y_content + 530), "PACUCOA Dual-Constraint Compliance Rules:", font=get_font(18, bold=True), fill=TEXT_DARK)
    
    # Rule 1 Card
    r1_box = (right_x0 + 30, y_content + 570, right_x1 - 30, y_content + 690)
    rounded_box(d, r1_box, radius=8, fill=COLOR_GREEN_BG, outline=COLOR_GREEN_BORDER, width=1)
    d.text((right_x0 + 50, y_content + 588), "[PASSED] LEVEL I FLOOR CONSTRAINT: SATISFIED", font=get_font(16, bold=True), fill=COLOR_GREEN_TEXT)
    d.text((right_x0 + 50, y_content + 618), "Requirement: All ten (10) Area Means must be >= 3.00.", font=get_font(14, bold=False), fill=TEXT_DARK)
    d.text((right_x0 + 50, y_content + 648), "Outcome: Lowest area is now Community Extension at 3.30 (Floor Passed!).", font=get_font(13, bold=False), fill=COLOR_GREEN_TEXT)
    
    # Rule 2 Card
    r2_box = (right_x0 + 30, y_content + 715, right_x1 - 30, y_content + 835)
    rounded_box(d, r2_box, radius=8, fill=COLOR_GREEN_BG, outline=COLOR_GREEN_BORDER, width=1)
    d.text((right_x0 + 50, y_content + 733), "[PASSED] LEVEL II OVERALL THRESHOLD: SATISFIED", font=get_font(16, bold=True), fill=COLOR_GREEN_TEXT)
    d.text((right_x0 + 50, y_content + 763), "Requirement: Overall Program Rating must be >= 3.50.", font=get_font(14, bold=False), fill=TEXT_DARK)
    d.text((right_x0 + 50, y_content + 793), "Outcome: Projected Rating of 3.57 satisfies Level II criteria comfortably.", font=get_font(13, bold=False), fill=COLOR_GREEN_TEXT)
    
    out_path = os.path.join(OUT, "figure19_simulation_sandbox.png")
    im.save(out_path, dpi=(300, 300))
    print(f"[SUCCESS] Generated {out_path}")

# ==============================================================================
# FIGURE 20: Four-Column Post-Visit Compliance Tracking Matrix
# ==============================================================================
def generate_figure20():
    W, H = 2000, 1250
    im = Image.new('RGB', (W, H), BG_CANVAS)
    d = ImageDraw.Draw(im)
    
    draw_top_browser_bar(d, W, "STI WNU Accreditation - Compliance Matrix", "/recommendations")
    draw_app_navbar(d, W, active_tab="Compliance Matrix")
    
    top_y = 170
    f_h1 = get_font(28, bold=True)
    d.text((60, top_y), "PACUCOA Four-Column Post-Visit Compliance Tracking Matrix", font=f_h1, fill=TEXT_DARK)
    f_desc = get_font(17, bold=False)
    d.text((60, top_y + 42), "Tracks institutional progress on survey team recommendations, sub-numbered actions, and linked verification evidence.", font=f_desc, fill=TEXT_MUTED)
    
    # Controls / Filter Row
    ctrl_y = 250
    rounded_box(d, (60, ctrl_y, W - 60, ctrl_y + 70), radius=8, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    d.text((85, ctrl_y + 22), "Filter by Status: [ All 24 Recommendations [v] ]", font=get_font(16, bold=False), fill=TEXT_DARK)
    d.text((520, ctrl_y + 22), "Filter by Area: [ All 10 PACUCOA Areas [v] ]", font=get_font(16, bold=False), fill=TEXT_DARK)
    
    btn_exp = (W - 390, ctrl_y + 12, W - 85, ctrl_y + 58)
    d.rounded_rectangle(btn_exp, radius=6, fill=COLOR_BLUE_BG, outline=COLOR_BLUE_BORDER, width=1)
    d.text((W - 370, ctrl_y + 24), "[EXPORT] Formal Compliance Report", font=get_font(15, bold=True), fill=COLOR_BLUE_TEXT)
    
    # Matrix Table Container
    table_y = 345
    rounded_box(d, (60, table_y, W - 60, table_y + 820), radius=10, fill=WHITE, outline=BORDER_SUBTLE, width=1)
    
    # 4 Columns Widths
    c1_w = 320   # Area & Opportunity
    c2_w = 460   # PACUCOA Recommendation
    c3_w = 580   # Actions Taken by Program
    c4_w = 460   # Verification Evidence & Status
    
    th_h = 55
    d.rectangle([60, table_y, W - 60, table_y + th_h], fill=CARD_HEADER_BG)
    d.line([60, table_y + th_h, W - 60, table_y + th_h], fill=BORDER_SUBTLE, width=1)
    
    x1 = 60
    x2 = x1 + c1_w
    x3 = x2 + c2_w
    x4 = x3 + c3_w
    x_end = W - 60
    
    d.text((x1 + 20, table_y + 18), "COLUMN 1: AREA & OFI", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((x2 + 20, table_y + 18), "COLUMN 2: RECOMMENDATION", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((x3 + 20, table_y + 18), "COLUMN 3: ACTIONS TAKEN", font=get_font(14, bold=True), fill=TEXT_DARK)
    d.text((x4 + 20, table_y + 18), "COLUMN 4: VERIFICATION", font=get_font(14, bold=True), fill=TEXT_DARK)
    
    # Vertical grid lines
    d.line([x2, table_y, x2, table_y + 820], fill=BORDER_SUBTLE, width=1)
    d.line([x3, table_y, x3, table_y + 820], fill=BORDER_SUBTLE, width=1)
    d.line([x4, table_y, x4, table_y + 820], fill=BORDER_SUBTLE, width=1)
    
    compliance_items = [
        (
            "Area IV: Laboratories\nOFI #4.1: Software Licensing",
            "Acquire genuine proprietary\nsoftware licenses for specialized\ncomputer science laboratory tools.",
            "1.1 Procured 45 enterprise licenses for JetBrains.\n1.2 Implemented automated license server sync.\n1.3 Conducted quarterly licensing audit.",
            "EX-IV-002: Invoice & License Cert\nStatus: 100% Complied\nVerified by: QA Officer (Dr. Perez)",
            COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER
        ),
        (
            "Area V: Research\nOFI #5.2: Journal Publication",
            "Increase faculty research outputs\nin CHED-recognized or Scopus-\nindexed peer-reviewed journals.",
            "2.1 Formulated CICT Faculty Publication Incentive.\n2.2 Published 3 papers in international journals.\n2.3 Co-authored 2 capstone studies with students.",
            "EX-V-001: Scopus Publication Offprints\nStatus: 100% Complied\nVerified by: Dean (Dr. Gomez)",
            COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER
        ),
        (
            "Area VII: Extension\nOFI #7.1: Banago Program",
            "Establish sustained, multi-year\ntechnology transfer community\noutreach programs.",
            "3.1 Signed 3-year MoA with Barangay Banago.\n3.2 Conducted 6 computer literacy bootcamps.\n3.3 Donated refurbished PCs to community center.",
            "EX-VII-001: Signed MoA & Photo Exhibits\nStatus: 100% Complied\nVerified by: QA Officer (Dr. Perez)",
            COLOR_GREEN_BG, COLOR_GREEN_TEXT, COLOR_GREEN_BORDER
        ),
        (
            "Area II: Faculty\nOFI #2.3: Doctoral Enrollment",
            "Encourage full-time faculty\nmembers to pursue doctoral degrees\nin computer science and IT.",
            "4.1 Provided university tuition scholarship grants.\n4.2 Enrolled 2 full-time faculty in DIT programs.\n4.3 Realigned teaching loads to accommodate study.",
            "EX-II-008: DIT Enrollment Certificates\nStatus: Substantially Complied\nVerified by: Dean (Dr. Gomez)",
            COLOR_BLUE_BG, COLOR_BLUE_TEXT, COLOR_BLUE_BORDER
        ),
    ]
    
    r_y = table_y + th_h
    for c1, c2, c3, c4, bg_c, txt_c, brd_c in compliance_items:
        r_h = 180
        d.line([60, r_y + r_h, W - 60, r_y + r_h], fill=BORDER_SUBTLE, width=1)
        
        # Col 1
        d.text((x1 + 20, r_y + 25), c1, font=get_font(15, bold=True), fill=TEXT_DARK)
        # Col 2
        d.text((x2 + 20, r_y + 25), c2, font=get_font(14, bold=False), fill=TEXT_DARK)
        # Col 3
        d.text((x3 + 20, r_y + 25), c3, font=get_font(14, bold=False), fill=TEXT_DARK)
        # Col 4
        d.text((x4 + 20, r_y + 25), c4, font=get_font(14, bold=False), fill=TEXT_DARK)
        draw_badge(d, x4 + 20, r_y + 125, "[COMPLIED] Verified Exhibit", get_font(13, bold=True), bg_c, txt_c, brd_c)
        
        r_y += r_h
        
    out_path = os.path.join(OUT, "figure20_compliance_matrix.png")
    im.save(out_path, dpi=(300, 300))
    print(f"[SUCCESS] Generated {out_path}")

if __name__ == "__main__":
    generate_figure16()
    generate_figure17()
    generate_figure18()
    generate_figure19()
    generate_figure20()
