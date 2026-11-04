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

# ==============================================================================
# ALMOST BLACK & WHITE / MONOCHROMATIC GRAYSCALE PALETTE (ACADEMIC PUBLICATION)
# ==============================================================================
WHITE = (255, 255, 255)
BG_LIGHT = (252, 252, 252)
HEADER_DARK = (24, 28, 36)        # Deep Charcoal/Black for Top Banners
HEADER_MID = (60, 68, 80)         # Mid Charcoal for Section Titles
HEADER_LIGHT = (232, 236, 240)    # Soft Gray for Card Banners
BOX_FILL_WHITE = (255, 255, 255)  # Pure White Box Fill
BOX_FILL_LIGHT = (246, 248, 250)  # Very Light Gray Box Fill
BORDER_DARK = (30, 36, 46)        # Sharp Dark Border
BORDER_LIGHT = (185, 192, 200)    # Soft Border
LINE_DARK = (30, 36, 46)          # Dark Arrow Lines
TEXT_BLACK = (18, 22, 28)         # Sharp High-Contrast Black Text
TEXT_MUTED = (85, 95, 108)        # Readable Neutral Gray Text
TEXT_WHITE = (255, 255, 255)      # White Text for Dark Headers

# ==============================================================================
# ROBUST TEXT & SHAPE DRAWING HELPERS (ZERO OVERLAP)
# ==============================================================================
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

def draw_text_center(draw, cx, cy, text, font, fill=TEXT_BLACK, max_w=None, line_gap=6):
    lines = wrap_text(draw, text, font, max_w) if max_w else text.split('\n')
    lh = font.size + line_gap
    total_h = len(lines) * lh - line_gap
    y = cy - total_h / 2
    for ln in lines:
        w = draw.textlength(ln, font=font)
        draw.text((cx - w / 2, y), ln, font=font, fill=fill)
        y += lh
    return total_h

def draw_text_left(draw, x_left, y_top, text, font, max_w, fill=TEXT_BLACK, line_gap=6):
    lines = wrap_text(draw, text, font, max_w)
    lh = font.size + line_gap
    y = y_top
    for ln in lines:
        draw.text((x_left, y), ln, font=font, fill=fill)
        y += lh
    return y

def rounded_box(draw, xy, radius=8, fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=2):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_card_with_header(draw, x0, y0, x1, y1, title, f_title, radius=8,
                          header_h=42, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK,
                          body_fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=2):
    # Outer box
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=body_fill, outline=outline, width=width)
    # Header box
    draw.rounded_rectangle([x0, y0, x1, y0 + header_h], radius=radius, fill=header_fill, outline=outline, width=width)
    # Cover bottom corners of header to join cleanly
    draw.rectangle([x0 + 1, y0 + header_h - radius, x1 - 1, y0 + header_h], fill=header_fill)
    draw.line([(x0, y0 + header_h), (x1, y0 + header_h)], fill=outline, width=width)
    # Title centered
    draw_text_center(draw, (x0 + x1) / 2, y0 + header_h / 2, title, f_title, fill=header_text_col, max_w=(x1 - x0) - 20)

def draw_arrow(draw, pts, fill=LINE_DARK, width=3, head=16):
    for a, b in zip(pts[:-2], pts[1:-1]):
        draw.line([a, b], fill=fill, width=width)
    (x0, y0), (x1, y1) = pts[-2], pts[-1]
    ang = math.atan2(y1 - y0, x1 - x0)
    bx, by = x1 - head * math.cos(ang), y1 - head * math.sin(ang)
    draw.line([(x0, y0), (bx, by)], fill=fill, width=width)
    left = (x1 - head * math.cos(ang - 0.40), y1 - head * math.sin(ang - 0.40))
    right = (x1 - head * math.cos(ang + 0.40), y1 - head * math.sin(ang + 0.40))
    draw.polygon([(x1, y1), left, right], fill=fill)

def draw_double_arrow(draw, pt1, pt2, fill=LINE_DARK, width=3, head=14):
    draw_arrow(draw, [pt1, pt2], fill=fill, width=width, head=head)
    draw_arrow(draw, [pt2, pt1], fill=fill, width=width, head=head)

def draw_diamond(draw, cx, cy, w, h, text, font, fill=BOX_FILL_WHITE, outline=BORDER_DARK):
    pts = [(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)]
    draw.polygon(pts, fill=fill, outline=outline)
    draw.line(pts + [pts[0]], fill=outline, width=2)
    draw_text_center(draw, cx, cy, text, font, fill=TEXT_BLACK, max_w=w * 0.65)

# ==============================================================================
# CLEAN MONOCHROME VECTOR ICONS
# ==============================================================================
def icon_user(draw, cx, cy, size=24, color=TEXT_BLACK):
    r = size // 3
    draw.ellipse([cx - r, cy - size + 2, cx + r, cy - size + 2 * r + 2], fill=color)
    draw.chord([cx - size + 4, cy - r + 4, cx + size - 4, cy + size + 2], 180, 360, fill=color)

def icon_browser(draw, cx, cy, size=24, color=TEXT_BLACK):
    w, h = size * 1.3, size * 0.95
    x0, y0, x1, y1 = cx - w, cy - h, cx + w, cy + h
    draw.rounded_rectangle([x0, y0, x1, y1], radius=5, outline=color, width=2, fill=BOX_FILL_LIGHT)
    draw.line([x0, y0 + 12, x1, y0 + 12], fill=color, width=2)
    for i in range(3):
        draw.ellipse([x0 + 6 + i * 8, y0 + 3, x0 + 10 + i * 8, y0 + 7], fill=color)

def icon_server(draw, cx, cy, size=24, color=TEXT_BLACK):
    w, h = size * 1.2, size * 0.38
    for i in range(3):
        y = cy - size + i * (h + 7)
        draw.rounded_rectangle([cx - w, y, cx + w, y + h], radius=3, outline=color, width=2, fill=BOX_FILL_LIGHT)
        draw.ellipse([cx + w - 12, y + h/2 - 3, cx + w - 6, y + h/2 + 3], fill=color)
        draw.line([cx - w + 10, y + h/2, cx - w + 24, y + h/2], fill=color, width=2)

def icon_document(draw, cx, cy, size=24, color=TEXT_BLACK):
    w, h = size * 0.8, size * 1.1
    x0, y0, x1, y1 = cx - w, cy - h, cx + w, cy + h
    draw.rectangle([x0, y0, x1, y1], fill=BOX_FILL_LIGHT, outline=color, width=2)
    draw.polygon([(x1 - 8, y0), (x1, y0 + 8), (x1 - 8, y0 + 8)], fill=HEADER_LIGHT, outline=color)
    for dy in [-6, 1, 8, 15]:
        draw.line([x0 + 5, cy + dy, x1 - 5, cy + dy], fill=color, width=2)

def icon_gear(draw, cx, cy, size=24, color=TEXT_BLACK):
    r1, r2 = size, size * 0.5
    draw.ellipse([cx - r1, cy - r1, cx + r1, cy + r1], outline=color, width=3, fill=BOX_FILL_LIGHT)
    draw.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=color)
    for deg in range(0, 360, 45):
        rad = math.radians(deg)
        tx = cx + (r1 + 4) * math.cos(rad)
        ty = cy + (r1 + 4) * math.sin(rad)
        draw.ellipse([tx - 3, ty - 3, tx + 3, ty + 3], fill=color)

