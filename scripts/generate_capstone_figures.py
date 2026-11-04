import os
import math
from PIL import Image, ImageDraw, ImageFont

OUT = r'c:\Users\Acer\Desktop\ACCREDITATION SYSTEM\figures'
os.makedirs(OUT, exist_ok=True)

FONT_DIR = r'C:\Windows\Fonts'
def font(size, bold=False):
    name = 'timesbd.ttf' if bold else 'times.ttf'
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)

INK = (20, 20, 20)
LINE = (40, 40, 40)
FILL = (255, 255, 255)
GREY = (235, 235, 235)


def wrap(draw, text, f, max_w):
    words = text.split()
    lines, cur = [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=f) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def text_block(draw, xy, text, f, max_w, anchor='center', line_gap=6):
    """Draw wrapped text centered at xy (cx, cy). Returns height."""
    lines = []
    for para in text.split('\n'):
        lines += wrap(draw, para, f, max_w)
    lh = f.size + line_gap
    total = lh * len(lines) - line_gap
    cx, cy = xy
    y = cy - total / 2
    for ln in lines:
        w = draw.textlength(ln, font=f)
        draw.text((cx - w / 2, y), ln, font=f, fill=INK)
        y += lh
    return total


def box(draw, x0, y0, x1, y1, text=None, f=None, fill=FILL, width=3):
    draw.rectangle([x0, y0, x1, y1], fill=fill, outline=LINE, width=width)
    if text:
        text_block(draw, ((x0 + x1) / 2, (y0 + y1) / 2), text, f, (x1 - x0) - 40)


def arrow(draw, pts, width=3, head=18):
    for a, b in zip(pts[:-2], pts[1:-1]):
        draw.line([a, b], fill=LINE, width=width)
    (x0, y0), (x1, y1) = pts[-2], pts[-1]
    ang = math.atan2(y1 - y0, x1 - x0)
    bx, by = x1 - head * math.cos(ang), y1 - head * math.sin(ang)
    draw.line([(x0, y0), (bx, by)], fill=LINE, width=width)
    left = (x1 - head * math.cos(ang - 0.4), y1 - head * math.sin(ang - 0.4))
    right = (x1 - head * math.cos(ang + 0.4), y1 - head * math.sin(ang + 0.4))
    draw.polygon([(x1, y1), left, right], fill=LINE)


def diamond(draw, cx, cy, w, h, text, f):
    pts = [(cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)]
    draw.polygon(pts, fill=GREY, outline=LINE)
    draw.line(pts + [pts[0]], fill=LINE, width=3)
    text_block(draw, (cx, cy), text, f, w * 0.62)


def label(draw, xy, text, f):
    draw.text(xy, text, font=f, fill=INK)


# ---------------------------------------------------------------- Figure 1
def figure1():
    W, H = 1880, 1150
    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    ft, fb = font(40, True), font(31)
    cols = [
        ('INPUTS', [
            'PACUCOA framework data: ten Areas, weights (total 30), criteria, level thresholds',
            'User accounts and role scopes',
            'Evidence documents uploaded by faculty',
            'Post-visit recommendations and compliance records',
        ]),
        ('PROCESSES', [
            'Evidence mapping and PDF-assisted tagging',
            'Area delegation and independent verification (self-verification block)',
            'Readiness scoring and level-threshold checking',
            'What-if readiness simulation',
            'Post-visit compliance tracking with linked exhibits',
            'Audit logging of completed actions',
        ]),
        ('OUTPUTS', [
            'Executive 5x2 readiness dashboard and criteria inspector',
            'Heatmap and gap report',
            'Projected rating and level (simulation)',
            'Post-visit compliance report',
            'Audit trail',
            'ISO/IEC 25010 evaluation results',
        ]),
    ]
    bw, gap, top, bottom = 500, 130, 60, 900
    x = 60
    xs = []
    for title, items in cols:
        d.rectangle([x, top, x + bw, bottom], outline=LINE, width=4, fill=FILL)
        d.rectangle([x, top, x + bw, top + 80], outline=LINE, width=4, fill=GREY)
        text_block(d, (x + bw / 2, top + 40), title, ft, bw)
        y = top + 110
        for it in items:
            lines = wrap(d, it, fb, bw - 70)
            h = len(lines) * (fb.size + 6) + 22
            d.rectangle([x + 25, y, x + bw - 25, y + h], outline=LINE, width=2, fill=FILL)
            text_block(d, (x + bw / 2, y + h / 2), it, fb, bw - 70)
            y += h + 18
        xs.append(x)
        x += bw + gap
    mid = (top + bottom) / 2
    for i in range(2):
        arrow(d, [(xs[i] + bw + 10, mid), (xs[i + 1] - 10, mid)], width=5, head=26)
    # feedback loop
    fy = bottom + 110
    ox = xs[2] + bw / 2
    ix = xs[0] + bw / 2
    arrow(d, [(ox, bottom + 4), (ox, fy), (ix, fy), (ix, bottom + 8)], width=5, head=26)
    text_block(d, ((ox + ix) / 2, fy + 45),
               'Feedback loop: gaps are remediated and supplementary evidence is uploaded', font(32, True), 1400)
    im.save(os.path.join(OUT, 'figure1_conceptual_framework.png'), dpi=(250, 250))


