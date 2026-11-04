import os
import math
import io
import urllib.request
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

# Academic Publication Monochrome Palette
WHITE = (255, 255, 255)
BG_LIGHT = (252, 252, 252)
HEADER_DARK = (24, 28, 36)
HEADER_MID = (60, 68, 80)
HEADER_LIGHT = (235, 238, 242)
BOX_FILL_WHITE = (255, 255, 255)
BOX_FILL_LIGHT = (246, 248, 250)
BORDER_DARK = (30, 36, 46)
BORDER_LIGHT = (185, 192, 200)
LINE_DARK = (30, 36, 46)
TEXT_BLACK = (18, 22, 28)
TEXT_MUTED = (85, 95, 108)
TEXT_WHITE = (255, 255, 255)

def wrap_text(draw, text, font, max_w):
    lines = []
    for para in text.split('\n'):
        words = para.split()
        if not words:
            lines.append('')
            continue
        cur = ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if draw.textlength(t, font=font) <= max_w:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
    return lines

def rounded_box(draw, bbox, radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_text_center(draw, cx, cy, text, font, fill=TEXT_BLACK, max_w=800, line_gap=6):
    lines = wrap_text(draw, text, font, max_w)
    ascent, descent = font.getmetrics()
    line_h = ascent + descent + line_gap
    total_h = len(lines) * line_h - line_gap
    start_y = cy - total_h / 2
    for i, line in enumerate(lines):
        w = draw.textlength(line, font=font)
        draw.text((cx - w / 2, start_y + i * line_h), line, font=font, fill=fill)

def draw_arrow(draw, points, fill=LINE_DARK, width=2, head=14):
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=fill, width=width)
    x1, y1 = points[-2]
    x2, y2 = points[-1]
    angle = math.atan2(y2 - y1, x2 - x1)
    a1 = angle + math.pi * 0.82
    a2 = angle - math.pi * 0.82
    p1 = (x2 + head * math.cos(a1), y2 + head * math.sin(a1))
    p2 = (x2 + head * math.cos(a2), y2 + head * math.sin(a2))
    draw.polygon([points[-1], p1, p2], fill=fill)

def draw_diamond(draw, cx, cy, w, h, text, font, fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=2):
    pts = [(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)]
    draw.polygon(pts, fill=fill, outline=outline)
    draw.line(pts + [pts[0]], fill=outline, width=width)
    draw_text_center(draw, cx, cy, text, font, fill=TEXT_BLACK, max_w=w - 60, line_gap=4)