def icon_shield(draw, cx, cy, size=24, color=TEXT_BLACK):
    pts = [
        (cx, cy - size),
        (cx + size, cy - size * 0.55),
        (cx + size * 0.75, cy + size * 0.45),
        (cx, cy + size),
        (cx - size * 0.75, cy + size * 0.45),
        (cx - size, cy - size * 0.55)
    ]
    draw.polygon(pts, fill=BOX_FILL_LIGHT, outline=color)
    draw.line(pts + [pts[0]], fill=color, width=2)
    draw.line([(cx - 7, cy), (cx - 2, cy + 6), (cx + 8, cy - 6)], fill=color, width=2)

def icon_database(draw, cx, cy, size=24, color=TEXT_BLACK):
    w, h = size * 1.05, size * 1.3
    x0, y0, x1, y1 = cx - w, cy - h, cx + w, cy + h
    draw.rectangle([x0, y0 + 10, x1, y1 - 10], fill=BOX_FILL_LIGHT, outline=color, width=2)
    draw.line([x0, y0 + 10, x0, y1 - 10], fill=color, width=2)
    draw.line([x1, y0 + 10, x1, y1 - 10], fill=color, width=2)
    draw.ellipse([x0, y0, x1, y0 + 20], fill=HEADER_LIGHT, outline=color, width=2)
    draw.ellipse([x0, cy - 6, x1, cy + 14], fill=BOX_FILL_LIGHT, outline=color, width=1)
    draw.ellipse([x0, y1 - 20, x1, y1], fill=BOX_FILL_LIGHT, outline=color, width=2)

def icon_cloud(draw, cx, cy, size=24, color=TEXT_BLACK):
    r = size * 0.55
    draw.ellipse([cx - r * 1.5, cy - r * 0.5, cx - r * 0.1, cy + r * 0.9], fill=BOX_FILL_LIGHT, outline=color, width=2)
    draw.ellipse([cx - r * 0.7, cy - r * 1.2, cx + r * 0.7, cy + r * 0.5], fill=BOX_FILL_LIGHT, outline=color, width=2)
    draw.ellipse([cx + r * 0.1, cy - r * 0.6, cx + r * 1.5, cy + r * 0.9], fill=BOX_FILL_LIGHT, outline=color, width=2)
    draw.rectangle([cx - r * 1.2, cy + r * 0.1, cx + r * 1.2, cy + r * 0.9], fill=BOX_FILL_LIGHT)
    draw.line([cx - r * 1.3, cy + r * 0.9, cx + r * 1.3, cy + r * 0.9], fill=color, width=2)