# ---------------------------------------------------------------- Figure 2
def figure2():
    W, H = 1600, 1350
    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    ft, fb = font(38, True), font(32)
    cx = W / 2
    # Users
    box(d, 200, 40, 1400, 230, None, fb)
    text_block(d, (cx, 85), 'USERS', ft, 1000)
    text_block(d, (cx, 160),
               'System Admin, QA Officer, Dean, Program Head, Area Chair, Co-Chair, Faculty Member, Alumni and Student Representatives',
               fb, 1100)
    arrow(d, [(cx, 232), (cx, 330)], width=5, head=24)
    # Browser
    box(d, 350, 335, 1250, 495, None, fb, fill=GREY)
    text_block(d, (cx, 380), 'WEB BROWSER', ft, 800)
    text_block(d, (cx, 450), 'Next.js interface: dashboard, evidence library, document viewer', fb, 800)
    arrow(d, [(cx, 497), (cx, 595)], width=5, head=24)
    # App server
    box(d, 200, 600, 1400, 860, None, fb, fill=FILL)
    text_block(d, (cx, 645), 'NEXT.JS APPLICATION', ft, 1000)
    text_block(d, (cx, 760),
               'Pages and server components\nPDF text extraction and rule-based keyword matching\nReadiness scoring and level check\nWhat-if simulation',
               fb, 1100)
    # three data boxes
    bx = [(60, 500), (550, 1050), (1100, 1540)]
    names = [
        ('SUPABASE AUTH', 'Login and sessions'),
        ('POSTGRESQL DATABASE', 'Row-level security policies\nFramework data, evidence records,\nscores, audit log'),
        ('SUPABASE STORAGE', 'Uploaded evidence files'),
    ]
    top, bot = 1030, 1290
    for (x0, x1), (t, s) in zip(bx, names):
        mx = (x0 + x1) / 2
        arrow(d, [(mx, 862), (mx, top - 4)], width=5, head=24)
        box(d, x0, top, x1, bot, None, fb, fill=GREY)
        text_block(d, ((x0 + x1) / 2, top + 55), t, font(32, True), x1 - x0 - 30)
        text_block(d, ((x0 + x1) / 2, top + 170), s, font(30), x1 - x0 - 40)
    im.save(os.path.join(OUT, 'figure2_system_architecture.png'), dpi=(250, 250))