# ==============================================================================
# FIGURE 8: User Flow of the System Administrator
# ==============================================================================
def generate_figure8_system_admin():
    W, H = 1650, 1820
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(26, bold=True)
    f_box = get_font(20, bold=False)
    f_dia = get_font(19, bold=False)
    f_side = get_font(18, bold=False)

    cx = 580
    bw, bh = 880, 95
    y = 40
    centers = {}

    # Header
    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'FIGURE 8. USER FLOW OF THE SYSTEM ADMINISTRATOR', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 48

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=15)

    proc('s1', '1. Authenticate with Administrator Credentials and Access System Administrative Console')
    proc('s2', '2. Configure Academic Registry: Define Institution (STI WNU), Department (CICT), and Programs (BSCS, BSIT)')
    proc('s3', '3. Provision User Accounts & Assign Security Roles (QA Officer, Dean, Program Head, Area Chair, Faculty, Alumni/Student)')
    
    down('s1', 's2')
    down('s2', 's3')

    # Decision: Validation
    dh, dw = 160, 620
    d1y = y + dh / 2
    draw_arrow(d, [(cx, centers['s3'][1]), (cx, d1y - dh / 2)], fill=LINE_DARK, width=3, head=15)
    draw_diamond(d, cx, d1y, dw, dh, 'Are organizational codes &\nuser email addresses unique\nand properly formatted?', f_dia, fill=BOX_FILL_WHITE)
    y = d1y + dh / 2 + 48

    # Side branch: Invalid
    bx0, bx1 = 1120, 1580
    rounded_box(d, (bx0, d1y - 65, bx1, d1y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d1y, 'REJECTED: Prompt validation error\n(duplicate email or missing field);\nreturn to input form.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d1y), (bx0, d1y)], fill=LINE_DARK, width=3, head=15)
    d.text((cx + dw / 2 + 15, d1y - 32), 'No', font=get_font(20, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d1y + dh / 2 + 10), 'Yes', font=get_font(20, bold=True), fill=TEXT_BLACK)

    # Loop back to s3
    s3mid = (centers['s3'][0] + centers['s3'][1]) / 2
    draw_arrow(d, [((bx0 + bx1) / 2, d1y - 65), ((bx0 + bx1) / 2, s3mid), (cx + bw / 2 + 4, s3mid)], fill=LINE_DARK, width=2, head=13)

    # Step 4
    proc('s4', '4. Commit User Profile and Role Assignment to PostgreSQL Database Layer with Row-Level Security')
    draw_arrow(d, [(cx, d1y + dh / 2), (cx, centers['s4'][0])], fill=LINE_DARK, width=3, head=15)

    proc('s5', '5. Inspect System Health, Real-Time Audit Logs, and Active User Session Activity')
    proc('s6', '6. Administrative Neutrality Enforcement: System strictly restricts admin from uploading evidence, modifying scores, or verifying exhibits.')
    proc('s7', '7. Provisioning complete: Active organizational registry and timestamped administrative audit log entry generated.', h=110)

    down('s4', 's5')
    down('s5', 's6')
    down('s6', 's7')

    H2 = int(y + 25)
    im = im.crop((0, 0, W, H2))
    save_path = os.path.join(OUT, 'figure8_flow_system_admin.png')
    im.save(save_path, dpi=(250, 250))
    print(f"Figure 8 generated: {save_path}")

# ==============================================================================
# FIGURE 9: User Flow of the Quality Assurance Officer
# ==============================================================================
def generate_figure9_qa_officer():
    W, H = 1650, 1850
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(26, bold=True)
    f_box = get_font(20, bold=False)
    f_dia = get_font(19, bold=False)
    f_side = get_font(18, bold=False)

    cx = 580
    bw, bh = 880, 95
    y = 40
    centers = {}

    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'FIGURE 9. USER FLOW OF THE QUALITY ASSURANCE OFFICER', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 48

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=15)

    proc('s1', '1. Authenticate into QA Portal and Access Framework Configuration Module')
    proc('s2', '2. Select or Instantiate Accreditation Framework (PACUCOA Undergraduate 2023 Instrument)')
    proc('s3', '3. Configure Evaluative Areas & Standard Numerical Weights (Instruction = 4, Facilities = 2, other 8 Areas = 3)')
    
    down('s1', 's2')
    down('s2', 's3')

    # Decision: Weight Sum = 30
    dh, dw = 160, 620
    d1y = y + dh / 2
    draw_arrow(d, [(cx, centers['s3'][1]), (cx, d1y - dh / 2)], fill=LINE_DARK, width=3, head=15)
    draw_diamond(d, cx, d1y, dw, dh, 'Does the sum of configured\nArea weights equal exactly\nthirty (30)?', f_dia, fill=BOX_FILL_WHITE)
    y = d1y + dh / 2 + 48

    bx0, bx1 = 1120, 1580
    rounded_box(d, (bx0, d1y - 65, bx1, d1y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d1y, 'ACTIVATION BLOCKED: Total weight\ndiscrepancy. System strictly\nrequires Sum(Weights) == 30.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d1y), (bx0, d1y)], fill=LINE_DARK, width=3, head=15)
    d.text((cx + dw / 2 + 15, d1y - 32), 'No', font=get_font(20, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d1y + dh / 2 + 10), 'Yes', font=get_font(20, bold=True), fill=TEXT_BLACK)

    s3mid = (centers['s3'][0] + centers['s3'][1]) / 2
    draw_arrow(d, [((bx0 + bx1) / 2, d1y - 65), ((bx0 + bx1) / 2, s3mid), (cx + bw / 2 + 4, s3mid)], fill=LINE_DARK, width=2, head=13)

    proc('s4', '4. Establish Evaluative Criteria Provisions & Required Document Counts (R) across Areas (79 Criteria Baseline for BSCS)')
    draw_arrow(d, [(cx, d1y + dh / 2), (cx, centers['s4'][0])], fill=LINE_DARK, width=3, head=15)

    proc('s5', '5. Conduct University-Wide Documentary Oversight across all 10 PACUCOA Evaluative Areas')
    proc('s6', '6. Verification Authority: QA Officer holds institutional oversight authority and is exempt from self-verification block in current policy.')
    proc('s7', '7. Outputs: Active standardized framework, configured criteria sets, validated institutional exhibits, and university readiness summaries.', h=110)

    down('s4', 's5')
    down('s5', 's6')
    down('s6', 's7')

    H2 = int(y + 25)
    im = im.crop((0, 0, W, H2))
    save_path = os.path.join(OUT, 'figure9_flow_qa_officer.png')
    im.save(save_path, dpi=(250, 250))
    print(f"Figure 9 generated: {save_path}")

# ==============================================================================
# FIGURE 10: User Flow of the Dean
# ==============================================================================
def generate_figure10_dean():
    W, H = 1650, 1750
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(26, bold=True)
    f_box = get_font(20, bold=False)

    cx = W / 2
    bw, bh = 1100, 95
    y = 40
    centers = {}

    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'FIGURE 10. USER FLOW OF THE COLLEGE DEAN', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 48

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=15)

    proc('s1', '1. Authenticate into Executive Leadership Portal and Select College Scope (CICT)')
    proc('s2', '2. Executive 5x2 Command Dashboard: Inspect 10-Area grid, computed Area means, and color status badges (<3.00 Red, 3.00-3.49 Amber, 3.50-3.99 Yellow, >=4.00 Green)')
    proc('s3', '3. Dual-Constraint Level Floor Evaluation: Check overall rating against Candidate (>=3.00), Level I (>=3.00, no floor <3.00), and Level II (>=3.50, no floor <3.50)')
    proc('s4', '4. Inspect Isolated What-If Readiness Simulations: Review projected Area gains from 10 targeted criteria without modifying live self-survey records')
    proc('s5', '5. Inspect Four-Column Post-Visit Compliance Matrix: Review OFI, PACUCOA Recommendations, Sub-numbered Actions Taken, and Linked Exhibits')
    proc('s6', '6. Read-Only Constraint Enforcement: Executive role restricted from uploading exhibit files or altering calculated scores, ensuring objective decision support.')
    proc('s7', '7. Outputs: College-wide accreditation readiness evaluations, strategic resource allocation directives, and approved compliance tracking reports.', h=110)

    down('s1', 's2')
    down('s2', 's3')
    down('s3', 's4')
    down('s4', 's5')
    down('s5', 's6')
    down('s6', 's7')

    H2 = int(y + 25)
    im = im.crop((0, 0, W, H2))
    save_path = os.path.join(OUT, 'figure10_flow_dean.png')
    im.save(save_path, dpi=(250, 250))
    print(f"Figure 10 generated: {save_path}")

# ==============================================================================
# FIGURE 11: User Flow of the Program Head
# ==============================================================================
def generate_figure11_program_head():
    W, H = 1650, 2150
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(26, bold=True)
    f_box = get_font(20, bold=False)
    f_dia = get_font(19, bold=False)
    f_side = get_font(18, bold=False)

    cx = 580
    bw, bh = 880, 95
    y = 40
    centers = {}

    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'FIGURE 11. USER FLOW OF THE PROGRAM HEAD', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 48

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=15)

    proc('s1', '1. Authenticate into Program Management Workspace (BSCS Program)')
    proc('s2', '2. Delegate Evaluative Responsibilities: Assign faculty members to PACUCOA Areas as Area Chairs, Co-Chairs, or Working Committee Members')
    proc('s3', '3. Access Supervisory Review Queue to inspect pending exhibits, uploaded metadata, and extracted text layers')
    
    down('s1', 's2')
    down('s2', 's3')

    # Decision 1: Self-verification check
    dh, dw = 160, 620
    d1y = y + dh / 2
    draw_arrow(d, [(cx, centers['s3'][1]), (cx, d1y - dh / 2)], fill=LINE_DARK, width=3, head=15)
    draw_diamond(d, cx, d1y, dw, dh, 'Is the Program Head the\nuploader of the exhibit?\n(uploader_id == verifier_id)', f_dia, fill=BOX_FILL_WHITE)
    y = d1y + dh / 2 + 48

    bx0, bx1 = 1120, 1580
    rounded_box(d, (bx0, d1y - 65, bx1, d1y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d1y, 'BLOCKED by Self-Verification Rule:\nAction disabled; rejected by DB RLS.\nMust be reviewed by Area Chair or QA.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d1y), (bx0, d1y)], fill=LINE_DARK, width=3, head=15)
    d.text((cx + dw / 2 + 15, d1y - 32), 'Yes', font=get_font(20, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d1y + dh / 2 + 10), 'No', font=get_font(20, bold=True), fill=TEXT_BLACK)

    s3mid = (centers['s3'][0] + centers['s3'][1]) / 2
    draw_arrow(d, [((bx0 + bx1) / 2, d1y - 65), ((bx0 + bx1) / 2, s3mid), (cx + bw / 2 + 4, s3mid)], fill=LINE_DARK, width=2, head=13)

    # Decision 2: Compliance check
    d2y = y + dh / 2
    draw_arrow(d, [(cx, d1y + dh / 2), (cx, d2y - dh / 2)], fill=LINE_DARK, width=3, head=15)
    draw_diamond(d, cx, d2y, dw, dh, 'Does the exhibit satisfy\nPACUCOA compliance and\nvalidity criteria?', f_dia, fill=BOX_FILL_WHITE)
    y = d2y + dh / 2 + 48

    rounded_box(d, (bx0, d2y - 65, bx1, d2y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d2y, 'REJECTED with supervisory notes;\nuploader notified to revise and\nre-upload exhibit.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d2y), (bx0, d2y)], fill=LINE_DARK, width=3, head=15)
    d.text((cx + dw / 2 + 15, d2y - 32), 'No', font=get_font(20, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d2y + dh / 2 + 10), 'Yes', font=get_font(20, bold=True), fill=TEXT_BLACK)

    proc('s4', '4. Mark Exhibit as Verified: Scoring engine recomputes criterion score s = f(V,R) and updates Area mean in real time')
    draw_arrow(d, [(cx, d2y + dh / 2), (cx, centers['s4'][0])], fill=LINE_DARK, width=3, head=15)

    proc('s5', '5. Configure What-If Readiness Simulation: Select up to 10 unresolved criteria, apply assumed 4.00 benchmark, and project rating gain in sandbox')
    proc('s6', '6. Manage Four-Column Post-Visit Compliance Matrix: Update sub-numbered action items and linked verification exhibits')
    proc('s7', '7. Outputs: Active committee assignments, verified exhibits, simulation projections, updated compliance items, and real-time program ratings.', h=110)

    down('s4', 's5')
    down('s5', 's6')
    down('s6', 's7')

    H2 = int(y + 25)
    im = im.crop((0, 0, W, H2))
    save_path = os.path.join(OUT, 'figure11_flow_program_head.png')
    im.save(save_path, dpi=(250, 250))
    print(f"Figure 11 generated: {save_path}")

# ==============================================================================
# FIGURE 12: User Flow of the Area Chair and Co-Chair
# ==============================================================================
def generate_figure12_area_chair():
    W, H = 1650, 2050
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(26, bold=True)
    f_box = get_font(20, bold=False)
    f_dia = get_font(19, bold=False)
    f_side = get_font(18, bold=False)

    cx = 580
    bw, bh = 880, 95
    y = 40
    centers = {}

    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'FIGURE 12. USER FLOW OF THE AREA CHAIR AND CO-CHAIR', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 48

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=15)

    proc('s1', '1. Authenticate into Assigned PACUCOA Area Workspace')
    proc('s2', '2. Review Area Criteria Checklist, required document counts (R), and current completion counts (V)')
    proc('s3', '3. Access Supervisory Review Queue filtered strictly to assigned Area exhibits')
    
    down('s1', 's2')
    down('s2', 's3')

    # Decision 1: Self-verification check
    dh, dw = 160, 620
    d1y = y + dh / 2
    draw_arrow(d, [(cx, centers['s3'][1]), (cx, d1y - dh / 2)], fill=LINE_DARK, width=3, head=15)
    draw_diamond(d, cx, d1y, dw, dh, 'Is the reviewing Chair the\nuploader of the exhibit?\n(uploader_id == verifier_id)', f_dia, fill=BOX_FILL_WHITE)
    y = d1y + dh / 2 + 48

    bx0, bx1 = 1120, 1580
    rounded_box(d, (bx0, d1y - 65, bx1, d1y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d1y, 'BLOCKED by Self-Verification Rule:\nCannot verify own exhibit. Must be\nverified by Co-Chair, Head, or QA.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d1y), (bx0, d1y)], fill=LINE_DARK, width=3, head=15)
    d.text((cx + dw / 2 + 15, d1y - 32), 'Yes', font=get_font(20, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d1y + dh / 2 + 10), 'No', font=get_font(20, bold=True), fill=TEXT_BLACK)

    s3mid = (centers['s3'][0] + centers['s3'][1]) / 2
    draw_arrow(d, [((bx0 + bx1) / 2, d1y - 65), ((bx0 + bx1) / 2, s3mid), (cx + bw / 2 + 4, s3mid)], fill=LINE_DARK, width=2, head=13)

    # Decision 2: Rigor check
    d2y = y + dh / 2
    draw_arrow(d, [(cx, d1y + dh / 2), (cx, d2y - dh / 2)], fill=LINE_DARK, width=3, head=15)
    draw_diamond(d, cx, d2y, dw, dh, 'Does the exhibit meet\nPACUCOA documentary rigor\nand validity standards?', f_dia, fill=BOX_FILL_WHITE)
    y = d2y + dh / 2 + 48

    rounded_box(d, (bx0, d2y - 65, bx1, d2y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d2y, 'REJECTED with corrective feedback;\nuploader notified to submit\ncompliant documentation.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d2y), (bx0, d2y)], fill=LINE_DARK, width=3, head=15)
    d.text((cx + dw / 2 + 15, d2y - 32), 'No', font=get_font(20, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d2y + dh / 2 + 10), 'Yes', font=get_font(20, bold=True), fill=TEXT_BLACK)

    proc('s4', '4. Approve Exhibit as Verified Valid Evidence (V) for the targeted criterion')
    draw_arrow(d, [(cx, d2y + dh / 2), (cx, centers['s4'][0])], fill=LINE_DARK, width=3, head=15)

    proc('s5', '5. System recalculates criterion score s = f(V,R) and updates Area Mean in real time')
    proc('s6', '6. Outputs: Verified Area exhibits, updated criterion completion counts, and recalculated Area mean scores.', h=105)

    down('s4', 's5')
    down('s5', 's6')

    H2 = int(y + 25)
    im = im.crop((0, 0, W, H2))
    save_path = os.path.join(OUT, 'figure12_flow_area_chair.png')
    im.save(save_path, dpi=(250, 250))
    print(f"Figure 12 generated: {save_path}")

# ==============================================================================
# FIGURE 13: User Flow of the Faculty Member
# ==============================================================================
def generate_figure13_faculty_member():
    W, H = 1650, 1950
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(26, bold=True)
    f_box = get_font(20, bold=False)
    f_dia = get_font(19, bold=False)
    f_side = get_font(18, bold=False)

    cx = 580
    bw, bh = 880, 95
    y = 40
    centers = {}

    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'FIGURE 13. USER FLOW OF THE FACULTY MEMBER', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 48

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=15)

    proc('s1', '1. Authenticate into Faculty Evidence Submission Portal')
    proc('s2', '2. Select Assigned PACUCOA Area and Target Evaluative Criterion Checklist')
    proc('s3', '3. Select Exhibit File (PDF, DOCX, XLSX, Image) and Input Metadata (Title, Type, Academic Year, Effective Dates)')
    
    down('s1', 's2')
    down('s2', 's3')

    # Decision: Valid format & size
    dh, dw = 160, 620
    d1y = y + dh / 2
    draw_arrow(d, [(cx, centers['s3'][1]), (cx, d1y - dh / 2)], fill=LINE_DARK, width=3, head=15)
    draw_diamond(d, cx, d1y, dw, dh, 'Is the file format valid and\nwithin the 50MB storage\nconstraint limit?', f_dia, fill=BOX_FILL_WHITE)
    y = d1y + dh / 2 + 48

    bx0, bx1 = 1120, 1580
    rounded_box(d, (bx0, d1y - 65, bx1, d1y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d1y, 'REJECTED: File exceeds size limit\nor invalid format; prompt user to\nre-select valid document.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d1y), (bx0, d1y)], fill=LINE_DARK, width=3, head=15)
    d.text((cx + dw / 2 + 15, d1y - 32), 'No', font=get_font(20, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d1y + dh / 2 + 10), 'Yes', font=get_font(20, bold=True), fill=TEXT_BLACK)

    s3mid = (centers['s3'][0] + centers['s3'][1]) / 2
    draw_arrow(d, [((bx0 + bx1) / 2, d1y - 65), ((bx0 + bx1) / 2, s3mid), (cx + bw / 2 + 4, s3mid)], fill=LINE_DARK, width=2, head=13)

    proc('s4', '4. Upload Exhibit File to Supabase Private Object Storage Bucket with Encrypted At-Rest Policies')
    draw_arrow(d, [(cx, d1y + dh / 2), (cx, centers['s4'][0])], fill=LINE_DARK, width=3, head=15)

    proc('s5', '5. Automated Text Extraction: Server extracts text from PDF text-layer, detects dates, and suggests metadata matching')
    proc('s6', '6. Commit Exhibit Record with status "pending_verification" into supervisory review queue')
    proc('s7', '7. Separation of Duties: Faculty member restricted to upload/view permissions; strictly blocked from verifying own exhibits.')
    proc('s8', '8. Outputs: Securely stored cloud exhibit, parsed metadata record, and pending review request placed in queue.', h=110)

    down('s4', 's5')
    down('s5', 's6')
    down('s6', 's7')
    down('s7', 's8')

    H2 = int(y + 25)
    im = im.crop((0, 0, W, H2))
    save_path = os.path.join(OUT, 'figure13_flow_faculty_member.png')
    im.save(save_path, dpi=(250, 250))
    print(f"Figure 13 generated: {save_path}")

# ==============================================================================
# FIGURE 14: User Flow of the Alumni and Student Representative
# ==============================================================================
def generate_figure14_alumni_student():
    W, H = 1650, 1650
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(26, bold=True)
    f_box = get_font(20, bold=False)

    cx = W / 2
    bw, bh = 1100, 95
    y = 40
    centers = {}

    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'FIGURE 14. USER FLOW OF THE ALUMNI AND STUDENT REPRESENTATIVE', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 48

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=15)

    proc('s1', '1. Authenticate into Stakeholder Transparency Portal')
    proc('s2', '2. Access Sanitized Executive Readiness Summary Dashboard')
    proc('s3', '3. Inspect Program Readiness Rating and Accreditation Eligibility Status (Candidate, Level I, Level II)')
    proc('s4', '4. Review High-Level 10-Area Visual Progress Badges (<3.00 Red, 3.00-3.49 Amber, 3.50-3.99 Yellow, >=4.00 Green)')
    proc('s5', '5. Security Boundary Enforcement: Database Row-Level Security (RLS) strictly blocks access to confidential exhibit files, internal review queues, and faculty personnel records.')
    proc('s6', '6. Read-Only Constraint: Representative cannot upload files, alter criteria configurations, or modify readiness scores.')
    proc('s7', '7. Outputs: High-level stakeholder transparency views and institutional readiness summaries with zero risk of confidential documentary exposure.', h=110)

    down('s1', 's2')
    down('s2', 's3')
    down('s3', 's4')
    down('s4', 's5')
    down('s5', 's6')
    down('s6', 's7')

    H2 = int(y + 25)
    im = im.crop((0, 0, W, H2))
    save_path = os.path.join(OUT, 'figure14_flow_alumni_student_rep.png')
    im.save(save_path, dpi=(250, 250))
    print(f"Figure 14 generated: {save_path}")

# ==============================================================================
# FIGURE 15: Locale Map of STI West Negros University
# ==============================================================================
def generate_figure15_locale_map():
    print("Generating Figure 15 Locale Map...")
    lat = 10.6700052
    lon = 122.9573614
    zoom = 17

    def deg2num(lat_deg, lon_deg, z):
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** z
        xtile = int((lon_deg + 180.0) / 360.0 * n)
        ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return (xtile, ytile)

    cx_tile, cy_tile = deg2num(lat, lon, zoom)

    # 4 columns x 3 rows grid
    tiles_x = [cx_tile - 2, cx_tile - 1, cx_tile, cx_tile + 1]
    tiles_y = [cy_tile - 1, cy_tile, cy_tile + 1]

    grid_w = len(tiles_x) * 256
    grid_h = len(tiles_y) * 256
    map_im = Image.new('RGB', (grid_w, grid_h), WHITE)

    headers = {'User-Agent': 'CapstoneProject-STIWNU/1.0 (academic; student research)'}

    for col_idx, tx in enumerate(tiles_x):
        for row_idx, ty in enumerate(tiles_y):
            url = f'https://tile.openstreetmap.org/{zoom}/{tx}/{ty}.png'
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=12) as resp:
                    tile_data = resp.read()
                    tile_im = Image.open(io.BytesIO(tile_data))
                    map_im.paste(tile_im, (col_idx * 256, row_idx * 256))
            except Exception as e:
                print(f"Failed to fetch tile {zoom}/{tx}/{ty}: {e}")

    # Calculate exact pixel position of STI WNU
    n = 2.0 ** zoom
    x_exact = ((lon + 180.0) / 360.0 * n - tiles_x[0]) * 256
    lat_rad = math.radians(lat)
    y_exact = ((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n - tiles_y[0]) * 256

    # Create publication canvas
    CANVAS_W, CANVAS_H = 1800, 1200
    final_im = Image.new('RGB', (CANVAS_W, CANVAS_H), WHITE)
    d = ImageDraw.Draw(final_im)

    # Top header banner
    rounded_box(d, (40, 30, CANVAS_W - 40, 110), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    f_title = get_font(25, bold=True)
    draw_text_center(d, CANVAS_W / 2, 70, 'FIGURE 15. LOCALE OF THE STUDY: STI WEST NEGROS UNIVERSITY', f_title, fill=TEXT_WHITE)

    # Resize map to fit frame
    target_map_w = CANVAS_W - 80
    target_map_h = CANVAS_H - 180
    scale = min(target_map_w / grid_w, target_map_h / grid_h)
    new_w = int(grid_w * scale)
    new_h = int(grid_h * scale)
    map_resized = map_im.resize((new_w, new_h), Image.Resampling.LANCZOS)

    map_x = int((CANVAS_W - new_w) / 2)
    map_y = 130
    final_im.paste(map_resized, (map_x, map_y))

    # Border around map
    d.rectangle([map_x, map_y, map_x + new_w, map_y + new_h], outline=BORDER_DARK, width=3)

    # Pin location on resized map
    pin_x = map_x + int(x_exact * scale)
    pin_y = map_y + int(y_exact * scale)

    # Draw academic callout marker & badge
    # Draw circular bullseye on campus
    d.ellipse([pin_x - 14, pin_y - 14, pin_x + 14, pin_y + 14], fill=(220, 38, 38), outline=BORDER_DARK, width=2)
    d.ellipse([pin_x - 6, pin_y - 6, pin_x + 6, pin_y + 6], fill=WHITE)

    # Callout badge box
    badge_w, badge_h = 560, 140
    badge_x0 = min(max(pin_x - badge_w // 2, map_x + 20), map_x + new_w - badge_w - 20)
    badge_y0 = pin_y - badge_h - 25
    if badge_y0 < map_y + 20:
        badge_y0 = pin_y + 30

    # Pointer line
    d.line([pin_x, pin_y, (badge_x0 + badge_w // 2), badge_y0 + badge_h], fill=(220, 38, 38), width=3)

    rounded_box(d, (badge_x0, badge_y0, badge_x0 + badge_w, badge_y0 + badge_h), radius=8, fill=WHITE, outline=BORDER_DARK, width=3)
    # Header inside badge
    rounded_box(d, (badge_x0, badge_y0, badge_x0 + badge_w, badge_y0 + 38), radius=6, fill=HEADER_MID, outline=BORDER_DARK, width=2)
    draw_text_center(d, badge_x0 + badge_w / 2, badge_y0 + 19, 'STUDY LOCALE: RESEARCH SITE', get_font(18, bold=True), fill=TEXT_WHITE)

    f_b1 = get_font(21, bold=True)
    f_b2 = get_font(18, bold=False)
    f_b3 = get_font(16, bold=False)

    draw_text_center(d, badge_x0 + badge_w / 2, badge_y0 + 58, 'STI West Negros University (STI WNU)', f_b1, fill=TEXT_BLACK)
    draw_text_center(d, badge_x0 + badge_w / 2, badge_y0 + 86, 'College of Information and Communications Technology & QA Office', f_b2, fill=TEXT_BLACK)
    draw_text_center(d, badge_x0 + badge_w / 2, badge_y0 + 114, 'Burgos Street, Bacolod City (10.6700° N, 122.9574° E)', f_b3, fill=TEXT_MUTED)

    # Attribution footer inside map
    attr_text = "Map Data © OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright)"
    d.rectangle([map_x + 5, map_y + new_h - 28, map_x + new_w - 5, map_y + new_h - 4], fill=(255, 255, 255, 220))
    d.text((map_x + 15, map_y + new_h - 26), attr_text, font=get_font(14, bold=False), fill=TEXT_BLACK)

    save_path = os.path.join(OUT, 'figure15_locale_map.png')
    final_im.save(save_path, dpi=(250, 250))
    print(f"Figure 15 generated: {save_path}")

if __name__ == '__main__':
    print("Generating Figures 8 to 15...")
    generate_figure8_system_admin()
    generate_figure9_qa_officer()
    generate_figure10_dean()
    generate_figure11_program_head()
    generate_figure12_area_chair()
    generate_figure13_faculty_member()
    generate_figure14_alumni_student()
    generate_figure15_locale_map()
    print("All Figures 8 through 15 generated successfully!")