# ==============================================================================
# FIGURE 1: Conceptual Framework (Input - Process - Output with Feedback Loop)
# ==============================================================================
def figure1_conceptual_framework():
    W, H = 2000, 960
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(32, bold=True)
    f_head = get_font(24, bold=True)
    f_body = get_font(21, bold=False)

    # Top Banner
    rounded_box(d, (60, 40, W - 60, 115), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, 77, 'CONCEPTUAL FRAMEWORK: INPUT - PROCESS - OUTPUT (IPO) MODEL', f_title, fill=TEXT_WHITE)

    cols = [
        ('INPUTS', [
            '• PACUCOA 2023 Manual (10 Areas, sum=30 weights, floor criteria)',
            '• Institutional BSCS & CICT quality assurance documentary exhibits',
            '• Stakeholder profiles, role credentials, and area assignments',
            '• Previous survey recommendations & 4-column compliance records',
            '• Quality Assurance Office validity window rules and proxy counts (R)'
        ]),
        ('PROCESSES', [
            '• Automated PDF text-layer extraction, date tagging, & keyword matching',
            '• Multi-tier role-based access control with self-verification blocking',
            '• Piecewise criterion scoring & 30-weight Area mean aggregation',
            '• Dual-constraint eligibility evaluation (Candidate, Levels I to IV)',
            '• Isolated what-if readiness simulation sandbox',
            '• Continuous compliance tracking with sub-numbered action linking',
            '• Comprehensive audit trail logging (actor, table, timestamp)'
        ]),
        ('OUTPUTS', [
            '• Centralized criterion-mapped institutional evidence repository',
            '• Panoramic Executive 5x2 command dashboard with RAG status badges',
            '• Real-time indicative program readiness ratings and gap heatmaps',
            '• Simulated what-if gap projection reports for priority criteria',
            '• Auditable 4-column post-visit compliance matrix with exhibits',
            '• Validated software quality evaluation profile (ISO/IEC 25010)'
        ])
    ]

    bw, gap, top, bot = 570, 75, 155, 780
    xs = [70, 70 + bw + gap, 70 + 2 * (bw + gap)]

    for x, (title, items) in zip(xs, cols):
        draw_card_with_header(d, x, top, x + bw, bot, title, f_head, radius=10, header_h=55,
                              header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK, body_fill=BOX_FILL_WHITE)
        y = top + 75
        for it in items:
            lines = wrap_text(d, it, f_body, bw - 45)
            h = len(lines) * (f_body.size + 6) + 16
            rounded_box(d, (x + 16, y, x + bw - 16, y + h), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
            draw_text_left(d, x + 26, y + 8, it, f_body, bw - 52, fill=TEXT_BLACK, line_gap=6)
            y += h + 14

    # Connectors
    arrow_y = (top + bot) / 2
    draw_arrow(d, [(xs[0] + bw + 6, arrow_y), (xs[1] - 6, arrow_y)], fill=LINE_DARK, width=4, head=18)
    draw_arrow(d, [(xs[1] + bw + 6, arrow_y), (xs[2] - 6, arrow_y)], fill=LINE_DARK, width=4, head=18)

    # Feedback Loop at bottom
    fy = bot + 85
    box_w, box_h = 1260, 54
    rounded_box(d, (W / 2 - box_w / 2, fy - box_h / 2, W / 2 + box_w / 2, fy + box_h / 2), radius=6, fill=HEADER_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, fy, 'FEEDBACK LOOP: Gap Remediation, Supplementary Evidence Ingestion, & Continuous Policy Refinement', get_font(20, bold=True), fill=TEXT_BLACK)

    ox = xs[2] + bw / 2
    ix = xs[0] + bw / 2
    draw_arrow(d, [(ox, bot + 4), (ox, fy), (W / 2 + box_w / 2 + 4, fy)], fill=LINE_DARK, width=3, head=14)
    draw_arrow(d, [(W / 2 - box_w / 2, fy), (ix, fy), (ix, bot + 6)], fill=LINE_DARK, width=3, head=16)

    im.save(os.path.join(OUT, 'figure1_conceptual_framework.png'), dpi=(250, 250))
    print("Figure 1 generated (Monochrome).")


# ==============================================================================
# FIGURE 2: SDLC Agile Scrum Framework (4 Iterations) - ZERO OVERLAP
# ==============================================================================
def figure2_sdlc_scrum():
    W, H = 2200, 1080
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(32, bold=True)
    f_sub = get_font(22, bold=True)
    f_body = get_font(18, bold=False)
    f_label = get_font(19, bold=True)

    # Title Banner
    rounded_box(d, (60, 35, W - 60, 110), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, 72, 'SOFTWARE DEVELOPMENT LIFE CYCLE (SDLC): AGILE SCRUM FRAMEWORK', f_title, fill=TEXT_WHITE)

    # Top Section: Scrum Cycle
    scrum_w, scrum_h = 360, 150
    sy = 145
    s_steps = [
        ('1. PRODUCT BACKLOG', 'PACUCOA Criteria (79)\nCICT Compliance Analysis\nStakeholder User Stories'),
        ('2. SPRINT PLANNING', 'Backlog Prioritization\n2-Week Sprint Cadence\nAcceptance Criteria'),
        ('3. SPRINT EXECUTION', 'Iterative Prototyping\nDaily Scrum Meetings\nCode Review & Git CI'),
        ('4. SPRINT REVIEW', 'Working Increment Demo\nStakeholder Feedback\nAcceptance Testing'),
        ('5. RETROSPECTIVE', 'Security & Process Audit\nArchitecture Optimization\nSprint Refinements')
    ]
    s_xs = []
    sx = 70
    s_gap = 65
    for title, desc in s_steps:
        draw_card_with_header(d, sx, sy, sx + scrum_w, sy + scrum_h, title, get_font(19, bold=True),
                              radius=8, header_h=38, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK,
                              body_fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, sx + scrum_w / 2, sy + 92, desc, f_body, fill=TEXT_BLACK, max_w=scrum_w - 30, line_gap=5)
        s_xs.append(sx)
        sx += scrum_w + s_gap

    for i in range(len(s_xs) - 1):
        draw_arrow(d, [(s_xs[i] + scrum_w + 4, sy + scrum_h / 2), (s_xs[i+1] - 4, sy + scrum_h / 2)], fill=LINE_DARK, width=4, head=16)

    # Feedback loop from step 5 to step 2
    ret_x = s_xs[4] + scrum_w / 2
    plan_x = s_xs[1] + scrum_w / 2
    d.line([(ret_x, sy + scrum_h), (ret_x, sy + scrum_h + 30), (plan_x, sy + scrum_h + 30), (plan_x, sy + scrum_h + 4)], fill=LINE_DARK, width=3)
    draw_arrow(d, [(plan_x, sy + scrum_h + 15), (plan_x, sy + scrum_h + 4)], fill=LINE_DARK, width=3, head=14)

    # Middle Banner
    my = 360
    rounded_box(d, (W / 2 - 340, my - 22, W / 2 + 340, my + 22), radius=6, fill=HEADER_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, my, 'FOUR DEVELOPMENTAL ITERATIONS (AUGUST - OCTOBER 2026)', get_font(21, bold=True), fill=TEXT_BLACK)

    # Bottom Section: 4 Iteration Cards
    card_w = 480
    card_gap = 45
    c_top = 410
    c_bot = 1030
    c_xs = [70 + i * (card_w + card_gap) for i in range(4)]

    iterations = [
        ('ITERATION 1', 'Late Aug - Early Sep 2026', 'Foundational Architecture & Access Control',
         'Database modeling, authentication, security policies, and baseline institutional registry.',
         ['• Supabase PostgreSQL relational schema',
          '• Next.js 14 App Router project setup',
          '• Role-Based Access Control (8 roles)',
          '• Row-Level Security (RLS) policies',
          '• Department & Program master data'],
         'Functional database schema, user registration and login, session handling, initial UI layout.'),

        ('ITERATION 2', 'September 2026', 'Criteria Setup, Evidence Storage & PDF Ingestion',
         'PACUCOA 10 Areas setup, criteria mapping, evidence upload, and automated text extraction.',
         ['• 79 BSCS baseline criteria configured',
          '• File upload UI (PDF, DOCX, XLSX, PNG)',
          '• Server-side PDF text parser & OCR',
          '• Effective date & document-type tagging',
          '• Self-verification block enforcement'],
         'Centralized evidence repository, PDF parser, and multi-tier verification queues.'),

        ('ITERATION 3', 'Late Sep - Early Oct 2026', 'Scoring Engine, 5x2 Dashboard & Simulation',
         'Mathematical readiness scoring, panoramic dashboard visualization, and what-if sandbox.',
         ['• Piecewise criterion formula s = f(V, R)',
          '• 30-weight Area mean aggregation',
          '• Dual-constraint level floor evaluation',
          '• Executive 5x2 command dashboard',
          '• Isolated what-if simulation engine'],
         'Real-time scoring engine, 5x2 dashboard with RAG badges, and simulation sandbox.'),

        ('ITERATION 4', 'October 2026', 'Compliance Matrix, Security Audit & Evaluation',
         'Post-visit compliance tracking, comprehensive audit logging, and ISO/IEC 25010 evaluation.',
         ['• 4-Column compliance matrix module',
          '• Sub-numbered action tracking (1.1, 1.2)',
          '• Linked exhibit verification tags',
          '• Cryptographic audit trail logging',
          '• ISO/IEC 25010 evaluation (N=15)'],
         'Production compliance module, complete audit log, and validated ISO/IEC 25010 dataset.')
    ]

    for x, (iter_num, dates, subtitle, focus, features, artifacts) in zip(c_xs, iterations):
        # Outer Card
        draw_card_with_header(d, x, c_top, x + card_w, c_bot, f"{iter_num} ({dates})", get_font(18, bold=True),
                              radius=8, header_h=40, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK,
                              body_fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=2)

        # Subtitle box
        rounded_box(d, (x + 14, c_top + 50, x + card_w - 14, c_top + 105), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
        draw_text_center(d, x + card_w / 2, c_top + 77, subtitle, get_font(18, bold=True), fill=TEXT_BLACK, max_w=card_w - 35)

        # Focus Box
        cur_y = c_top + 118
        d.text((x + 16, cur_y), "Focus:", font=f_label, fill=TEXT_BLACK)
        cur_y += 24
        rounded_box(d, (x + 14, cur_y, x + card_w - 14, cur_y + 90), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
        draw_text_left(d, x + 24, cur_y + 10, focus, f_body, card_w - 48, fill=TEXT_BLACK, line_gap=4)
        cur_y += 102

        # Key Features Box
        d.text((x + 16, cur_y), "Key Features:", font=f_label, fill=TEXT_BLACK)
        cur_y += 24
        feat_text = "\n".join(features)
        rounded_box(d, (x + 14, cur_y, x + card_w - 14, cur_y + 190), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
        draw_text_left(d, x + 24, cur_y + 10, feat_text, f_body, card_w - 48, fill=TEXT_BLACK, line_gap=7)
        cur_y += 202

        # Artifacts Box
        d.text((x + 16, cur_y), "Artifacts:", font=f_label, fill=TEXT_BLACK)
        cur_y += 24
        rounded_box(d, (x + 14, cur_y, x + card_w - 14, cur_y + 82), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
        draw_text_left(d, x + 24, cur_y + 10, artifacts, f_body, card_w - 48, fill=TEXT_BLACK, line_gap=5)

    im.save(os.path.join(OUT, 'figure2_sdlc_scrum.png'), dpi=(250, 250))
    print("Figure 2 generated (Monochrome).")


# ==============================================================================
# FIGURE 3: System Architecture (3-Tier with B&W Vector Icons)
# ==============================================================================
def figure3_system_architecture():
    W, H = 2200, 1250
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(32, bold=True)
    f_tier = get_font(22, bold=True)
    f_head = get_font(19, bold=True)
    f_body = get_font(17, bold=False)

    # Title Banner
    rounded_box(d, (60, 30, W - 60, 105), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, 67, 'SYSTEM ARCHITECTURE: THREE-TIER CLOUD INFRASTRUCTURE', f_title, fill=TEXT_WHITE)

    # ------------------ TIER 1: CLIENT PRESENTATION TIER ------------------
    t1_y0, t1_y1 = 135, 470
    draw_card_with_header(d, 70, t1_y0, W - 70, t1_y1, 'TIER 1: PRESENTATION LAYER (CLIENT INTERFACE)', f_tier,
                          radius=10, header_h=42, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK)

    # Left: User Roles
    rounded_box(d, (95, t1_y0 + 55, 820, t1_y1 - 25), radius=8, fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=1)
    icon_user(d, 145, t1_y0 + 95, size=24, color=TEXT_BLACK)
    d.text((185, t1_y0 + 85), "INSTITUTIONAL ROLES & SCOPES", font=f_head, fill=TEXT_BLACK)
    users_text = (
        "• System Admin (System registry, account provisioning)\n"
        "• QA Officer (PACUCOA framework & university oversight)\n"
        "• College Dean (Multi-program readiness & monitoring)\n"
        "• Program Head (Area delegation & supervisory review)\n"
        "• Area Chair / Co-Chair (Evidence audit & criteria verification)\n"
        "• Faculty Member (Document upload & metadata tagging)\n"
        "• Alumni / Student Reps (Readiness view & summaries)"
    )
    draw_text_left(d, 120, t1_y0 + 130, users_text, f_body, 670, fill=TEXT_BLACK, line_gap=6)

    # Right: Web Client Interface
    rounded_box(d, (850, t1_y0 + 55, W - 95, t1_y1 - 25), radius=8, fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=1)
    icon_browser(d, 900, t1_y0 + 95, size=24, color=TEXT_BLACK)
    d.text((940, t1_y0 + 85), "NEXT.JS 14 WEB CLIENT INTERFACE (Tailwind CSS)", font=f_head, fill=TEXT_BLACK)

    ui_cols = [
        ('5x2 Executive Dashboard', 'Panoramic 10-Area grid, progress bars, color status badges (<3.00 to >=4.00)'),
        ('Evidence Repository UI', 'Criterion-mapped document explorer, uploader UI, metadata forms'),
        ('Verification Queue', 'Separation of duty check, reject/approve actions, self-review block'),
        ('Simulation Sandbox UI', 'Interactive criterion toggles, projected Area scores & delta display'),
        ('Compliance Matrix UI', '4-Column table, sub-numbered actions (1.1, 1.2), direct exhibit links')
    ]
    uix = 875
    for title, desc in ui_cols:
        rounded_box(d, (uix, t1_y0 + 130, uix + 225, t1_y1 - 35), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
        draw_text_center(d, uix + 112, t1_y0 + 155, title, get_font(17, bold=True), fill=TEXT_BLACK, max_w=205)
        draw_text_center(d, uix + 112, t1_y0 + 225, desc, get_font(15), fill=TEXT_MUTED, max_w=205, line_gap=4)
        uix += 240

    # Connector Arrows Tier 1 to Tier 2
    for mx in [450, 1100, 1750]:
        draw_arrow(d, [(mx, t1_y1 + 4), (mx, t1_y1 + 55)], fill=LINE_DARK, width=3, head=14)
        d.text((mx + 15, t1_y1 + 22), "HTTPS / REST", font=get_font(15, bold=True), fill=TEXT_MUTED)

    # ------------------ TIER 2: APPLICATION & COMPUTATIONAL LOGIC ------------------
    t2_y0, t2_y1 = 525, 835
    draw_card_with_header(d, 70, t2_y0, W - 70, t2_y1, 'TIER 2: APPLICATION & BUSINESS LOGIC LAYER', f_tier,
                          radius=10, header_h=42, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK)

    modules = [
        ('Server Actions & API Guards',
         'Validates session tokens, enforces route guards, and validates role scopes before executing operations.',
         icon_server),
        ('PDF Parser & Text Ingestion',
         'Extracts embedded text layers, extracts effective dates, and suggests matching document types and criteria.',
         icon_document),
        ('Mathematical Scoring Engine',
         'Computes criterion scores s = f(V,R), 30-weight Area means, and enforces dual-constraint level floor rules.',
         icon_gear),
        ('Self-Verification Gateway',
         'Enforces separation of duties (uploader != verifier) for all Area Chairs and Program Heads (QA exempt).',
         icon_shield),
        ('Simulation Sandbox Engine',
         'Applies benchmark 4.00 scores to selected priority criteria in an isolated non-mutating calculation layer.',
         icon_cloud)
    ]

    mod_w = 380
    mod_gap = 35
    mod_xs = [95 + i * (mod_w + mod_gap) for i in range(5)]
    for x, (title, desc, icon_fn) in zip(mod_xs, modules):
        rounded_box(d, (x, t2_y0 + 50, x + mod_w, t2_y1 - 20), radius=8, fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=1)
        rounded_box(d, (x, t2_y0 + 50, x + mod_w, t2_y0 + 120), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
        icon_fn(d, x + 50, t2_y0 + 85, size=22, color=TEXT_BLACK)
        draw_text_center(d, x + 225, t2_y0 + 85, title, get_font(17, bold=True), fill=TEXT_BLACK, max_w=250)
        draw_text_left(d, x + 20, t2_y0 + 140, desc, f_body, mod_w - 40, fill=TEXT_BLACK, line_gap=6)

    # Connector Arrows Tier 2 to Tier 3
    for mx in [350, 1100, 1850]:
        draw_arrow(d, [(mx, t2_y1 + 4), (mx, t2_y1 + 55)], fill=LINE_DARK, width=3, head=14)
        d.text((mx + 15, t2_y1 + 22), "SQL / RLS", font=get_font(15, bold=True), fill=TEXT_MUTED)

    # ------------------ TIER 3: DATA & CLOUD STORAGE TIER ------------------
    t3_y0, t3_y1 = 890, 1200
    draw_card_with_header(d, 70, t3_y0, W - 70, t3_y1, 'TIER 3: DATA & CLOUD STORAGE LAYER (SUPABASE BACKEND)', f_tier,
                          radius=10, header_h=42, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK)

    db_cards = [
        ('Supabase Authentication',
         'Encrypted JWT sessions, user credentials, role assignments, and departmental scope metadata.',
         icon_shield),
        ('PostgreSQL 15 Relational DB',
         '14 normalized tables: institutions, departments, programs, 10 Areas, criteria, evidence, scores, audit log.',
         icon_database),
        ('Row-Level Security (RLS)',
         'Database-level authorization policies enforcing tenant isolation and uploader != verifier constraints.',
         icon_shield),
        ('Supabase Object Storage',
         'Private object buckets for accreditation exhibits (PDF, DOCX, XLSX, PNG) via short-lived signed URLs.',
         icon_cloud)
    ]

    db_w = 475
    db_gap = 40
    db_xs = [95 + i * (db_w + db_gap) for i in range(4)]
    for x, (title, desc, icon_fn) in zip(db_xs, db_cards):
        rounded_box(d, (x, t3_y0 + 50, x + db_w, t3_y1 - 20), radius=8, fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=1)
        rounded_box(d, (x, t3_y0 + 50, x + db_w, t3_y0 + 120), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_LIGHT, width=1)
        icon_fn(d, x + 50, t3_y0 + 85, size=22, color=TEXT_BLACK)
        draw_text_center(d, x + 260, t3_y0 + 85, title, get_font(18, bold=True), fill=TEXT_BLACK, max_w=db_w - 110)
        draw_text_left(d, x + 25, t3_y0 + 145, desc, f_body, db_w - 50, fill=TEXT_BLACK, line_gap=6)

    im.save(os.path.join(OUT, 'figure3_system_architecture.png'), dpi=(250, 250))
    print("Figure 3 generated (Monochrome).")


# ==============================================================================
# FIGURE 4: Context Flow Diagram (DFD Level 0)
# ==============================================================================
def figure4_context_diagram():
    W, H = 2200, 1450
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(32, bold=True)
    f_head = get_font(20, bold=True)
    f_body = get_font(16, bold=False)

    # Title
    rounded_box(d, (60, 30, W - 60, 105), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, 67, 'CONTEXT FLOW DIAGRAM (DATA FLOW DIAGRAM LEVEL 0)', f_title, fill=TEXT_WHITE)

    cx, cy = W / 2, H / 2 + 25
    cr_w, cr_h = 580, 230

    # Central System Process (0.0)
    rounded_box(d, (cx - cr_w / 2, cy - cr_h / 2, cx + cr_w / 2, cy + cr_h / 2), radius=20, fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=3)
    rounded_box(d, (cx - cr_w / 2, cy - cr_h / 2, cx + cr_w / 2, cy - cr_h / 2 + 55), radius=20, fill=HEADER_LIGHT, outline=BORDER_DARK, width=3)
    d.rectangle([cx - cr_w / 2 + 1, cy - cr_h / 2 + 30, cx + cr_w / 2 - 1, cy - cr_h / 2 + 55], fill=HEADER_LIGHT)
    draw_text_center(d, cx, cy - cr_h / 2 + 28, 'PROCESS 0.0', get_font(21, bold=True), fill=TEXT_BLACK)
    draw_text_center(d, cx, cy + 30, 'WEB-BASED ACCREDITATION\nMANAGEMENT AND READINESS\nASSESSMENT SYSTEM', get_font(25, bold=True), fill=TEXT_BLACK, line_gap=8)

    # 7 External Entities
    ent_w, ent_h = 420, 155
    entities = [
        ('SYSTEM ADMINISTRATOR', 90, 155,
         'In: Academic registry, user accounts, roles\nOut: Configuration confirmations, audit logs'),

        ('QA OFFICER', W / 2 - ent_w / 2, 145,
         'In: PACUCOA framework, areas, weights, criteria\nOut: University readiness summaries, compliance logs'),

        ('CICT COLLEGE DEAN', W - 90 - ent_w, 155,
         'In: Accreditation directives, audit authorizations\nOut: 5x2 executive dashboards, college heatmaps'),

        ('PROGRAM HEAD (BSCS)', 90, cy - ent_h / 2,
         'In: Area delegations, criteria reviews, approvals\nOut: Program rating (30-wt), floor status, simulations'),

        ('AREA CHAIR / CO-CHAIR', W - 90 - ent_w, cy - ent_h / 2,
         'In: Evidence verification reviews, notes\nOut: Area progress, pending queues, block notices'),

        ('FACULTY MEMBER', 90, H - 250,
         'In: Documentary exhibits (PDF, DOCX), metadata\nOut: Upload receipts, verification feedback notes'),

        ('PACUCOA SURVEYORS / AUDITORS', W - 90 - ent_w, H - 250,
         'In: Accreditation survey audit inquiries\nOut: 4-Column compliance matrix, exhibit dossiers')
    ]

    for title, ex, ey, desc in entities:
        draw_card_with_header(d, ex, ey, ex + ent_w, ey + ent_h, title, f_head, radius=8,
                              header_h=38, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK,
                              body_fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_left(d, ex + 18, ey + 50, desc, f_body, ent_w - 36, fill=TEXT_BLACK, line_gap=6)

    # Clean Directional Arrows
    # Admin to System (Top Left)
    draw_arrow(d, [(90 + ent_w, 245), (cx - 150, cy - cr_h / 2)], fill=LINE_DARK, width=3, head=14)
    # QA to System (Top Center)
    draw_arrow(d, [(W / 2 - 40, 305), (W / 2 - 40, cy - cr_h / 2)], fill=LINE_DARK, width=3, head=14)
    draw_arrow(d, [(W / 2 + 40, cy - cr_h / 2), (W / 2 + 40, 305)], fill=LINE_DARK, width=3, head=14)
    # Dean to System (Top Right)
    draw_arrow(d, [(W - 90 - ent_w, 245), (cx + 150, cy - cr_h / 2)], fill=LINE_DARK, width=3, head=14)
    # Program Head to System (Mid Left)
    draw_arrow(d, [(90 + ent_w, cy - 20), (cx - cr_w / 2, cy - 20)], fill=LINE_DARK, width=3, head=14)
    draw_arrow(d, [(cx - cr_w / 2, cy + 20), (90 + ent_w, cy + 20)], fill=LINE_DARK, width=3, head=14)
    # Area Chair to System (Mid Right)
    draw_arrow(d, [(W - 90 - ent_w, cy - 20), (cx + cr_w / 2, cy - 20)], fill=LINE_DARK, width=3, head=14)
    draw_arrow(d, [(cx + cr_w / 2, cy + 20), (W - 90 - ent_w, cy + 20)], fill=LINE_DARK, width=3, head=14)
    # Faculty to System (Bottom Left)
    draw_arrow(d, [(90 + ent_w, H - 200), (cx - 150, cy + cr_h / 2)], fill=LINE_DARK, width=3, head=14)
    # PACUCOA to System (Bottom Right)
    draw_arrow(d, [(cx + 150, cy + cr_h / 2), (W - 90 - ent_w, H - 200)], fill=LINE_DARK, width=3, head=14)

    im.save(os.path.join(OUT, 'figure4_context_diagram.png'), dpi=(250, 250))
    print("Figure 4 generated (Monochrome).")


# ==============================================================================
# FIGURE 5: Data Flow Diagram (Level 1)
# ==============================================================================
def figure5_data_flow_diagram():
    W, H = 2400, 930
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(32, bold=True)
    f_proc = get_font(19, bold=True)
    f_body = get_font(16, bold=False)

    # Title
    rounded_box(d, (60, 30, W - 60, 105), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, 67, 'DATA FLOW DIAGRAM (DFD LEVEL 1): SUB-PROCESSES & DATA STORES', f_title, fill=TEXT_WHITE)

    # 7 Sub-processes
    pw, ph = 470, 145
    p_row1_y = 150
    p_row2_y = 680

    p_col1_xs = [80 + i * (pw + 75) for i in range(4)]
    p_col2_xs = [200 + i * (pw + 240) for i in range(3)]

    processes = [
        # Row 1
        (p_col1_xs[0], p_row1_y, '1.0 User Authentication\n& Scope Provisioning',
         'Validates JWT sessions, assigns user roles, and enforces department scopes.'),
        (p_col1_xs[1], p_row1_y, '2.0 Framework Setup\n& Area Delegation',
         'Configures 10 Areas, 30 weights, 79 criteria, and assigns Area Chairs/Members.'),
        (p_col1_xs[2], p_row1_y, '3.0 Evidence Ingestion\n& PDF Text Extraction',
         'Extracts PDF text layer, validates effective dates, and suggests criteria mapping.'),
        (p_col1_xs[3], p_row1_y, '4.0 Independent Verification\n& Separation of Duty',
         'Enforces self-verification block (uploader != reviewer) for approval/rejection.'),

        # Row 2
        (p_col2_xs[0], p_row2_y, '5.0 Mathematical Scoring\n& Dual-Constraint Engine',
         'Computes criterion s = f(V,R), 30-weight Area means, and checks Level floor rules.'),
        (p_col2_xs[1], p_row2_y, '6.0 What-If Readiness\nSimulation Sandbox',
         'Applies benchmark 4.00 scores to selected priority criteria in an isolated sandbox.'),
        (p_col2_xs[2], p_row2_y, '7.0 Post-Visit Compliance\n& Exhibit Tracking',
         'Maintains 4-column matrix, sub-numbered actions (1.1, 1.2), and linked exhibits.')
    ]

    for px, py, p_title, p_desc in processes:
        draw_card_with_header(d, px, py, px + pw, py + ph, p_title, f_proc, radius=8,
                              header_h=52, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK,
                              body_fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_left(d, px + 18, py + 66, p_desc, f_body, pw - 36, fill=TEXT_BLACK, line_gap=5)

    # 6 Data Stores (Middle Band)
    ds_y = 420
    ds_w, ds_h = 325, 95
    ds_xs = [80 + i * (ds_w + 48) for i in range(6)]
    data_stores = [
        ('D1: Profiles & Roles', 'User accounts, role scopes, auth tokens'),
        ('D2: Framework & Criteria', '10 Areas, 30 weights, 79 criteria, levels'),
        ('D3: Evidence & Verification', 'Files, metadata, tags, reviewer decisions'),
        ('D4: Readiness Scores', 'Criterion scores, Area means, 30-weight sum'),
        ('D5: Simulation Records', 'Isolated what-if parameters & projections'),
        ('D6: Compliance & Audit Logs', '4-Column actions, linked exhibits, audit trail')
    ]

    for dx, (d_name, d_sub) in zip(ds_xs, data_stores):
        d.rectangle([dx, ds_y, dx + ds_w, ds_y + ds_h], fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        d.line([dx + 8, ds_y, dx + 8, ds_y + ds_h], fill=BORDER_DARK, width=3)
        draw_text_center(d, dx + ds_w / 2 + 4, ds_y + 30, d_name, get_font(18, bold=True), fill=TEXT_BLACK)
        draw_text_center(d, dx + ds_w / 2 + 4, ds_y + 66, d_sub, get_font(14), fill=TEXT_MUTED)

    # Data Flow Connectors
    # P1 <-> D1
    draw_double_arrow(d, (p_col1_xs[0] + pw / 2, p_row1_y + ph + 2), (ds_xs[0] + ds_w / 2, ds_y - 2), fill=LINE_DARK, width=3)
    # P2 <-> D2
    draw_double_arrow(d, (p_col1_xs[1] + pw / 2, p_row1_y + ph + 2), (ds_xs[1] + ds_w / 2, ds_y - 2), fill=LINE_DARK, width=3)
    # P3 -> D3
    draw_arrow(d, [(p_col1_xs[2] + pw / 2, p_row1_y + ph + 2), (ds_xs[2] + ds_w / 2, ds_y - 2)], fill=LINE_DARK, width=3)
    # P4 <-> D3
    draw_arrow(d, [(p_col1_xs[3] + pw / 2 - 40, p_row1_y + ph + 2), (ds_xs[2] + ds_w - 20, ds_y - 2)], fill=LINE_DARK, width=3)
    # D3 & D2 -> P5
    draw_arrow(d, [(ds_xs[2] + ds_w / 2, ds_y + ds_h + 2), (p_col2_xs[0] + 100, p_row2_y - 2)], fill=LINE_DARK, width=3)
    # P5 -> D4
    draw_arrow(d, [(p_col2_xs[0] + 250, p_row2_y - 2), (ds_xs[3] + ds_w / 2, ds_y + ds_h + 2)], fill=LINE_DARK, width=3)
    # D4 -> P6
    draw_arrow(d, [(ds_xs[3] + ds_w / 2 + 50, ds_y + ds_h + 2), (p_col2_xs[1] + 100, p_row2_y - 2)], fill=LINE_DARK, width=3)
    # P6 -> D5
    draw_arrow(d, [(p_col2_xs[1] + 250, p_row2_y - 2), (ds_xs[4] + ds_w / 2, ds_y + ds_h + 2)], fill=LINE_DARK, width=3)
    # D3 & D6 <-> P7
    draw_double_arrow(d, (ds_xs[5] + ds_w / 2, ds_y + ds_h + 2), (p_col2_xs[2] + pw / 2, p_row2_y - 2), fill=LINE_DARK, width=3)

    im.save(os.path.join(OUT, 'figure5_data_flow_diagram.png'), dpi=(250, 250))
    print("Figure 5 generated (Monochrome).")


# ==============================================================================
# FIGURE 6: Entity-Relationship Diagram (ERD) - ZERO OVERLAP
# ==============================================================================
def figure6_entity_relationship_diagram():
    W, H = 2400, 1220
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(32, bold=True)
    f_tbl = get_font(18, bold=True)
    f_col = get_font(15, bold=False)
    f_pk = get_font(15, bold=True)

    # Title
    rounded_box(d, (60, 30, W - 60, 105), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, 67, 'ENTITY-RELATIONSHIP DIAGRAM (ERD): CORE DATABASE SCHEMA', f_title, fill=TEXT_WHITE)

    # Tables layout
    tables = [
        # Col 1: Organizational Hierarchy
        ('departments', [
            ('dept_id', 'UUID (PK)'),
            ('dept_code', 'VARCHAR(20)'),
            ('name', 'VARCHAR(150)'),
            ('created_at', 'TIMESTAMPTZ')
        ], 70, 150, 380, 190),

        ('academic_programs', [
            ('prog_id', 'UUID (PK)'),
            ('dept_id', 'UUID (FK)'),
            ('prog_code', 'VARCHAR(20)'),
            ('name', 'VARCHAR(150)'),
            ('current_level', 'VARCHAR(50)')
        ], 70, 410, 380, 220),

        ('accreditation_cycles', [
            ('cycle_id', 'UUID (PK)'),
            ('prog_id', 'UUID (FK)'),
            ('survey_date', 'DATE'),
            ('target_level', 'VARCHAR(50)'),
            ('status', 'VARCHAR(30)')
        ], 70, 700, 380, 220),

        # Col 2: Users & Delegation
        ('profiles / users', [
            ('user_id', 'UUID (PK)'),
            ('dept_id', 'UUID (FK)'),
            ('email', 'VARCHAR(255)'),
            ('full_name', 'VARCHAR(150)'),
            ('role', 'ENUM(8 roles)'),
            ('is_active', 'BOOLEAN')
        ], 520, 150, 390, 250),

        ('area_assignments', [
            ('assignment_id', 'UUID (PK)'),
            ('user_id', 'UUID (FK)'),
            ('area_id', 'UUID (FK)'),
            ('prog_id', 'UUID (FK)'),
            ('assignment_role', 'VARCHAR(50)')
        ], 520, 470, 390, 220),

        # Col 3: Framework & Criteria
        ('accreditation_frameworks', [
            ('framework_id', 'UUID (PK)'),
            ('name', 'VARCHAR(100)'),
            ('total_weight', 'INT (30)'),
            ('version', 'VARCHAR(20)')
        ], 980, 150, 420, 190),

        ('accreditation_areas', [
            ('area_id', 'UUID (PK)'),
            ('framework_id', 'UUID (FK)'),
            ('area_number', 'VARCHAR(10)'),
            ('title', 'VARCHAR(150)'),
            ('weight', 'INT (2 to 4)')
        ], 980, 410, 420, 220),

        ('criteria', [
            ('criterion_id', 'UUID (PK)'),
            ('area_id', 'UUID (FK)'),
            ('criterion_code', 'VARCHAR(20)'),
            ('title', 'TEXT'),
            ('required_docs_r', 'INT')
        ], 980, 700, 420, 220),

        # Col 4: Evidence & Verification
        ('evidence', [
            ('evidence_id', 'UUID (PK)'),
            ('criterion_id', 'UUID (FK)'),
            ('uploader_id', 'UUID (FK)'),
            ('file_url', 'TEXT'),
            ('document_type', 'VARCHAR(100)'),
            ('effective_date', 'DATE'),
            ('verification_status', 'VARCHAR(30)')
        ], 1470, 300, 430, 280),

        ('evidence_verifications', [
            ('verification_id', 'UUID (PK)'),
            ('evidence_id', 'UUID (FK)'),
            ('verifier_id', 'UUID (FK)'),
            ('status', 'VARCHAR(30)'),
            ('rejection_notes', 'TEXT'),
            ('verified_at', 'TIMESTAMPTZ')
        ], 1470, 650, 430, 250),

        # Col 5: Scoring, Compliance & Audit
        ('readiness_scores', [
            ('score_id', 'UUID (PK)'),
            ('prog_id', 'UUID (FK)'),
            ('area_id', 'UUID (FK)'),
            ('mean_score', 'NUMERIC(4,2)'),
            ('weighted_value', 'NUMERIC(5,2)'),
            ('computed_at', 'TIMESTAMPTZ')
        ], 1960, 150, 380, 240),

        ('compliance_actions', [
            ('action_id', 'UUID (PK)'),
            ('cycle_id', 'UUID (FK)'),
            ('rec_number', 'VARCHAR(20)'),
            ('sub_action_num', 'VARCHAR(10)'),
            ('action_taken', 'TEXT'),
            ('evidence_id', 'UUID (FK)'),
            ('status', 'VARCHAR(30)')
        ], 1960, 460, 380, 270),

        ('audit_logs', [
            ('log_id', 'BIGINT (PK)'),
            ('user_id', 'UUID (FK)'),
            ('action_type', 'VARCHAR(50)'),
            ('target_table', 'VARCHAR(50)'),
            ('record_id', 'UUID'),
            ('timestamp', 'TIMESTAMPTZ')
        ], 1960, 800, 380, 240)
    ]

    for title, fields, x, y, w, h in tables:
        draw_card_with_header(d, x, y, x + w, y + h, title.upper(), f_tbl, radius=6,
                              header_h=36, header_fill=HEADER_LIGHT, header_text_col=TEXT_BLACK,
                              body_fill=BOX_FILL_WHITE, outline=BORDER_DARK, width=2)
        fy = y + 46
        for fname, ftype in fields:
            is_pk = '(PK)' in ftype
            is_fk = '(FK)' in ftype
            d.text((x + 14, fy), fname, font=f_pk if (is_pk or is_fk) else f_col, fill=TEXT_BLACK)
            d.text((x + w - 14 - d.textlength(ftype, font=f_col), fy), ftype, font=f_col, fill=TEXT_MUTED)
            fy += 28

    # Cardinality Relationships (1:N)
    # dept -> program
    draw_arrow(d, [(70 + 190, 340), (70 + 190, 410)], fill=LINE_DARK, width=2)
    d.text((70 + 200, 365), '1 : N', font=get_font(13, bold=True), fill=TEXT_BLACK)

    # program -> cycles
    draw_arrow(d, [(70 + 190, 630), (70 + 190, 700)], fill=LINE_DARK, width=2)
    d.text((70 + 200, 655), '1 : N', font=get_font(13, bold=True), fill=TEXT_BLACK)

    # frameworks -> areas
    draw_arrow(d, [(980 + 210, 340), (980 + 210, 410)], fill=LINE_DARK, width=2)
    d.text((980 + 220, 365), '1 : N', font=get_font(13, bold=True), fill=TEXT_BLACK)

    # areas -> criteria
    draw_arrow(d, [(980 + 210, 630), (980 + 210, 700)], fill=LINE_DARK, width=2)
    d.text((980 + 220, 655), '1 : N', font=get_font(13, bold=True), fill=TEXT_BLACK)

    # criteria -> evidence
    draw_arrow(d, [(1400, 780), (1470, 480)], fill=LINE_DARK, width=2)
    d.text((1420, 620), '1 : N', font=get_font(13, bold=True), fill=TEXT_BLACK)

    # evidence -> evidence_verifications
    draw_arrow(d, [(1470 + 215, 580), (1470 + 215, 650)], fill=LINE_DARK, width=2)
    d.text((1470 + 225, 605), '1 : N', font=get_font(13, bold=True), fill=TEXT_BLACK)

    # profiles -> assignments
    draw_arrow(d, [(520 + 195, 400), (520 + 195, 470)], fill=LINE_DARK, width=2)
    d.text((520 + 205, 425), '1 : N', font=get_font(13, bold=True), fill=TEXT_BLACK)

    # ------------------ CLEAN 2-LINE LEGEND AT BOTTOM (ZERO OVERLAP) ------------------
    leg_y0, leg_y1 = 1070, 1180
    rounded_box(d, (70, leg_y0, W - 70, leg_y1), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    d.text((95, leg_y0 + 15), "ERD NOTATION & INTEGRITY CONSTRAINTS:", font=get_font(17, bold=True), fill=TEXT_BLACK)

    # Row 1 items (cleanly spaced)
    row1 = [
        ("• PK: Primary Key (Unique entity identifier)", 540),
        ("• FK: Foreign Key (Relational referential constraint)", 1070),
        ("• 1 : N: One-to-Many Cardinality Relationship", 1680),
    ]
    for text_item, rx in row1:
        d.text((rx, leg_y0 + 17), text_item, font=get_font(16, bold=False), fill=TEXT_BLACK)

    # Row 2 items
    row2 = [
        ("• Row-Level Security (RLS): Enforced at the PostgreSQL level for tenant isolation and role restrictions.", 95),
        ("• Self-Verification Block: Programmatic constraint (uploader_id != verifier_id) on evidence verification.", 1240)
    ]
    for text_item, rx in row2:
        d.text((rx, leg_y0 + 60), text_item, font=get_font(16, bold=False), fill=TEXT_BLACK)

    im.save(os.path.join(OUT, 'figure6_entity_relationship_diagram.png'), dpi=(250, 250))
    print("Figure 6 generated (Monochrome).")


# ==============================================================================
# FIGURE 7: System Process Flow Diagram
# ==============================================================================
def figure7_process_flow():
    W, H = 1800, 2350
    im = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(im)

    f_title = get_font(27, bold=True)
    f_box = get_font(21, bold=False)
    f_dia = get_font(20, bold=False)
    f_side = get_font(19, bold=False)

    cx = 640
    bw, bh = 940, 95
    y = 40
    centers = {}

    # Title
    rounded_box(d, (50, y, W - 50, y + 75), radius=10, fill=HEADER_DARK, outline=BORDER_DARK, width=2)
    draw_text_center(d, W / 2, y + 37, 'SYSTEM PROCESS FLOW: FROM ADMINISTRATIVE SETUP TO COMPLIANCE TRACKING', f_title, fill=TEXT_WHITE)
    y += 115

    def proc(key, text, h=bh):
        nonlocal y
        rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + h), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
        draw_text_center(d, cx, y + h / 2, text, f_box, fill=TEXT_BLACK, max_w=bw - 40, line_gap=5)
        centers[key] = (y, y + h)
        y += h + 50

    def down(a, b):
        draw_arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], fill=LINE_DARK, width=3, head=16)

    proc('s1', '1. System Administrator configures academic registry (STI WNU, CICT, BSCS) and provisions user roles.')
    proc('s2', '2. QA Officer configures PACUCOA 2023 undergraduate framework (10 Areas, 30 weights, 79 criteria, level floors).')
    proc('s3', '3. Program Head delegates Areas to designated Area Chairs, Co-Chairs, and Faculty Members.')
    proc('s4', '4. Faculty Member uploads documentary evidence for specific criteria into Supabase Storage.')
    proc('s5', '5. System executes server-side PDF text extraction, validates dates, and suggests criteria mapping.')
    proc('s6', '6. Area Chair / Co-Chair accesses the supervisory verification queue to review pending exhibits.')

    for a, b in [('s1', 's2'), ('s2', 's3'), ('s3', 's4'), ('s4', 's5'), ('s5', 's6')]:
        down(a, b)

    dh, dw = 170, 640
    # Decision 1: Self-verification check
    d1y = y + dh / 2
    draw_arrow(d, [(cx, centers['s6'][1]), (cx, d1y - dh / 2)], fill=LINE_DARK, width=3, head=16)
    draw_diamond(d, cx, d1y, dw, dh, 'Is the reviewer the\nsame user who uploaded\nthe exhibit?', f_dia, fill=BOX_FILL_WHITE)
    y = d1y + dh / 2 + 50

    # Blocked box at right
    bx0, bx1 = 1200, 1720
    rounded_box(d, (bx0, d1y - 60, bx1, d1y + 60), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d1y, 'BLOCKED by Self-Verification Rule (uploader != verifier)\n[QA Officer role exempt]', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d1y), (bx0, d1y)], fill=LINE_DARK, width=3, head=16)
    d.text((cx + dw / 2 + 20, d1y - 35), 'Yes', font=get_font(21, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d1y + dh / 2 + 10), 'No', font=get_font(21, bold=True), fill=TEXT_BLACK)

    # Loop back to queue s6
    draw_arrow(d, [((bx0 + bx1) / 2, d1y - 60), ((bx0 + bx1) / 2, (centers['s6'][0] + centers['s6'][1]) / 2), (cx + bw / 2 + 4, (centers['s6'][0] + centers['s6'][1]) / 2)], fill=LINE_DARK, width=2, head=14)

    # Decision 2: Approval decision
    d2y = y + dh / 2
    draw_arrow(d, [(cx, d1y + dh / 2), (cx, d2y - dh / 2)], fill=LINE_DARK, width=3, head=16)
    draw_diamond(d, cx, d2y, dw, dh, 'Does the exhibit meet\nPACUCOA compliance\nand validity criteria?', f_dia, fill=BOX_FILL_WHITE)
    y = d2y + dh / 2 + 50

    rounded_box(d, (bx0, d2y - 60, bx1, d2y + 60), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d2y, 'REJECTED with supervisory notes;\nuploader notified to revise exhibit.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d2y), (bx0, d2y)], fill=LINE_DARK, width=3, head=16)
    d.text((cx + dw / 2 + 20, d2y - 35), 'No', font=get_font(21, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d2y + dh / 2 + 10), 'Yes', font=get_font(21, bold=True), fill=TEXT_BLACK)

    # Rejection loops back to upload s4
    s4mid = (centers['s4'][0] + centers['s4'][1]) / 2
    rx = 1760
    draw_arrow(d, [(bx1, d2y), (rx, d2y), (rx, s4mid), (cx + bw / 2 + 4, s4mid)], fill=LINE_DARK, width=2, head=14)

    # Valid step
    top_valid = y
    draw_arrow(d, [(cx, d2y + dh / 2), (cx, top_valid)], fill=LINE_DARK, width=3, head=16)
    rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + bh), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, cx, y + bh / 2, 'Document is approved as verified valid evidence (V) for the criterion.', f_box, fill=TEXT_BLACK, max_w=bw - 40)
    centers['v'] = (y, y + bh)
    y += bh + 50

    # Scoring update
    proc('s7', '7. System recomputes criterion score s = f(V,R), Area means, 30-weight program rating, and evaluates floor rules; Executive 5x2 dashboard and heatmaps update in real time.', h=130)
    draw_arrow(d, [(cx, centers['v'][1]), (cx, centers['s7'][0])], fill=LINE_DARK, width=3, head=16)

    # Decision 3: Gaps remaining?
    d3y = y + dh / 2
    draw_arrow(d, [(cx, centers['s7'][1]), (cx, d3y - dh / 2)], fill=LINE_DARK, width=3, head=16)
    draw_diamond(d, cx, d3y, dw, dh, 'Are there documentary\ngaps or Area means below\ntarget level floors?', f_dia, fill=BOX_FILL_WHITE)

    rounded_box(d, (bx0, d3y - 65, bx1, d3y + 65), radius=6, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, (bx0 + bx1) / 2, d3y, 'RUN WHAT-IF SIMULATION:\nPrioritize up to 10 criteria, project rating delta, and upload missing exhibits.', f_side, fill=TEXT_BLACK, max_w=(bx1 - bx0) - 20)
    draw_arrow(d, [(cx + dw / 2, d3y), (bx0, d3y)], fill=LINE_DARK, width=3, head=16)
    d.text((cx + dw / 2 + 20, d3y - 35), 'Yes', font=get_font(21, bold=True), fill=TEXT_BLACK)
    d.text((cx + 15, d3y + dh / 2 + 10), 'No', font=get_font(21, bold=True), fill=TEXT_BLACK)

    # Yes loop back to upload via shared vertical return bus
    d.line([(bx1, d3y), (rx, d3y), (rx, d2y)], fill=LINE_DARK, width=2)

    y = d3y + dh / 2 + 50
    rounded_box(d, (cx - bw / 2, y, cx + bw / 2, y + 120), radius=8, fill=BOX_FILL_LIGHT, outline=BORDER_DARK, width=2)
    draw_text_center(d, cx, y + 60, '8. Program maintains four-column post-visit compliance matrix with sub-numbered action items and linked exhibits, achieving continuous readiness for PACUCOA survey activity.', f_box, fill=TEXT_BLACK, max_w=bw - 40)
    draw_arrow(d, [(cx, d3y + dh / 2), (cx, y)], fill=LINE_DARK, width=3, head=16)

    H2 = int(y + 120 + 35)
    im = im.crop((0, 0, W, H2))
    im.save(os.path.join(OUT, 'figure7_process_flow.png'), dpi=(250, 250))
    print("Figure 7 generated (Monochrome).")


if __name__ == '__main__':
    figure1_conceptual_framework()
    figure2_sdlc_scrum()
    figure3_system_architecture()
    figure4_context_diagram()
    figure5_data_flow_diagram()
    figure6_entity_relationship_diagram()
    figure7_process_flow()
    print("All 7 Figures successfully rebuilt in clean black & white / monochromatic grayscale!")