# ---------------------------------------------------------------- Figure 3
def figure3():
    W, H = 1700, 2250
    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    fb, fs = font(31), font(29)
    cx = 600
    bw, bh = 880, 100
    y = 40
    centers = {}

    def proc(key, text, h=bh):
        nonlocal y
        box(d, cx - bw / 2, y, cx + bw / 2, y + h, text, fb)
        centers[key] = (y, y + h)
        y += h + 55

    def down(a, b):
        arrow(d, [(cx, centers[a][1]), (cx, centers[b][0])], width=4, head=20)

    proc('s1', 'System Admin sets up the academic registry and user accounts')
    proc('s2', 'QA Officer configures Areas, weights, criteria, and levels')
    proc('s3', 'Program Head delegates Areas to Area Chairs, Co-Chairs, and Members')
    proc('s4', 'Member uploads evidence for a criterion')
    proc('s5', 'System reads the PDF text layer and suggests document type and effective date')
    proc('s6', 'Area Chair or Co-Chair reviews the evidence')
    for a, b in [('s1', 's2'), ('s2', 's3'), ('s3', 's4'), ('s4', 's5'), ('s5', 's6')]:
        down(a, b)

    dh, dw = 190, 620
    # decision 1
    d1y = y + dh / 2
    arrow(d, [(cx, centers['s6'][1]), (cx, d1y - dh / 2)], width=4, head=20)
    diamond(d, cx, d1y, dw, dh, 'Is the reviewer the uploader?', fb)
    y = d1y + dh / 2 + 55
    # blocked box at right
    bx0, bx1 = 1180, 1650
    box(d, bx0, d1y - 70, bx1, d1y + 70, 'Blocked by self-verification block (QA Officer exempt)', fs)
    arrow(d, [(cx + dw / 2, d1y), (bx0, d1y)], width=4, head=20)
    label(d, (cx + dw / 2 + 25, d1y - 45), 'Yes', fs)
    label(d, (cx + 15, d1y + dh / 2 + 5), 'No', fs)
    # loop back from blocked to reviewer s6
    arrow(d, [((bx0 + bx1) / 2, d1y - 70), ((bx0 + bx1) / 2, (centers['s6'][0] + centers['s6'][1]) / 2), (cx + bw / 2 + 4, (centers['s6'][0] + centers['s6'][1]) / 2)], width=4, head=20)

    # decision 2
    d2y = y + dh / 2
    arrow(d, [(cx, d1y + dh / 2), (cx, d2y - dh / 2)], width=4, head=20)
    diamond(d, cx, d2y, dw, dh, 'Evidence approved?', fb)
    y = d2y + dh / 2 + 55
    box(d, bx0, d2y - 70, bx1, d2y + 70, 'Rejected with notes; uploader revises and re-uploads', fs)
    arrow(d, [(cx + dw / 2, d2y), (bx0, d2y)], width=4, head=20)
    label(d, (cx + dw / 2 + 25, d2y - 45), 'No', fs)
    label(d, (cx + 15, d2y + dh / 2 + 5), 'Yes', fs)
    # rejected loops to upload s4 (right side line)
    s4mid = (centers['s4'][0] + centers['s4'][1]) / 2
    rx = 1700 - 25
    arrow(d, [(bx1, d2y), (rx, d2y), (rx, s4mid), (cx + bw / 2 + 4, s4mid)], width=4, head=20)

    # valid
    top_valid = y
    arrow(d, [(cx, d2y + dh / 2), (cx, top_valid)], width=4, head=20)
    box(d, cx - bw / 2, y, cx + bw / 2, y + bh, 'Document is verified and counts as valid evidence', fb)
    centers['v'] = (y, y + bh)
    y += bh + 55
    proc('s7', 'System recomputes criterion scores, Area means, program rating, and level check; dashboard, heatmap, and gap report update', h=150)
    arrow(d, [(cx, centers['v'][1]), (cx, centers['s7'][0])], width=4, head=20)

    # decision 3
    d3y = y + dh / 2
    arrow(d, [(cx, centers['s7'][1]), (cx, d3y - dh / 2)], width=4, head=20)
    diamond(d, cx, d3y, dw, dh, 'Any gaps or Areas below target?', fb)
    box(d, bx0, d3y - 90, bx1, d3y + 90, 'Run what-if simulation, plan priorities, and upload missing evidence', fs)
    arrow(d, [(cx + dw / 2, d3y), (bx0, d3y)], width=4, head=20)
    label(d, (cx + dw / 2 + 25, d3y - 45), 'Yes', fs)
    label(d, (cx + 15, d3y + dh / 2 + 5), 'No', fs)
    # yes loop up to upload (outer line)
    d.line([(bx1, d3y), (rx, d3y), (rx, d2y)], fill=LINE, width=4)
    y = d3y + dh / 2 + 55
    box(d, cx - bw / 2, y, cx + bw / 2, y + 130, 'Program records post-visit actions in the compliance matrix, linked to verified exhibits, and prepares for the PACUCOA activity', fb)
    arrow(d, [(cx, d3y + dh / 2), (cx, y)], width=4, head=20)
    H2 = int(y + 130 + 40)
    im = im.crop((0, 0, W, H2))
    im.save(os.path.join(OUT, 'figure3_process_flow.png'), dpi=(250, 250))


if __name__ == '__main__':
    figure1()
    figure2()
    figure3()
    print('figures written to', OUT)
