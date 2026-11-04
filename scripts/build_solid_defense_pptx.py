import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE


# =============================================================================
# COLOR PALETTE (SUNN / STI Executive Academic Theme)
# =============================================================================
NAVY = RGBColor(0, 32, 96)             # #002060 - Exact SUNN Master Navy
DARK_NAVY = RGBColor(15, 41, 74)       # #0F294A - Deep Card Header Navy
ROYAL = RGBColor(29, 78, 216)          # #1D4ED8 - Primary Accent Blue
GOLD = RGBColor(212, 160, 23)          # #D4A017 - Academic Gold Accent
GOLD_DARK = RGBColor(161, 98, 7)       # #A16207 - Readable Dark Gold Text
GOLD_SOFT = RGBColor(254, 249, 195)    # #FEF9C3 - Soft Gold Highlight Fill
GOLD_BORDER = RGBColor(250, 204, 21)   # #FACC15

SLATE_DARK = RGBColor(30, 41, 59)      # #1E293B - Body Copy
SLATE_MED = RGBColor(71, 85, 105)      # #475569 - Secondary Copy
SLATE_LIGHT = RGBColor(248, 250, 252)  # #F8FAFC - Clean Card Surface
SLATE_ALT = RGBColor(241, 245, 249)    # #F1F5F9 - Table Alternating Row
BORDER = RGBColor(203, 213, 225)       # #CBD5E1 - Subtle Card Border
BLUE_SOFT = RGBColor(239, 246, 255)    # #EFF6FF - Soft Blue Pill / Tint
BLUE_BORDER = RGBColor(191, 219, 254)  # #BFDBFE
WHITE = RGBColor(255, 255, 255)

RED_FG = RGBColor(185, 28, 28)         # #B91C1C - Deficit Text
RED_BG = RGBColor(254, 226, 226)       # #FEE2E2 - Deficit Fill
RED_BORDER = RGBColor(252, 165, 165)

AMBER_FG = RGBColor(146, 64, 14)       # #92400E - Caution / Pending Floor Text
AMBER_BG = RGBColor(254, 243, 199)     # #FEF3C7 - Caution Fill
AMBER_BORDER = RGBColor(252, 211, 77)

GREEN_FG = RGBColor(22, 101, 52)       # #166534 - Cleared / Strong Text
GREEN_BG = RGBColor(220, 252, 231)     # #DCFCE7 - Cleared Fill
GREEN_BORDER = RGBColor(134, 239, 172)

FONT_MAIN = "Arial"


# =============================================================================
# LOW-LEVEL SLIDE & SHAPE HELPERS
# =============================================================================
def clear_all_slides(prs):
    """Remove all existing slides cleanly while preserving Slide Master & Layouts."""
    sldIdLst = prs.slides._sldIdLst
    for sldId in list(sldIdLst):
        rId = sldId.rId
        prs.part.drop_rel(rId)
        sldIdLst.remove(sldId)


def fix_master_mit_header(prs):
    """Ensure the SUNN Slide Master natively reads 'MASTER IN INFORMATION TECHNOLOGY'."""
    master = prs.slide_masters[0]
    for shape in master.shapes:
        if shape.name == "TextBox 6" and shape.has_text_frame:
            tf = shape.text_frame
            if len(tf.paragraphs) >= 2 and len(tf.paragraphs[1].runs) >= 1:
                tf.paragraphs[1].runs[0].text = "MASTER IN INFORMATION TECHNOLOGY"


def add_clean_slide(prs, notes_text=""):
    """Add a Blank-layout slide inheriting the SUNN Master with zero stray placeholders."""
    blank_layout = prs.slide_layouts[6]  # 'Blank'
    slide = prs.slides.add_slide(blank_layout)
    for shape in list(slide.shapes):
        slide.shapes._spTree.remove(shape._element)
    if notes_text:
        notes_slide = slide.notes_slide
        notes_slide.notes_text_frame.text = notes_text
    return slide


def set_shape_Rect(shape, fill_rgb=None, border_rgb=None, border_pt=1.0, radius=0.04):
    """Style a shape fill, border, and rounded corner radius."""
    if hasattr(shape, "adjustments") and len(shape.adjustments) > 0 and radius is not None:
        try:
            shape.adjustments[0] = radius
        except Exception:
            pass
    if fill_rgb is not None:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_rgb
    else:
        shape.fill.background()
    if border_rgb is not None:
        shape.line.color.rgb = border_rgb
        shape.line.width = Pt(border_pt)
    else:
        shape.line.fill.background()
    shape.shadow.inherit = False


def add_box(slide, left, top, width, height, fill_rgb=WHITE, border_rgb=BORDER,
            border_pt=1.0, rounded=True, radius=0.04):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    shp = slide.shapes.add_shape(
        shape_type, Inches(left), Inches(top), Inches(width), Inches(height)
    )
    set_shape_Rect(shp, fill_rgb=fill_rgb, border_rgb=border_rgb, border_pt=border_pt,
                   radius=(radius if rounded else None))
    return shp


def add_text(slide, left, top, width, height, runs, align=PP_ALIGN.LEFT,
             anchor=MSO_ANCHOR.TOP, margin_lr=0.06, margin_tb=0.04, line_spacing=1.12):
    """
    Add a clean textbox with rich runs.
    `runs` can be:
      - list of paragraphs, where each paragraph is a list of dicts:
        [{"text": "...", "size": 11, "bold": False, "italic": False, "color": SLATE_DARK, "space_after": 3}]
      - or a single string (convenience).
    """
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Inches(margin_lr)
    tf.margin_right = Inches(margin_lr)
    tf.margin_top = Inches(margin_tb)
    tf.margin_bottom = Inches(margin_tb)

    if isinstance(runs, str):
        runs = [[{"text": runs}]]

    for p_idx, p_spec in enumerate(runs):
        p = tf.paragraphs[0] if p_idx == 0 else tf.add_paragraph()
        p_align = align
        space_after = 2
        space_before = 0
        p_line_spacing = line_spacing

        if isinstance(p_spec, dict):
            # Paragraph-level wrapper {"align": ..., "space_after": ..., "runs": [...]}
            p_align = p_spec.get("align", align)
            space_after = p_spec.get("space_after", 2)
            space_before = p_spec.get("space_before", 0)
            p_line_spacing = p_spec.get("line_spacing", line_spacing)
            run_list = p_spec.get("runs", [])
        else:
            run_list = p_spec
            if run_list and isinstance(run_list[0], dict) and "space_after" in run_list[0]:
                space_after = run_list[0]["space_after"]
            if run_list and isinstance(run_list[0], dict) and "align" in run_list[0]:
                p_align = run_list[0]["align"]

        p.alignment = p_align
        p.space_after = Pt(space_after)
        p.space_before = Pt(space_before)
        p.line_spacing = p_line_spacing

        for r_spec in run_list:
            r = p.add_run()
            r.text = r_spec.get("text", "")
            r.font.name = r_spec.get("font", FONT_MAIN)
            r.font.size = Pt(r_spec.get("size", 10.5))
            r.font.bold = r_spec.get("bold", False)
            r.font.italic = r_spec.get("italic", False)
            r.font.color.rgb = r_spec.get("color", SLATE_DARK)
    return tb


def add_slide_header(slide, title, subtitle, section_tag, slide_num, total_slides=16):
    """
    Standardized SUNN Safe-Zone Header (y = 0.89" to 1.54").
    Never touches the top Graduate School seal/text (y <= 0.84").
    """
    # Gold vertical accent bar
    add_box(slide, 0.55, 0.92, 0.08, 0.54, fill_rgb=GOLD, border_rgb=None, rounded=False)

    # Slide Title
    add_text(
        slide, 0.70, 0.88, 9.35, 0.36,
        [[{"text": title, "size": 19, "bold": True, "color": NAVY, "space_after": 0}]],
        margin_lr=0.02, margin_tb=0.01, line_spacing=1.0
    )

    # Subtitle
    add_text(
        slide, 0.70, 1.23, 9.45, 0.25,
        [[{"text": subtitle, "size": 10.5, "bold": True, "color": SLATE_MED, "space_after": 0}]],
        margin_lr=0.02, margin_tb=0.01, line_spacing=1.0
    )

    # Top-right section & slide counter pill
    pill_txt = f"{section_tag}  |  {slide_num:02d} / {total_slides:02d}"
    pill = add_box(slide, 10.18, 0.95, 2.60, 0.34, fill_rgb=BLUE_SOFT,
                   border_rgb=BLUE_BORDER, border_pt=1.0, rounded=True, radius=0.45)
    tf = pill.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = pill_txt
    r.font.name = FONT_MAIN
    r.font.size = Pt(9.0)
    r.font.bold = True
    r.font.color.rgb = NAVY

    # Crisp divider rule at y = 1.54"
    add_box(slide, 0.55, 1.54, 12.23, 0.015, fill_rgb=BORDER, border_rgb=None, rounded=False)


def add_bottom_takeaway(slide, label, body_text, fill_rgb=BLUE_SOFT, border_rgb=BLUE_BORDER,
                        label_color=NAVY):
    """
    Crest-Safe Bottom Callout Strip:
    left = 1.18" (clears SUNN golden 'S' crest at x <= 1.08"),
    top = 5.95", height = 0.45" -> bottom = 6.40" (clears logos at y >= 6.58" & text at y >= 6.70").
    """
    add_box(slide, 1.18, 5.95, 11.60, 0.45, fill_rgb=fill_rgb, border_rgb=border_rgb,
            border_pt=1.0, rounded=True, radius=0.12)
    add_box(slide, 1.18, 5.95, 0.08, 0.45, fill_rgb=label_color, border_rgb=None, rounded=False)
    add_text(
        slide, 1.32, 5.96, 11.40, 0.43,
        [[
            {"text": f"{label}: ", "size": 9.5, "bold": True, "color": label_color, "space_after": 0},
            {"text": body_text, "size": 9.5, "bold": False, "color": SLATE_DARK}
        ]],
        anchor=MSO_ANCHOR.MIDDLE, margin_lr=0.04, margin_tb=0.02, line_spacing=1.08
    )


def add_titled_card(slide, left, top, width, height, header_title, body_paragraphs,
                    header_bg=DARK_NAVY, header_fg=WHITE, card_bg=SLATE_LIGHT,
                    border_rgb=BORDER, header_h=0.36, badge_text=None, badge_bg=GOLD):
    """Reusable structured card with colored header bar and padded body copy."""
    add_box(slide, left, top, width, height, fill_rgb=card_bg, border_rgb=border_rgb,
            border_pt=1.0, rounded=True, radius=0.03)
    add_box(slide, left, top, width, header_h, fill_rgb=header_bg, border_rgb=header_bg,
            border_pt=0.5, rounded=False)

    bw = (0.84 if len(badge_text) <= 7 else 1.24) if badge_text else 0.0
    title_w = width - (bw + 0.20 if badge_text else 0.16)
    add_text(
        slide, left + 0.08, top + 0.02, title_w, header_h - 0.04,
        [[{"text": header_title, "size": 10.3, "bold": True, "color": header_fg, "space_after": 0}]],
        anchor=MSO_ANCHOR.MIDDLE, margin_lr=0.04, margin_tb=0.01, line_spacing=1.0
    )

    if badge_text:
        b_shp = add_box(slide, left + width - bw - 0.08, top + 0.05, bw, header_h - 0.10,
                        fill_rgb=badge_bg, border_rgb=None, rounded=True, radius=0.35)
        tf = b_shp.text_frame
        tf.word_wrap = False
        tf.margin_left = Inches(0.03)
        tf.margin_right = Inches(0.03)
        tf.margin_top = Inches(0.01)
        tf.margin_bottom = Inches(0.01)
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = badge_text
        r.font.name = FONT_MAIN
        r.font.size = Pt(8.0)
        r.font.bold = True
        r.font.color.rgb = NAVY if badge_bg in (GOLD, GOLD_SOFT, AMBER_BG, WHITE) else WHITE

    add_text(
        slide, left + 0.08, top + header_h + 0.05, width - 0.16, height - header_h - 0.09,
        body_paragraphs, margin_lr=0.05, margin_tb=0.03, line_spacing=1.14
    )


def style_cell(cell, text, size=9.5, bold=False, color=SLATE_DARK, fill_rgb=WHITE,
               align=PP_ALIGN.LEFT, margin_lr=0.06, margin_tb=0.03):
    cell.text = ""
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    cell.margin_left = Inches(margin_lr)
    cell.margin_right = Inches(margin_lr)
    cell.margin_top = Inches(margin_tb)
    cell.margin_bottom = Inches(margin_tb)
    cell.fill.solid()
    cell.fill.fore_color.rgb = fill_rgb

    p = cell.text_frame.paragraphs[0]
    p.alignment = align
    p.space_after = Pt(0)
    p.space_before = Pt(0)
    p.line_spacing = 1.05
    r = p.add_run()
    r.text = text
    r.font.name = FONT_MAIN
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color


# =============================================================================
# MAIN PRESENTATION BUILDER (16 SOLID DEFENSE SLIDES)
# =============================================================================
def build_presentation():
    template_path = "FINAL ORAL DEFENSE TEMPLATE.pptx"
    output_path = "FINAL_ORAL_DEFENSE_PRESENTATION.pptx"

    prs = Presentation(template_path)
    fix_master_mit_header(prs)
    clear_all_slides(prs)

    TOTAL = 16

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = add_clean_slide(
        prs,
        "Good day to the Chair and Members of the Oral Examination Panel. I am Jose Marie Clyde B. Taburada, "
        "presenting my Master in Information Technology capstone project entitled 'Web-Based Accreditation "
        "Management and Readiness Assessment System for STI West Negros University.'"
    )

    # Outer subtle academic frame inside safe area
    add_box(s1, 0.95, 1.15, 11.43, 4.72, fill_rgb=SLATE_LIGHT, border_rgb=BORDER,
            border_pt=1.2, rounded=True, radius=0.03)
    add_box(s1, 0.95, 1.15, 11.43, 0.10, fill_rgb=NAVY, border_rgb=None, rounded=False)
    add_box(s1, 0.95, 1.25, 11.43, 0.05, fill_rgb=GOLD, border_rgb=None, rounded=False)

    # Top Capstone Pill
    p_top = add_box(s1, 4.10, 1.48, 5.13, 0.36, fill_rgb=BLUE_SOFT, border_rgb=BLUE_BORDER,
                    border_pt=1.0, rounded=True, radius=0.45)
    add_text(
        s1, 4.10, 1.48, 5.13, 0.36,
        [[{"text": "CAPSTONE PROJECT  ·  FINAL ORAL DEFENSE", "size": 10, "bold": True,
           "color": NAVY, "align": PP_ALIGN.CENTER, "space_after": 0}]],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE
    )

    # Full Manuscript Title
    add_text(
        s1, 1.35, 1.98, 10.63, 1.42,
        [
            [{"text": "WEB-BASED ACCREDITATION MANAGEMENT AND", "size": 23.5, "bold": True,
              "color": NAVY, "align": PP_ALIGN.CENTER, "space_after": 4}],
            [{"text": "READINESS ASSESSMENT SYSTEM FOR", "size": 23.5, "bold": True,
              "color": NAVY, "align": PP_ALIGN.CENTER, "space_after": 4}],
            [{"text": "STI WEST NEGROS UNIVERSITY", "size": 23.5, "bold": True,
              "color": ROYAL, "align": PP_ALIGN.CENTER, "space_after": 0}],
        ],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.08
    )

    # Gold center divider
    add_box(s1, 5.26, 3.50, 2.80, 0.05, fill_rgb=GOLD, border_rgb=None, rounded=False)

    # Proponent & Degree Block
    add_text(
        s1, 1.50, 3.66, 10.33, 1.22,
        [
            [{"text": "JOSE MARIE CLYDE B. TABURADA", "size": 18, "bold": True,
              "color": SLATE_DARK, "align": PP_ALIGN.CENTER, "space_after": 4}],
            [{"text": "Candidate, Master in Information Technology (MIT)", "size": 13, "bold": True,
              "color": GOLD_DARK, "align": PP_ALIGN.CENTER, "space_after": 3}],
            [{"text": "Graduate School · State University of Northern Negros, Sagay City, Negros Occidental",
              "size": 11.5, "bold": False, "color": SLATE_MED, "align": PP_ALIGN.CENTER, "space_after": 0}],
        ],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.TOP, line_spacing=1.12
    )

    # Bottom Metadata Pills inside card (y = 5.05" to 5.58" -> completely above y = 5.95" crest!)
    add_box(s1, 1.35, 5.06, 8.00, 0.52, fill_rgb=WHITE, border_rgb=BORDER, rounded=True, radius=0.18)
    add_text(
        s1, 1.43, 5.08, 7.84, 0.48,
        [[
            {"text": "Study Locale & Pilot: ", "size": 9.4, "bold": True, "color": NAVY, "space_after": 0},
            {"text": "College of Information & Communications Technology (BSCS Program), STI WNU, Bacolod City",
             "size": 9.4, "bold": False, "color": SLATE_DARK}
        ]],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE
    )

    add_box(s1, 9.52, 5.06, 2.46, 0.52, fill_rgb=NAVY, border_rgb=NAVY, rounded=True, radius=0.18)
    add_text(
        s1, 9.56, 5.08, 2.38, 0.48,
        [[{"text": "November 2026", "size": 11, "bold": True, "color": WHITE,
           "align": PP_ALIGN.CENTER, "space_after": 0}]],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE
    )

    # =========================================================================
    # SLIDE 2: PROBLEM CONTEXT, PRIOR ARTS GAP & PILOT LOCALE
    # =========================================================================
    s2 = add_clean_slide(
        prs,
        "Chapters I and II identify three operational problems during accreditation preparation: scattered files "
        "across personal drives, difficulty tracking PACUCOA's 30-weight and dual-constraint floor rules manually, "
        "and lack of enforced separation of duties. Reviewed commercial and local systems do not natively model "
        "PACUCOA's mathematical floors or database-level self-verification blocking."
    )
    add_slide_header(
        s2,
        "Research Context, Institutional Problem & Prior Arts Gap",
        "Operational pain points in accreditation self-surveys and synthesis of reviewed literature (Chapters I–II)",
        "CH. I–II · CONTEXT", 2, TOTAL
    )

    # Left Column Header + 3 Problem Cards
    add_box(s2, 0.55, 1.66, 5.95, 0.36, fill_rgb=DARK_NAVY, border_rgb=None, rounded=False)
    add_text(s2, 0.65, 1.67, 5.75, 0.34,
             [[{"text": "OPERATIONAL CHALLENGES IN SELF-SURVEY PREPARATION", "size": 10, "bold": True,
                "color": WHITE, "space_after": 0}]], anchor=MSO_ANCHOR.MIDDLE)

    prob_cards = [
        ("1. Fragmented Documentary Exhibits", RED_FG, RED_BG,
         "Syllabi, faculty profiles, research outputs, and committee records are prepared by different personnel across personal drives, shared folders, and physical binders—causing episodic cramming and lost institutional memory."),
        ("2. Manual Weighting & Floor-Rule Blind Spots", AMBER_FG, AMBER_BG,
         "Spreadsheet tracking does not continuously evaluate PACUCOA's 30-weight formula alongside dual-constraint Area and criterion floor rules, allowing single-Area deficits to go unnoticed until pre-survey reviews."),
        ("3. Unenforced Verification & Audit Boundaries", ROYAL, BLUE_SOFT,
         "Generic cloud drives lack academic role delegation and separation-of-duties controls, permitting uploaders to mark their own exhibits complete without independent supervisory inspection."),
    ]
    for idx, (p_title, fg, bg, p_desc) in enumerate(prob_cards):
        top_y = 2.12 + idx * 1.26
        add_box(s2, 0.55, top_y, 5.95, 1.16, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.04)
        add_box(s2, 0.55, top_y, 0.10, 1.16, fill_rgb=fg, border_rgb=None, rounded=False)
        add_text(
            s2, 0.72, top_y + 0.06, 5.68, 1.04,
            [
                [{"text": p_title, "size": 11, "bold": True, "color": fg, "space_after": 3}],
                [{"text": p_desc, "size": 9.8, "bold": False, "color": SLATE_DARK, "space_after": 0}],
            ],
            line_spacing=1.12
        )

    # Right Column: Prior Arts Synthesis Card + Pilot Locale Card
    add_titled_card(
        s2, 6.72, 1.66, 6.06, 2.18,
        "PRIOR ARTS SYNTHESIS & RESEARCH GAP (CHAPTER II)",
        [
            [{"text": "• Commercial Platforms ", "size": 9.4, "bold": True, "color": NAVY, "space_after": 3},
             {"text": "(Watermark, Creatrix Campus, AchieveIt): Support broad institutional workflows and cloud repositories, but reviewed materials show no native PACUCOA 30-weight engine or dual-constraint floor evaluator.",
              "size": 9.3, "color": SLATE_DARK}],
            [{"text": "• Local Higher-Ed Repositories ", "size": 9.4, "bold": True, "color": NAVY, "space_after": 3},
             {"text": "(Pardiñan et al., 2024; Dres & Rabut, 2025; Galande, 2025; Salac et al., 2025): Digitize tagging and storage for SUCs/AACCUP, without database-enforced self-verification blocking or isolated what-if simulation.",
              "size": 9.3, "color": SLATE_DARK}],
            [{"text": "• Identified Gap Addressed: ", "size": 9.4, "bold": True, "color": GREEN_FG, "space_after": 0},
             {"text": "A PACUCOA-specific platform uniting criterion mapping, RLS separation of duties, 30-weight floor forecasting, and CICT's 4-column compliance matrix.",
              "size": 9.3, "bold": True, "color": SLATE_DARK}],
        ],
        header_bg=NAVY, badge_text="PRIOR ARTS", badge_bg=GOLD
    )

    add_titled_card(
        s2, 6.72, 3.94, 6.06, 1.90,
        "INSTITUTIONAL LOCALE & BSCS PILOT CONTEXT (STI WNU)",
        [
            [{"text": "• Study Locale: ", "size": 9.5, "bold": True, "color": NAVY, "space_after": 3},
             {"text": "College of Information and Communications Technology (CICT) & Quality Assurance Office, STI West Negros University, Bacolod City.",
              "size": 9.4, "color": SLATE_DARK}],
            [{"text": "• Why BSCS Pilot: ", "size": 9.5, "bold": True, "color": NAVY, "space_after": 3},
             {"text": "BSCS earned official PACUCOA Level I status in September 2026 (valid to Sept. 2030), while BSIT holds Level II status—making BSCS the active candidate transitioning toward Level II digital readiness.",
              "size": 9.4, "color": SLATE_DARK}],
            [{"text": "• Working Instrument: ", "size": 9.5, "bold": True, "color": NAVY, "space_after": 0},
             {"text": "79 active evaluative criteria across 10 PACUCOA Areas (derived from the CICT BSCS Compliance Report; dynamically configurable per program).",
              "size": 9.4, "color": SLATE_DARK}],
        ],
        header_bg=ROYAL, badge_text="PILOT SCOPE", badge_bg=GOLD_SOFT
    )

    # =========================================================================
    # SLIDE 3: REGULATORY FOUNDATION - PACUCOA 30-WEIGHT & FLOOR RULES
    # =========================================================================
    s3 = add_clean_slide(
        prs,
        "The system's mathematical rules come directly from the Revised September 2023 PACUCOA Manual. "
        "Ten undergraduate Areas carry weights totaling 30—Instruction carries 4, Physical Plant carries 2, "
        "and the other eight Areas carry 3 each. Levels require satisfying both an overall weighted mean and "
        "strict Area or criterion minimum floors."
    )
    add_slide_header(
        s3,
        "Regulatory Foundation: PACUCOA Undergraduate Framework",
        "Official 10 Evaluative Areas, 30-Weight Distribution (Table 1), and Dual-Constraint Level Thresholds",
        "CH. I & III · PACUCOA", 3, TOTAL
    )

    # Left: Compact 10-Area Weight Table (Table 1)
    tbl3_shp = s3.shapes.add_table(12, 3, Inches(0.55), Inches(1.66), Inches(6.05), Inches(4.18))
    tbl3 = tbl3_shp.table
    tbl3.columns[0].width = Inches(1.05)
    tbl3.columns[1].width = Inches(3.95)
    tbl3.columns[2].width = Inches(1.05)

    t1_rows = [
        ("Area", "PACUCOA Undergraduate Evaluative Area", "Weight"),
        ("Area I", "Philosophy and Objectives", "3"),
        ("Area II", "Faculty", "3"),
        ("Area III", "Instruction (Highest Curricular Weight)", "4"),
        ("Area IV", "Laboratory", "3"),
        ("Area V", "Research", "3"),
        ("Area VI", "Library", "3"),
        ("Area VII", "Student Services", "3"),
        ("Area VIII", "Social Orientation & Community Involvement", "3"),
        ("Area IX", "Physical Plant and Facilities", "2"),
        ("Area X", "Organization and Administration", "3"),
        ("TOTAL", "Sum of Equivalent Area Weights", "30"),
    ]
    for r_i, (c0, c1, c2) in enumerate(t1_rows):
        if r_i == 0:
            style_cell(tbl3.cell(r_i, 0), c0, 9.5, True, WHITE, NAVY, PP_ALIGN.CENTER)
            style_cell(tbl3.cell(r_i, 1), c1, 9.5, True, WHITE, NAVY, PP_ALIGN.LEFT)
            style_cell(tbl3.cell(r_i, 2), c2, 9.5, True, WHITE, NAVY, PP_ALIGN.CENTER)
        elif r_i == 11:
            style_cell(tbl3.cell(r_i, 0), c0, 9.5, True, NAVY, GOLD_SOFT, PP_ALIGN.CENTER)
            style_cell(tbl3.cell(r_i, 1), c1, 9.5, True, NAVY, GOLD_SOFT, PP_ALIGN.LEFT)
            style_cell(tbl3.cell(r_i, 2), c2, 10.0, True, NAVY, GOLD_SOFT, PP_ALIGN.CENTER)
        else:
            bg = BLUE_SOFT if r_i in (3, 9) else (SLATE_ALT if r_i % 2 == 0 else WHITE)
            bold_fl = r_i in (3, 9)
            style_cell(tbl3.cell(r_i, 0), c0, 9.0, True, NAVY, bg, PP_ALIGN.CENTER)
            style_cell(tbl3.cell(r_i, 1), c1, 9.0, bold_fl, SLATE_DARK, bg, PP_ALIGN.LEFT)
            style_cell(tbl3.cell(r_i, 2), c2, 9.5, True, ROYAL if bold_fl else SLATE_DARK, bg, PP_ALIGN.CENTER)

    # Right: Dual-Constraint Level Threshold Cards
    add_box(s3, 6.80, 1.66, 5.98, 0.36, fill_rgb=DARK_NAVY, border_rgb=None, rounded=False)
    add_text(s3, 6.90, 1.67, 5.80, 0.34,
             [[{"text": "DUAL-CONSTRAINT ACCREDITATION LEVEL THRESHOLDS", "size": 10, "bold": True,
                "color": WHITE, "space_after": 0}]], anchor=MSO_ANCHOR.MIDDLE)

    levels = [
        ("CANDIDATE STATUS", "Overall >= 3.00", "No minimum Area floor constraint",
         "Requires overall weighted program average of at least 3.00 (Satisfactory) across the 30-weight instrument.",
         SLATE_MED, SLATE_LIGHT),
        ("LEVEL I ACCREDITED", "Overall >= 3.00", "AND No Area Mean < 3.00",
         "Every one of the ten PACUCOA Areas must achieve an Area mean of at least 3.00; any single Area < 3.00 blocks eligibility.",
         ROYAL, BLUE_SOFT),
        ("LEVEL II REACCREDITED", "Overall >= 3.50", "AND No Area Mean < 3.50",
         "Requires higher overall program mean (>= 3.50) AND all ten individual Area means at or above 3.50.",
         GOLD_DARK, GOLD_SOFT),
        ("LEVELS III & IV", "Overall >= 4.00", "AND No Criterion < 4.00*",
         "System enforces the stricter minimum-rating summary rule (no individual criterion < 4.00; Manual Section 10 notes Area mean 4.00). Supplementary criteria lie outside self-survey scoring.",
         GREEN_FG, GREEN_BG),
    ]
    for idx, (lvl_name, c_ovr, c_flr, desc, accent_c, bg_c) in enumerate(levels):
        ty = 2.10 + idx * 0.94
        add_box(s3, 6.80, ty, 5.98, 0.87, fill_rgb=bg_c, border_rgb=BORDER, rounded=True, radius=0.05)
        add_box(s3, 6.80, ty, 0.10, 0.87, fill_rgb=accent_c, border_rgb=None, rounded=False)
        add_text(
            s3, 6.96, ty + 0.04, 5.74, 0.79,
            [
                [
                    {"text": f"{lvl_name}   ", "size": 10, "bold": True, "color": accent_c, "space_after": 2},
                    {"text": f"[{c_ovr}  |  {c_flr}]", "size": 9.3, "bold": True, "color": NAVY}
                ],
                [{"text": desc, "size": 8.8, "bold": False, "color": SLATE_DARK, "space_after": 0}],
            ],
            line_spacing=1.08
        )

    add_bottom_takeaway(
        s3, "Scope Note",
        "Models PACUCOA Step Two (Institutional Self-Survey) & Revisit Compliance; required document count (R) is a QA-configurable completeness proxy, not an accreditor-prescribed count."
    )

    # =========================================================================
    # SLIDE 4: OBJECTIVES OF THE STUDY
    # =========================================================================
    s4 = add_clean_slide(
        prs,
        "Our General Objective is to design, develop, and evaluate the web-based accreditation management and "
        "readiness assessment system for STI West Negros University, operationalized through six specific "
        "objectives covering our four functional modules, role-based separation of duties, and ISO/IEC 25010 evaluation."
    )
    add_slide_header(
        s4,
        "Objectives of the Study",
        "General Objective and Six Specific Research & Engineering Objectives (Chapter I)",
        "CH. I · OBJECTIVES", 4, TOTAL
    )

    # General Objective Top Banner Card
    add_box(s4, 0.55, 1.64, 12.23, 0.90, fill_rgb=BLUE_SOFT, border_rgb=ROYAL, border_pt=1.2, rounded=True, radius=0.05)
    add_box(s4, 0.55, 1.64, 1.75, 0.90, fill_rgb=NAVY, border_rgb=NAVY, rounded=False)
    add_text(
        s4, 0.60, 1.66, 1.65, 0.86,
        [[{"text": "GENERAL\nOBJECTIVE", "size": 11, "bold": True, "color": GOLD,
           "align": PP_ALIGN.CENTER, "space_after": 0}]],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.15
    )
    add_text(
        s4, 2.40, 1.68, 10.28, 0.82,
        [[
            {"text": "To design, develop, and evaluate a ", "size": 10.8, "color": SLATE_DARK, "space_after": 0},
            {"text": "Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University",
             "size": 10.8, "bold": True, "color": NAVY},
            {"text": " that automates evidence mapping, enforces independent verification with a self-verification block, calculates PACUCOA-compliant readiness ratings, provides what-if readiness simulation, and tracks post-visit compliance.",
             "size": 10.8, "color": SLATE_DARK},
        ]],
        anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.16
    )

    # 2x3 Grid of Specific Objectives (y = 2.66" to 5.86")
    spec_cards = [
        ("OBJ 01", "Evidence Management & Mapping",
         "Store accreditation exhibits under PACUCOA criteria and validate file types, effective dates, and required document proxy counts (R) with server-side PDF text-layer extraction.",
         NAVY),
        ("OBJ 02", "Scoring & 5x2 Command Dashboard",
         "Compute real-time ratings at criterion, Area, and program levels using PACUCOA's 30-weight formula and dual-constraint floor rules in a zero-scroll 5x2 layout.",
         ROYAL),
        ("OBJ 03", "What-If Readiness Simulation",
         "Project program ratings and accreditation level floor thresholds when up to ten unresolved criteria are completed (benchmark 4.00) without mutating live production records.",
         NAVY),
        ("OBJ 04", "Post-Visit Compliance Tracking",
         "Record opportunities for improvement, PACUCOA recommendations, sub-numbered actions taken (1.1, 1.2), and linked verification exhibits in a four-column matrix.",
         ROYAL),
        ("OBJ 05", "RBAC & Separation of Duties",
         "Enforce 8-role access control and database-level separation of duties preventing self-verification (uploader_id != verifier_id; QA Officer exempt) across academic delegations.",
         NAVY),
        ("OBJ 06", "ISO/IEC 25010 Quality Evaluation",
         "Assess software quality across all eight ISO/IEC 25010 characteristics with N = 20 purposive respondents (15 institutional stakeholders and 5 external IT experts).",
         GOLD_DARK),
    ]
    card_w = 3.94
    card_h = 1.50
    gap_x = 0.205
    gap_y = 0.16
    for idx, (tag, title, body, hdr_c) in enumerate(spec_cards):
        col = idx % 3
        row = idx // 3
        cx = 0.55 + col * (card_w + gap_x)
        cy = 2.68 + row * (card_h + gap_y)
        add_titled_card(
            s4, cx, cy, card_w, card_h,
            title,
            [[{"text": body, "size": 9.6, "color": SLATE_DARK, "space_after": 0}]],
            header_bg=hdr_c, badge_text=tag, badge_bg=GOLD if hdr_c != GOLD_DARK else WHITE
        )

    # =========================================================================
    # SLIDE 5: CONCEPTUAL FRAMEWORK (IPO MODEL WITH FEEDBACK LOOP - FIGURE 1)
    # =========================================================================
    s5 = add_clean_slide(
        prs,
        "Figure 1 illustrates the Input-Process-Output Conceptual Framework with a continuous feedback loop. "
        "PACUCOA standards, BSCS exhibits, user roles, and prior survey recommendations enter deterministic "
        "validation, RLS verification, scoring, and simulation processes to produce real-time readiness intelligence."
    )
    add_slide_header(
        s5,
        "Conceptual Framework of the Study",
        "Input–Process–Output (IPO) Model with Continuous Quality Improvement Feedback Loop (Figure 1)",
        "CH. I · FRAMEWORK", 5, TOTAL
    )

    fig1_path = os.path.join("figures", "figure1_conceptual_framework.png")
    # Frame for Figure 1 (native 2000x960 = 2.0833:1 -> w=8.75", h=4.20")
    add_box(s5, 0.55, 1.65, 8.85, 4.24, fill_rgb=WHITE, border_rgb=BORDER, border_pt=1.2, rounded=True, radius=0.02)
    if os.path.exists(fig1_path):
        s5.shapes.add_picture(fig1_path, Inches(0.60), Inches(1.69), width=Inches(8.75), height=Inches(4.16))

    # Right summary stack (x = 9.54", w = 3.24", y = 1.65" to 5.89")
    ipo_notes = [
        ("1. INPUTS", NAVY, BLUE_SOFT,
         "PACUCOA 2023 Manual (10 Areas, sum=30), BSCS exhibits, 8 user role profiles, QA validity/proxy rules (R), and prior revisit recommendations."),
        ("2. PROCESSES", ROYAL, SLATE_LIGHT,
         "PDF text-layer regex tagging, RLS self-verification blocking, piecewise & 30-weight scoring, dual-constraint evaluation, and isolated simulation."),
        ("3. OUTPUTS", GREEN_FG, GREEN_BG,
         "Centralized repository, 5x2 RAG dashboard, indicative readiness & simulation forecasts, 4-column compliance matrix, and ISO 25010 profile."),
        ("4. FEEDBACK LOOP", GOLD_DARK, GOLD_SOFT,
         "Channels gap analytics back to QA Officers, Deans, Program Heads, and Faculty for continuous exhibit curation before PACUCOA visits."),
    ]
    for idx, (st_title, fg_c, bg_c, st_body) in enumerate(ipo_notes):
        sy = 1.65 + idx * 1.07
        add_box(s5, 9.54, sy, 3.24, 1.00, fill_rgb=bg_c, border_rgb=BORDER, rounded=True, radius=0.05)
        add_box(s5, 9.54, sy, 0.09, 1.00, fill_rgb=fg_c, border_rgb=None, rounded=False)
        add_text(
            s5, 9.68, sy + 0.04, 3.04, 0.92,
            [
                [{"text": st_title, "size": 9.8, "bold": True, "color": fg_c, "space_after": 2}],
                [{"text": st_body, "size": 8.7, "color": SLATE_DARK, "space_after": 0}],
            ],
            line_spacing=1.08
        )

    # =========================================================================
    # SLIDE 6: RESEARCH DESIGN & AGILE SCRUM METHODOLOGY (CHAPTER III, TABLE 3)
    # =========================================================================
    s6 = add_clean_slide(
        prs,
        "Chapter III employs a Developmental Research Design with a descriptive-evaluative component following "
        "Agile Scrum across four iterations from August to October 2026—progressing from PostgreSQL schema and RBAC, "
        "to PDF text-layer ingestion, to the 30-weight scoring and simulation engine, and finally the 4-column compliance matrix and N=20 evaluation."
    )
    add_slide_header(
        s6,
        "Research Design & Agile Scrum Development Methodology",
        "Developmental-Evaluative Research (Richey & Klein, 2007) across Four Iterative Scrum Sprints (Table 3, Aug–Oct 2026)",
        "CH. III · METHODS", 6, TOTAL
    )

    # Top Methodology Strip
    add_box(s6, 0.55, 1.64, 12.23, 0.62, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.06)
    pillars_m = [
        ("Research Design:", "Developmental & Descriptive-Evaluative"),
        ("SDLC Framework:", "Agile Scrum (Schwaber & Sutherland, 2020)"),
        ("Timeline:", "August – October 2026 (4 Sprints)"),
        ("Sampling & Eval:", "Purposive (N = 20) · ISO/IEC 25010"),
    ]
    for i, (k, v) in enumerate(pillars_m):
        px = 0.68 + i * 3.04
        add_text(
            s6, px, 1.68, 2.95, 0.54,
            [
                [{"text": k, "size": 8.8, "bold": True, "color": ROYAL, "space_after": 1}],
                [{"text": v, "size": 9.5, "bold": True, "color": NAVY, "space_after": 0}],
            ],
            anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.05
        )

    # 4 Sprint Columns (y = 2.38" to 5.84")
    sprints = [
        ("ITERATION 1", "Late Aug – Early Sep 2026", "Schema, Auth & RBAC", NAVY, [
            "• Requirements matrix from PACUCOA 2023 Manual & CICT Compliance Report",
            "• 15 normalized PostgreSQL relational tables in Supabase",
            "• JWT authentication & 8 institutional role definitions",
            "• Program & Area delegation schema (Chair, Co-Chair, Member)",
        ], "Deliverable: Normalized DB Schema & RBAC Auth"),
        ("ITERATION 2", "September 2026", "Repository & Verification", ROYAL, [
            "• Dynamic PACUCOA 10-Area & 79 BSCS pilot criteria configuration",
            "• Private S3 object storage with 300-sec signed preview URLs",
            "• Server-side PDF text-layer regex date/keyword parser (no OCR)",
            "• Must-View preview gate & RLS self-verification block",
        ], "Deliverable: Evidence Library & Review Queue"),
        ("ITERATION 3", "Late Sep – Early Oct 2026", "Scoring, 5x2 UI & Sandbox", NAVY, [
            "• Piecewise criterion formula S(V, R) & N.A. exclusion logic",
            "• 30-weight program rating & dual-constraint floor evaluator",
            "• Zero-scroll Executive 5x2 RAG Command Dashboard",
            "• Isolated What-If Simulation Sandbox (<= 10 criteria at 4.00)",
        ], "Deliverable: Scoring Engine, 5x2 UI & Sandbox"),
        ("ITERATION 4", "October 2026", "Compliance, Audit & Eval", GOLD_DARK, [
            "• 4-Column Post-Visit Compliance Matrix (CICT report format)",
            "• Sub-numbered actions (1.1, 1.2) linked to repository PDFs",
            "• Append-only relational audit_log & boundary test suite",
            "• Formal ISO/IEC 25010 quality evaluation across N = 20 respondents",
        ], "Deliverable: Compliance Matrix & ISO Evaluation"),
    ]
    sw = 2.93
    sgap = 0.17
    for idx, (sp_tag, sp_date, sp_title, sp_c, bullets, deliv) in enumerate(sprints):
        sx = 0.55 + idx * (sw + sgap)
        sy = 2.38
        sh = 3.46
        add_box(s6, sx, sy, sw, sh, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.04)
        add_box(s6, sx, sy, sw, 0.56, fill_rgb=sp_c, border_rgb=sp_c, rounded=False)
        add_text(
            s6, sx + 0.08, sy + 0.04, sw - 0.16, 0.48,
            [
                [{"text": f"{sp_tag}  ·  {sp_date}", "size": 8.3, "bold": True, "color": GOLD_SOFT, "space_after": 1}],
                [{"text": sp_title, "size": 10.5, "bold": True, "color": WHITE, "space_after": 0}],
            ],
            line_spacing=1.05
        )
        b_paras = [[{"text": b, "size": 9.0, "color": SLATE_DARK, "space_after": 4}] for b in bullets]
        add_text(s6, sx + 0.08, sy + 0.62, sw - 0.16, 2.28, b_paras, line_spacing=1.12)

        # Bottom deliverable pill inside card
        add_box(s6, sx + 0.08, sy + 2.94, sw - 0.16, 0.44, fill_rgb=WHITE, border_rgb= sp_c,
                border_pt=1.0, rounded=True, radius=0.15)
        add_text(
            s6, sx + 0.12, sy + 2.95, sw - 0.24, 0.42,
            [[{"text": deliv, "size": 8.4, "bold": True, "color": sp_c,
               "align": PP_ALIGN.CENTER, "space_after": 0}]],
            align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.05
        )

    # =========================================================================
    # SLIDE 7: THREE-TIER CLOUD SYSTEM ARCHITECTURE & TECHNICAL STACK
    # =========================================================================
    s7 = add_clean_slide(
        prs,
        "The platform uses a modular three-tier cloud architecture: Next.js, React, TypeScript, and Tailwind CSS "
        "on Vercel for presentation; deterministic server-side routes for PDF text-layer extraction, scoring, and "
        "signed URL brokerage; and Supabase PostgreSQL 15 with Row-Level Security and private AES-256 object storage."
    )
    add_slide_header(
        s7,
        "Three-Tier Cloud System Architecture & Technical Stack",
        "Modular Serverless Presentation, Deterministic Application Services, and PostgreSQL RLS Data Layer (Chapter III)",
        "CH. III · ARCHITECTURE", 7, TOTAL
    )

    tiers = [
        ("TIER 1 · PRESENTATION LAYER", "Next.js 14 · TypeScript · Tailwind CSS (Vercel)", NAVY, [
            ("Executive 5x2 Command UI", "Zero-scroll panoramic 10-Area grid with RAG status badges & drill-down."),
            ("Role-Scoped Workspaces", "Dedicated portals for Admin, QA, Dean, Program Head, Chairs, Faculty, Reps."),
            ("Interactive Preview & Sandbox", "In-browser PDF signed-URL viewer, What-If selector, & 4-Column Matrix."),
            ("Transport Security", "Evergreen browsers over full HTTPS / TLS 1.3 transport encryption."),
        ]),
        ("TIER 2 · APPLICATION & LOGIC", "Next.js Server Routes & Deterministic Engines", ROYAL, [
            ("Deterministic PDF Text Parser", "Extracts PDF text layer + regex ISO/alphanumeric dates & keywords (no black-box ML; human-in-the-loop)."),
            ("PACUCOA Scoring Service", "Executes piecewise S(V, R), N.A. filtering, 30-weight sum, and dual-constraint floor checks."),
            ("Signed URL & Auth Broker", "Validates pgjwt session scopes and mints 300-second expiry download tokens."),
            ("Sandbox Isolation Controller", "Computes <= 10-criteria projections into isolated records without mutating live scores."),
        ]),
        ("TIER 3 · DATA & SECURITY (BaaS)", "Supabase · PostgreSQL 15 · Private S3 Storage", DARK_NAVY, [
            ("15 Normalized Relational Tables", "Dynamic frameworks, areas, criteria, levels, users, assignments, evidence, scores, cycles, matrix."),
            ("Row-Level Security (RLS)", "Database-enforced separation of duties: blocks UPDATE where uploader_id = auth.uid() (QA exempt)."),
            ("Private Object Storage Bucket", "Non-public exhibit bucket encrypted with AES-256 at rest; blocks direct URL guessing."),
            ("Append-Only Audit Trail", "Relational audit_log records actor, action, target entity, and timestamp for completed transactions."),
        ]),
    ]

    tw = 3.84
    tgap = 0.355
    for idx, (t_hdr, t_sub, t_col, items) in enumerate(tiers):
        tx = 0.55 + idx * (tw + tgap)
        ty = 1.66
        th = 4.18
        add_box(s7, tx, ty, tw, th, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.03)
        add_box(s7, tx, ty, tw, 0.58, fill_rgb=t_col, border_rgb=t_col, rounded=False)
        add_text(
            s7, tx + 0.08, ty + 0.04, tw - 0.16, 0.50,
            [
                [{"text": t_hdr, "size": 10, "bold": True, "color": GOLD, "space_after": 1}],
                [{"text": t_sub, "size": 8.8, "bold": True, "color": WHITE, "space_after": 0}],
            ],
            line_spacing=1.05
        )
        for j, (it_t, it_d) in enumerate(items):
            iy = ty + 0.68 + j * 0.85
            add_box(s7, tx + 0.10, iy, tw - 0.20, 0.77, fill_rgb=WHITE, border_rgb=BORDER, rounded=True, radius=0.08)
            add_text(
                s7, tx + 0.16, iy + 0.04, tw - 0.32, 0.69,
                [
                    [{"text": it_t, "size": 9.3, "bold": True, "color": t_col, "space_after": 1}],
                    [{"text": it_d, "size": 8.4, "color": SLATE_DARK, "space_after": 0}],
                ],
                line_spacing=1.06
            )

        # Bidirectional arrow connector between tiers
        if idx < 2:
            ax = tx + tw + 0.05
            arr = s7.shapes.add_shape(MSO_SHAPE.LEFT_RIGHT_ARROW, Inches(ax), Inches(3.55), Inches(0.255), Inches(0.32))
            set_shape_Rect(arr, fill_rgb=GOLD, border_rgb=GOLD_DARK, border_pt=0.75, radius=None)

    add_bottom_takeaway(
        s7, "Deployment Specs",
        "Dev: Core i5/Ryzen 5, 8–16 GB RAM, Node.js v20+  |  Cloud: Vercel Edge + Supabase PostgreSQL 15  |  Client: OS-agnostic, 4 GB RAM, 1366x768+ (1920x1080 optimal)."
    )

    # =========================================================================
    # SLIDE 8: MATHEMATICAL SCORING ENGINE & RBAC SEPARATION OF DUTIES
    # =========================================================================
    s8 = add_clean_slide(
        prs,
        "Slide 8 details the two core engineering controls: on the left, our deterministic piecewise criterion "
        "formula, N.A. exclusion, and 30-weight aggregation; on the right, our 8-role RBAC hierarchy and "
        "dual-layer self-verification block enforced in both the React UI and Supabase PostgreSQL RLS."
    )
    add_slide_header(
        s8,
        "Mathematical Readiness Engine & Separation-of-Duties Security",
        "Piecewise Criterion Formula, 30-Weight Aggregation, 8-Role RBAC, and PostgreSQL RLS Self-Verification Block",
        "CH. III · ENGINE & RLS", 8, TOTAL
    )

    # Left Card: Mathematical Scoring Formulas
    add_titled_card(
        s8, 0.55, 1.66, 5.95, 4.20,
        "DETERMINISTIC PACUCOA SCORING MECHANICS",
        [
            [{"text": "1. Piecewise Criterion Score  s in [0.00, 5.00]", "size": 10.2, "bold": True, "color": NAVY, "space_after": 2}],
            [{"text": "Let V = verified valid exhibits,  R = configurable required document proxy count:", "size": 9.0, "italic": True, "color": SLATE_MED, "space_after": 4}],
            [{"text": "   • Missing (V = 0):   ", "size": 9.4, "bold": True, "color": RED_FG, "space_after": 2},
             {"text": "s = 0.00", "size": 9.5, "bold": True, "color": SLATE_DARK}],
            [{"text": "   • Partial (0 < V < R):   ", "size": 9.4, "bold": True, "color": AMBER_FG, "space_after": 2},
             {"text": "s = max( 1.00,  2.00 x (V / R) )   [yields 1.00 – 1.99]", "size": 9.4, "bold": True, "color": SLATE_DARK}],
            [{"text": "   • Met / Exceeded (V >= R):   ", "size": 9.4, "bold": True, "color": GREEN_FG, "space_after": 6},
             {"text": "s = min( 5.00,  3.00 + 2.00 x ((V / R) - 1) )", "size": 9.4, "bold": True, "color": SLATE_DARK}],
            [{"text": "Why the jump to 3.00 at V = R? ", "size": 9.0, "bold": True, "color": ROYAL, "space_after": 6},
             {"text": "3.00 represents PACUCOA's 'Satisfactory' compliance baseline once required documentary completeness (R) is met; supplemental verified exhibits scale linearly up to 5.00 (at V = 2R).",
              "size": 8.9, "color": SLATE_DARK}],
            [{"text": "2. Area Mean & 30-Weight Program Rating", "size": 10.2, "bold": True, "color": NAVY, "space_after": 3}],
            [{"text": "   • Area Mean_a = Sum(s_i) / n_a   (criteria marked Not Applicable [N.A.] excluded)", "size": 9.2, "bold": True, "color": SLATE_DARK, "space_after": 2}],
            [{"text": "   • Program Rating = Sum( Area Mean_a x Weight_a ) / 30", "size": 9.4, "bold": True, "color": ROYAL, "space_after": 6}],
            [{"text": "3. Dashboard RAG Status Thresholds", "size": 9.8, "bold": True, "color": NAVY, "space_after": 0}],
            [
                {"text": "   Red < 3.00 (Deficit)  |  ", "size": 8.9, "bold": True, "color": RED_FG, "space_after": 0},
                {"text": "Amber 3.00–3.49  |  ", "size": 8.9, "bold": True, "color": AMBER_FG},
                {"text": "Yellow 3.50–3.99  |  ", "size": 8.9, "bold": True, "color": GOLD_DARK},
                {"text": "Green >= 4.00", "size": 8.9, "bold": True, "color": GREEN_FG},
            ],
        ],
        header_bg=NAVY, badge_text="EQUATIONS", badge_bg=GOLD
    )

    # Right Top: Compact 8-Role RBAC Table (Table 4)
    tbl8_shp = s8.shapes.add_table(8, 3, Inches(6.72), Inches(1.66), Inches(6.06), Inches(2.86))
    tbl8 = tbl8_shp.table
    tbl8.columns[0].width = Inches(1.58)
    tbl8.columns[1].width = Inches(1.05)
    tbl8.columns[2].width = Inches(3.43)

    rbac_rows = [
        ("System Role (8 Roles)", "Scope", "Enforced Permissions & Boundaries"),
        ("System Admin", "Institution", "Depts, programs, users, audit log; CANNOT upload/verify."),
        ("QA Officer", "Institution", "Frameworks, weights (=30), oversight; EXEMPT from self-block."),
        ("College Dean", "College", "Read-only 5x2 analytics, simulations & compliance oversight."),
        ("Program Head", "Program", "Assigns chairs, runs simulations, verifies (except own uploads)."),
        ("Area Chair / Co-Chair", "Assigned Area", "Verifies assigned Area exhibits (except own uploads)."),
        ("Faculty Member", "Assigned Area", "Uploads exhibits & metadata; CANNOT verify any exhibit."),
        ("Alumni / Student Rep", "Program", "Sanitized readiness summary only; zero file/user access."),
    ]
    for r_i, (c0, c1, c2) in enumerate(rbac_rows):
        if r_i == 0:
            style_cell(tbl8.cell(r_i, 0), c0, 8.8, True, WHITE, DARK_NAVY, PP_ALIGN.LEFT)
            style_cell(tbl8.cell(r_i, 1), c1, 8.8, True, WHITE, DARK_NAVY, PP_ALIGN.CENTER)
            style_cell(tbl8.cell(r_i, 2), c2, 8.8, True, WHITE, DARK_NAVY, PP_ALIGN.LEFT)
        else:
            bg = SLATE_ALT if r_i % 2 == 0 else WHITE
            style_cell(tbl8.cell(r_i, 0), c0, 8.3, True, NAVY, bg, PP_ALIGN.LEFT, margin_tb=0.02)
            style_cell(tbl8.cell(r_i, 1), c1, 8.2, False, SLATE_MED, bg, PP_ALIGN.CENTER, margin_tb=0.02)
            style_cell(tbl8.cell(r_i, 2), c2, 8.2, False, SLATE_DARK, bg, PP_ALIGN.LEFT, margin_tb=0.02)

    # Right Bottom: Separation-of-Duties Enforcement Card
    add_titled_card(
        s8, 6.72, 4.62, 6.06, 1.24,
        "DUAL-LAYER SEPARATION OF DUTIES (RLS + MUST-VIEW GATE)",
        [
            [{"text": "• Mandatory Preview Gate: ", "size": 9.0, "bold": True, "color": NAVY, "space_after": 2},
             {"text": "Reviewers must open the signed-URL document preview ('Must View' -> 'Inspected') before Approve/Reject unlocks.",
              "size": 8.8, "color": SLATE_DARK}],
            [{"text": "• PostgreSQL RLS Self-Block: ", "size": 9.0, "bold": True, "color": RED_FG, "space_after": 0},
             {"text": "UI disables action ('Cannot evaluate own upload') AND RLS policy rejects UPDATE when uploader_id = auth.uid() (QA Officer exempt).",
              "size": 8.8, "color": SLATE_DARK}],
        ],
        header_bg=ROYAL, header_h=0.32
    )

    # =========================================================================
    # SLIDE 9: SYSTEM SHOWCASE (1/2) - 5x2 DASHBOARD & EVIDENCE REPOSITORY
    # =========================================================================
    s9 = add_clean_slide(
        prs,
        "Figures 16 and 17 demonstrate the live deployed platform for the BSCS pilot. On the left, the Executive 5x2 "
        "Command Dashboard renders all 10 PACUCOA Areas simultaneously with the 3.22 indicative rating and flags "
        "Areas IV, V, and VII. On the right, the Evidence Repository organizes 371 digital artifacts by Area and Exhibit."
    )
    add_slide_header(
        s9,
        "System Implementation (1/2): Command Dashboard & Repository",
        "Operational BSCS Pilot Screenshots — Executive 5x2 Command Dashboard (Fig. 16) & Evidence Library (Fig. 17)",
        "CH. IV · LIVE SYSTEM", 9, TOTAL
    )

    # Two side-by-side 16:10 screenshots: w = 5.96", h = 3.725" at y = 1.66"
    fig16 = os.path.join("figures", "figure16_executive_dashboard.png")
    fig17 = os.path.join("figures", "figure17_evidence_management.png")

    add_box(s9, 0.55, 1.64, 6.00, 3.78, fill_rgb=WHITE, border_rgb=BORDER, border_pt=1.2, rounded=False)
    if os.path.exists(fig16):
        s9.shapes.add_picture(fig16, Inches(0.57), Inches(1.66), width=Inches(5.96), height=Inches(3.725))

    add_box(s9, 6.78, 1.64, 6.00, 3.78, fill_rgb=WHITE, border_rgb=BORDER, border_pt=1.2, rounded=False)
    if os.path.exists(fig17):
        s9.shapes.add_picture(fig17, Inches(6.80), Inches(1.66), width=Inches(5.96), height=Inches(3.725))

    # Captions below screenshots (y = 5.46" to 5.88" -> completely above y = 5.95" crest!)
    add_box(s9, 0.55, 5.46, 6.00, 0.42, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.10)
    add_text(
        s9, 0.62, 5.47, 5.86, 0.40,
        [[
            {"text": "Fig. 16 · Executive 5x2 Dashboard: ", "size": 8.8, "bold": True, "color": NAVY, "space_after": 0},
            {"text": "Displays 3.22/5.00 baseline, 79 criteria, 368 approved files, & flags Areas IV, V, VII (< 3.00).",
             "size": 8.6, "color": SLATE_DARK}
        ]],
        anchor=MSO_ANCHOR.MIDDLE
    )

    add_box(s9, 6.78, 5.46, 6.00, 0.42, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.10)
    add_text(
        s9, 6.85, 5.47, 5.86, 0.40,
        [[
            {"text": "Fig. 17 · Evidence Repository: ", "size": 8.8, "bold": True, "color": ROYAL, "space_after": 0},
            {"text": "Organizes 371 exhibits across Areas I–X with PDF text-layer metadata tagging & signed URLs.",
             "size": 8.6, "color": SLATE_DARK}
        ]],
        anchor=MSO_ANCHOR.MIDDLE
    )

    # =========================================================================
    # SLIDE 10: SYSTEM SHOWCASE (2/2) - VERIFICATION, SANDBOX & 4-COLUMN MATRIX
    # =========================================================================
    s10 = add_clean_slide(
        prs,
        "Figures 18, 19, and 20 demonstrate our three governance and decision-support modules: the Independent "
        "Verification Queue showing the Must-View gate and 'Cannot evaluate own upload' block; the isolated What-If "
        "Simulation Engine; and the 4-Column Post-Visit Compliance Matrix with sub-numbered actions and linked PDFs."
    )
    add_slide_header(
        s10,
        "System Implementation (2/2): Verification, Simulation & Compliance",
        "Operational Interfaces for Self-Verification Blocking (Fig. 18), What-If Sandbox (Fig. 19) & 4-Column Matrix (Fig. 20)",
        "CH. IV · LIVE SYSTEM", 10, TOTAL
    )

    showcase_3 = [
        (os.path.join("figures", "figure18_verification_queue.png"),
         "Fig. 18 · Verification Queue & Self-Block", NAVY,
         "• Enforces 'Must View' inspection gate prior to approval.\n"
         "• Blocks uploader self-approval ('Cannot evaluate own upload' on Criterion IV.10) at UI + PostgreSQL RLS."),
        (os.path.join("figures", "figure19_simulation_sandbox.png"),
         "Fig. 19 · What-If Simulation Sandbox", ROYAL,
         "• Selects up to 10 unresolved criteria ('Weak' / 'No Evidence').\n"
         "• Projects 4.00 completion gains in real time without mutating production self-survey scores."),
        (os.path.join("figures", "figure20_compliance_matrix.png"),
         "Fig. 20 · 4-Column Compliance Matrix", DARK_NAVY,
         "• Follows CICT BSCS Compliance Report layout (79 items).\n"
         "• Tracks OFIs, PACUCOA Recommendations, sub-numbered Actions (1.1), & direct repository PDF previews."),
    ]
    cw3 = 3.94
    cgap3 = 0.205
    # 2880x1800 (1.6:1) -> width 3.90" => height 2.4375"
    for idx, (img_p, c_title, hdr_c, c_desc) in enumerate(showcase_3):
        cx = 0.55 + idx * (cw3 + cgap3)
        add_box(s10, cx, 1.66, cw3, 2.50, fill_rgb=WHITE, border_rgb=BORDER, border_pt=1.1, rounded=False)
        if os.path.exists(img_p):
            s10.shapes.add_picture(img_p, Inches(cx + 0.02), Inches(1.68), width=Inches(3.90), height=Inches(2.44))

        add_titled_card(
            s10, cx, 4.24, cw3, 1.62,
            c_title,
            [[{"text": c_desc, "size": 8.9, "color": SLATE_DARK, "space_after": 0}]],
            header_bg=hdr_c, header_h=0.34
        )

    # =========================================================================
    # SLIDE 11: RESULTS (1/2) - BSCS BASELINE & WHAT-IF SIMULATION (TABLE 9)
    # =========================================================================
    s11 = add_clean_slide(
        prs,
        "Table 9 presents the empirical verification of the scoring engine on the loaded BSCS dataset. The baseline "
        "rating is 3.22 (96.58 / 30), flagging Areas IV (2.67), V (2.82), and VII (1.30) below the 3.00 Level I floor. "
        "Note that BSCS earned official PACUCOA Level I status in September 2026; 3.22 reflects digitized repository "
        "files. Simulating 10 priority criteria raises the rating to 3.57, clearing all Level I floors while 5 Areas "
        "remain below the 3.50 Level II Area floor."
    )
    add_slide_header(
        s11,
        "Empirical Results (1/2): BSCS Baseline & What-If Simulation",
        "Indicative Repository Baseline (Table 9) and 10-Criteria Strategic What-If Simulation Forecast",
        "CH. IV · RESULTS", 11, TOTAL
    )

    # Main Table on Left (x = 0.55", y = 1.64", w = 8.45", h = 4.22")
    tbl11_shp = s11.shapes.add_table(12, 5, Inches(0.55), Inches(1.64), Inches(8.45), Inches(4.22))
    tbl11 = tbl11_shp.table
    tbl11.columns[0].width = Inches(2.75)
    tbl11.columns[1].width = Inches(0.62)
    tbl11.columns[2].width = Inches(1.48)
    tbl11.columns[3].width = Inches(1.55)
    tbl11.columns[4].width = Inches(2.05)

    t9_data = [
        ("PACUCOA Evaluative Area", "Wt", "Baseline (Wt.Val)", "Simulated (+10)", "Post-Sim Floor Status"),
        ("I. Philosophy & Objectives", "3", "3.00  (9.00)", "3.00  (9.00)", "L1 Met · L2 (<3.50)"),
        ("II. Faculty", "3", "3.74  (11.22)", "3.74  (11.22)", "L1 & L2 Floors Met"),
        ("III. Instruction", "4", "3.00  (12.00)", "3.00  (12.00)", "L1 Met · L2 (<3.50)"),
        ("IV. Laboratory  [+2 Sim]", "3", "2.67  (8.01)", "3.40  (+0.73)", "L1 Cleared · L2 (<3.50)"),
        ("V. Research  [+3 Sim]", "3", "2.82  (8.46)", "3.62  (+0.80)", "L1 & L2 Floors Cleared"),
        ("VI. Library", "3", "3.45  (10.35)", "3.45  (10.35)", "L1 Met · L2 (<3.50)"),
        ("VII. Student Services  [+5 Sim]", "3", "1.30  (3.90)", "3.30  (+2.00)", "L1 Cleared · L2 (<3.50)"),
        ("VIII. Social Orientation", "3", "4.38  (13.14)", "4.38  (13.14)", "L1 & L2 Floors Met"),
        ("IX. Physical Plant & Facilities", "2", "5.00  (10.00)", "5.00  (10.00)", "L1 & L2 Floors Met"),
        ("X. Organization & Admin.", "3", "3.50  (10.50)", "3.50  (10.50)", "L1 & L2 Floors Met"),
        ("OVERALL PROGRAM RATING", "30", "3.22  (96.58/30)", "3.57  (107.16/30)", "All L1 Cleared · 5 Areas <3.50"),
    ]
    for r_i, row in enumerate(t9_data):
        for c_i, val in enumerate(row):
            al = PP_ALIGN.LEFT if c_i in (0, 4) else PP_ALIGN.CENTER
            if r_i == 0:
                style_cell(tbl11.cell(r_i, c_i), val, 8.8, True, WHITE, NAVY, al, margin_lr=0.04, margin_tb=0.02)
            elif r_i == 11:
                style_cell(tbl11.cell(r_i, c_i), val, 8.8, True, NAVY, GOLD_SOFT, al, margin_lr=0.04, margin_tb=0.02)
            elif r_i in (4, 5, 7) and c_i == 2:
                style_cell(tbl11.cell(r_i, c_i), val, 8.6, True, RED_FG, RED_BG, al, margin_lr=0.04, margin_tb=0.02)
            elif r_i == 5 and c_i in (3, 4):
                style_cell(tbl11.cell(r_i, c_i), val, 8.5, True, GREEN_FG, GREEN_BG, al, margin_lr=0.04, margin_tb=0.02)
            elif r_i in (4, 7) and c_i in (3, 4):
                style_cell(tbl11.cell(r_i, c_i), val, 8.5, True, AMBER_FG, AMBER_BG, al, margin_lr=0.04, margin_tb=0.02)
            else:
                bg = SLATE_ALT if r_i % 2 == 0 else WHITE
                fg = AMBER_FG if (c_i == 4 and "<3.50" in val) else (GREEN_FG if c_i == 4 else SLATE_DARK)
                style_cell(tbl11.cell(r_i, c_i), val, 8.5, (c_i in (0, 4) and r_i in (4, 5, 7)), fg, bg, al,
                           margin_lr=0.04, margin_tb=0.02)

    # Right Analytical Synthesis Stack (x = 9.14", w = 3.64", y = 1.64" to 5.86")
    add_titled_card(
        s11, 9.14, 1.64, 3.64, 1.34,
        "1. BASELINE: 3.22 (INDICATIVE)",
        [[
            {"text": "Meets Candidate (>=3.00) but flags ", "size": 8.8, "color": SLATE_DARK, "space_after": 2},
            {"text": "Areas IV (2.67), V (2.82), & VII (1.30)", "size": 8.8, "bold": True, "color": RED_FG},
            {"text": " below 3.00 due to unuploaded files. Distinct from official Sept. 2026 PACUCOA Level I award.",
             "size": 8.8, "color": SLATE_DARK}
        ]],
        header_bg=NAVY, header_h=0.31
    )

    add_titled_card(
        s11, 9.14, 3.06, 3.64, 1.32,
        "2. WHAT-IF SIMULATION: 3.57 (+0.35)",
        [[
            {"text": "Completing ", "size": 8.8, "color": SLATE_DARK, "space_after": 2},
            {"text": "10 priority criteria at 4.00", "size": 8.8, "bold": True, "color": ROYAL},
            {"text": " (+2 in IV, +3 in V, +5 in VII) adds +10.58 weighted pts (96.58 -> 107.16 / 30 = 3.57), isolated from live records.",
             "size": 8.8, "color": SLATE_DARK}
        ]],
        header_bg=ROYAL, header_h=0.31
    )

    add_titled_card(
        s11, 9.14, 4.46, 3.64, 1.40,
        "3. DUAL-CONSTRAINT VERDICT",
        [[
            {"text": "All 10 Areas clear the 3.00 Level I floor", "size": 8.8, "bold": True, "color": GREEN_FG, "space_after": 2},
            {"text": " & 3.57 passes the 3.50 overall mark; however, ", "size": 8.8, "color": SLATE_DARK},
            {"text": "5 Areas (I, III, IV, VI, VII) remain < 3.50", "size": 8.8, "bold": True, "color": AMBER_FG},
            {"text": ", pinpointing exact 2030 Level II targets.", "size": 8.8, "color": SLATE_DARK}
        ]],
        header_bg=GOLD_DARK, header_h=0.31
    )

    # =========================================================================
    # SLIDE 12: RESULTS (2/2) - ISO/IEC 25010 EVALUATION (TABLE 10, N = 20)
    # =========================================================================
    s12 = add_clean_slide(
        prs,
        "Table 10 summarizes the ISO/IEC 25010 evaluation by 20 purposive respondents: 15 institutional users "
        "(grand mean 4.83, SD 0.37) and 5 external IT experts (grand mean 4.40, SD 0.53), yielding a combined "
        "grand mean of 4.72 (SD 0.46, Very Highly Acceptable). Security ranked highest in both groups (4.89 / 4.90), "
        "while IT experts rated Functional Suitability (4.10), Compatibility (4.10), and Reliability (4.20) as Agree."
    )
    add_slide_header(
        s12,
        "Empirical Results (2/2): ISO/IEC 25010 Quality Evaluation",
        "Comparative Software Quality Ratings Across Institutional Users (n = 15) & External IT Experts (n = 5) (Table 10)",
        "CH. IV · ISO 25010", 12, TOTAL
    )

    # Left Table (x = 0.55", y = 1.64", w = 8.20", h = 4.22")
    tbl12_shp = s12.shapes.add_table(10, 5, Inches(0.55), Inches(1.64), Inches(8.20), Inches(4.22))
    tbl12 = tbl12_shp.table
    tbl12.columns[0].width = Inches(2.55)
    tbl12.columns[1].width = Inches(1.18)
    tbl12.columns[2].width = Inches(1.22)
    tbl12.columns[3].width = Inches(1.30)
    tbl12.columns[4].width = Inches(1.95)

    t10_data = [
        ("ISO/IEC 25010 Characteristic", "Users (n=15)", "Experts (n=5)", "Combined (N=20)", "Combined Interpretation"),
        ("1. Functional Suitability", "4.84", "4.10*", "4.66", "Very Highly Acceptable"),
        ("2. Performance Efficiency", "4.78", "4.50", "4.71", "Very Highly Acceptable"),
        ("3. Compatibility", "4.80", "4.10*", "4.63", "Very Highly Acceptable"),
        ("4. Usability", "4.87", "4.30", "4.73", "Very Highly Acceptable"),
        ("5. Reliability", "4.82", "4.20*", "4.67", "Very Highly Acceptable"),
        ("6. Security (Highest Rated)", "4.89", "4.90", "4.89", "Very Highly Acceptable"),
        ("7. Maintainability", "4.77", "4.60", "4.73", "Very Highly Acceptable"),
        ("8. Portability", "4.85", "4.50", "4.76", "Very Highly Acceptable"),
        ("COMPOSITE GRAND MEAN", "4.83 (SD 0.37)", "4.40 (SD 0.53)", "4.72 (SD 0.46)", "Strongly Agree / VHA"),
    ]
    for r_i, row in enumerate(t10_data):
        for c_i, val in enumerate(row):
            al = PP_ALIGN.LEFT if c_i in (0, 4) else PP_ALIGN.CENTER
            if r_i == 0:
                style_cell(tbl12.cell(r_i, c_i), val, 8.8, True, WHITE, NAVY, al, margin_lr=0.04, margin_tb=0.03)
            elif r_i == 9:
                style_cell(tbl12.cell(r_i, c_i), val, 8.7, True, NAVY, GOLD_SOFT, al, margin_lr=0.04, margin_tb=0.03)
            elif r_i == 6:
                style_cell(tbl12.cell(r_i, c_i), val, 9.0, True, GREEN_FG, GREEN_BG, al, margin_lr=0.04, margin_tb=0.03)
            elif c_i == 2 and "*" in val:
                style_cell(tbl12.cell(r_i, c_i), val, 8.8, True, AMBER_FG, AMBER_BG, al, margin_lr=0.04, margin_tb=0.03)
            else:
                bg = SLATE_ALT if r_i % 2 == 0 else WHITE
                style_cell(tbl12.cell(r_i, c_i), val, 8.8, (c_i == 3), SLATE_DARK, bg, al, margin_lr=0.04, margin_tb=0.03)

    # Right Cards (x = 8.90", w = 3.88", y = 1.64" to 5.86")
    add_titled_card(
        s12, 8.90, 1.64, 3.88, 1.32,
        "PURPOSIVE RESPONDENTS (N = 20)",
        [
            [{"text": "• Institutional Users (n = 15): ", "size": 8.7, "bold": True, "color": NAVY, "space_after": 2},
             {"text": "1 QA Officer, 1 PhD Dean, 2 Program Heads (BSCS/BSIT), 11 CICT Faculty.", "size": 8.6, "color": SLATE_DARK}],
            [{"text": "• External IT Experts (n = 5): ", "size": 8.7, "bold": True, "color": ROYAL, "space_after": 0},
             {"text": "1 DIT, 1 Master's holder, 3 IT industry software/systems practitioners.", "size": 8.6, "color": SLATE_DARK}],
        ],
        header_bg=NAVY, header_h=0.31
    )

    add_titled_card(
        s12, 8.90, 3.04, 3.88, 1.28,
        "CONVERGENCE ON SECURITY (4.89 / 4.90)",
        [[
            {"text": "Both users (4.89) and external IT experts (4.90) ranked ", "size": 8.7, "color": SLATE_DARK, "space_after": 0},
            {"text": "Security #1", "size": 8.7, "bold": True, "color": GREEN_FG},
            {"text": ", endorsing PostgreSQL RLS policies, private storage signed URLs (300s), and self-verification blocking, alongside Maintainability (4.60 experts).",
             "size": 8.7, "color": SLATE_DARK},
        ]],
        header_bg=GREEN_FG, header_h=0.31
    )

    add_titled_card(
        s12, 8.90, 4.40, 3.88, 1.46,
        "*COHORT DIVERGENCE & SCALE NOTE",
        [
            [{"text": "• Scale: ", "size": 8.5, "bold": True, "color": NAVY, "space_after": 2},
             {"text": "4.21–5.00 Strongly Agree (VHA); 3.41–4.20 Agree (HA).", "size": 8.4, "color": SLATE_DARK}],
            [{"text": "• *Expert 'Agree' Ratings: ", "size": 8.5, "bold": True, "color": AMBER_FG, "space_after": 0},
             {"text": "Experts rated Functional Suitability (4.10), Compatibility (4.10), & Reliability (4.20) conservatively—highlighting automated SIS/LMS/HRIS API sync for wider deployment.",
              "size": 8.4, "color": SLATE_DARK}],
        ],
        header_bg=GOLD_DARK, header_h=0.31
    )

    # =========================================================================
    # SLIDE 13: SCOPE BOUNDARIES & METHODOLOGICAL TRANSPARENCY
    # =========================================================================
    s13 = add_clean_slide(
        prs,
        "To maintain complete scientific and regulatory rigor, Slide 13 explicitly summarizes the system's scope "
        "boundaries and design trade-offs documented in Chapter I and Chapter III—clarifying Step Two self-survey "
        "focus, dynamic criteria and R proxy counts, deterministic text-layer parsing, and evaluation considerations."
    )
    add_slide_header(
        s13,
        "Scope Boundaries & Methodological Transparency",
        "Explicit Architectural Trade-Offs and Study Delimitations Documented for Audit & Defense Rigor (Chapters I & III)",
        "CH. I & III · RIGOR", 13, TOTAL
    )

    rigor_cards = [
        ("1. PACUCOA Process Boundary", NAVY, "STEP TWO",
         [
             [{"text": "• Automates Step Two (Institutional Self-Survey) ", "size": 9.5, "bold": True, "color": NAVY, "space_after": 3},
              {"text": "and Revisit / Level II 4-column compliance tracking.", "size": 9.5, "color": SLATE_DARK}],
             [{"text": "• Out of Software Scope: ", "size": 9.5, "bold": True, "color": SLATE_DARK, "space_after": 3},
              {"text": "Step One (formal application), Step Three (accrediting team organization), on-site peer visit judgment, board-licensure eligibility track, and Level III/IV supplementary institutional criteria.",
               "size": 9.3, "color": SLATE_DARK}],
         ]),
        ("2. Dynamic Criteria & Proxy Count (R)", ROYAL, "CONFIGURABLE",
         [
             [{"text": "• Source of 79 Pilot Criteria: ", "size": 9.5, "bold": True, "color": ROYAL, "space_after": 3},
              {"text": "Script-seeded from the CICT BSCS Compliance Report as the working BSCS pilot configuration—not a rigid universal constant across programs.",
               "size": 9.3, "color": SLATE_DARK}],
             [{"text": "• Indicative Proxy Score: ", "size": 9.5, "bold": True, "color": SLATE_DARK, "space_after": 0},
              {"text": "Required count (R) is a QA-configurable completeness proxy; scores measure documentary readiness rather than replacing PACUCOA peer evaluators' qualitative ratings.",
               "size": 9.3, "color": SLATE_DARK}],
         ]),
        ("3. Deterministic Parsing & File Handling", DARK_NAVY, "DETERMINISTIC",
         [
             [{"text": "• Zero Black-Box ML in Scoring: ", "size": 9.5, "bold": True, "color": NAVY, "space_after": 3},
              {"text": "Uses deterministic piecewise equations and rule-based regex on PDF text layers with human-in-the-loop metadata confirmation.",
               "size": 9.3, "color": SLATE_DARK}],
             [{"text": "• Document Limitations: ", "size": 9.5, "bold": True, "color": SLATE_DARK, "space_after": 0},
              {"text": "Reads text-layer PDFs only (no OCR for scanned image-only PDFs yet) and replaces/adds files without multi-revision document version history.",
               "size": 9.3, "color": SLATE_DARK}],
         ]),
        ("4. Evaluation & Pilot Delimitations", GOLD_DARK, "TRANSPARENCY",
         [
             [{"text": "• Cohort Reporting (15:5): ", "size": 9.5, "bold": True, "color": GOLD_DARK, "space_after": 3},
              {"text": "Reports Users (M = 4.83, SD = 0.37) and External IT Experts (M = 4.40, SD = 0.53) separately alongside the 15:5 sample-weighted combined mean (4.72).",
               "size": 9.3, "color": SLATE_DARK}],
             [{"text": "• Familiarity & Rollout Scope: ", "size": 9.5, "bold": True, "color": SLATE_DARK, "space_after": 0},
              {"text": "Acknowledges potential familiarity bias among stakeholders consulted during requirements gathering; BSCS is populated while BSIT awaits phased rollout.",
               "size": 9.3, "color": SLATE_DARK}],
         ]),
    ]
    rw = 5.98
    rh = 2.02
    rgap_x = 0.27
    rgap_y = 0.18
    for idx, (rt, rc, rbadge, rbody) in enumerate(rigor_cards):
        col = idx % 2
        row = idx // 2
        rx = 0.55 + col * (rw + rgap_x)
        ry = 1.66 + row * (rh + rgap_y)
        add_titled_card(s13, rx, ry, rw, rh, rt, rbody, header_bg=rc, badge_text=rbadge,
                        badge_bg=GOLD if rc != GOLD_DARK else WHITE)

    # =========================================================================
    # SLIDE 14: CONCLUSIONS (CHAPTER V)
    # =========================================================================
    s14 = add_clean_slide(
        prs,
        "Chapter V draws five empirical conclusions directly aligned with our objectives: centralizing scattered "
        "exhibits, automating the 30-weight and dual-constraint floor checks, enforcing database-level separation "
        "of duties, enabling high-leverage 2030 resurvey planning via what-if simulation, and confirming high "
        "acceptability under ISO/IEC 25010 while noting integration priorities."
    )
    add_slide_header(
        s14,
        "Conclusions",
        "Five Empirical Conclusions Grounded in BSCS Pilot Verification and ISO/IEC 25010 Evaluation (Chapter V)",
        "CH. V · CONCLUSIONS", 14, TOTAL
    )

    conclusions = [
        ("01", "Centralized Criterion-Mapped Repository", NAVY,
         "Addressed scattered accreditation files across personal drives and folders by establishing a unified, cloud-hosted digital exhibit repository mapped across PACUCOA's ten Areas at STI West Negros University."),
        ("02", "Transparent Dual-Constraint Readiness Assessment", ROYAL,
         "Automating the 30-weight formula and Area floor rules prevented manual spreadsheet miscalculations and surfaced indicative digital gaps (3.22 baseline; Areas IV, V, VII < 3.00, distinct from official Sept. 2026 Level I status)."),
        ("03", "Database-Enforced Separation of Duties", NAVY,
         "Enforcing uploader_id != verifier_id via PostgreSQL RLS policies (QA Officer exempt) alongside a mandatory Preview Gate safeguarded self-survey evaluation integrity against unilateral self-verification."),
        ("04", "Data-Driven What-If Resource Prioritization", ROYAL,
         "Isolated simulation demonstrated that completing 10 high-leverage criteria raises BSCS from 3.22 to 3.57—clearing all 3.00 Level I Area floors while identifying the 5 Areas still below the 3.50 Level II floor for 2030 planning."),
        ("05", "Validated ISO/IEC 25010 Software Quality (M = 4.72)", GREEN_FG,
         "Evaluated as Very Highly Acceptable overall (Users 4.83, IT Experts 4.40), led by Security (4.89 / 4.90), while expert ratings (4.10) on Compatibility & Functional Suitability guide enterprise integration before wider rollout."),
    ]
    for idx, (num, c_title, c_col, c_body) in enumerate(conclusions):
        cy = 1.64 + idx * 0.85
        add_box(s14, 0.55, cy, 12.23, 0.78, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.08)
        num_box = add_box(s14, 0.55, cy, 0.72, 0.78, fill_rgb=c_col, border_rgb=c_col, rounded=False)
        add_text(s14, 0.55, cy, 0.72, 0.78,
                 [[{"text": num, "size": 14, "bold": True, "color": GOLD if c_col != GREEN_FG else WHITE,
                    "align": PP_ALIGN.CENTER, "space_after": 0}]],
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        add_text(
            s14, 1.36, cy + 0.04, 11.32, 0.70,
            [
                [{"text": c_title, "size": 10.2, "bold": True, "color": c_col, "space_after": 1}],
                [{"text": c_body, "size": 9.1, "color": SLATE_DARK, "space_after": 0}],
            ],
            anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.08
        )

    # =========================================================================
    # SLIDE 15: RECOMMENDATIONS (ALL 6 CHAPTER V RECOMMENDATIONS)
    # =========================================================================
    s15 = add_clean_slide(
        prs,
        "In light of our conclusions and the IT experts' constructive feedback, Chapter V presents six concrete "
        "recommendations covering phased deployment to BSIT, continuous semester-end uploads, SIS/LMS/HRIS API "
        "integration, OCR and NLP classification, multi-accreditor framework support, and document versioning with licensure tracking."
    )
    add_slide_header(
        s15,
        "Recommendations",
        "Six Actionable Institutional Policy & Software Engineering Recommendations (Chapter V)",
        "CH. V · FUTURE WORK", 15, TOTAL
    )

    recs = [
        ("REC 01", "Phased Institutional Deployment",
         "Adopt the platform in phases starting with the BSCS pilot and progressively populate BSIT and other CICT programs after addressing expert-noted technical limitations.",
         NAVY),
        ("REC 02", "Continuous Semester-End Policy",
         "Institutionalize term-end digital exhibit submission (syllabi, exams, committee minutes) in CICT to sustain year-round readiness ahead of the 2030 Level II resurvey.",
         ROYAL),
        ("REC 03", "Enterprise SIS / LMS / HRIS APIs",
         "Develop secure API connectors with STI WNU's Student Information, Learning Management, and HR systems to automate exhibit and faculty credential ingestion.",
         NAVY),
        ("REC 04", "OCR & NLP Document Intelligence",
         "Integrate Optical Character Recognition (OCR) for scanned image-only PDFs and NLP classifiers to assist semantic criteria-to-exhibit alignment.",
         ROYAL),
        ("REC 05", "Multi-Accreditor Framework Support",
         "Extend the configurable relational framework engine to support PAASCU, ALCUCOA, AACCUP, and ASEAN University Network-Quality Assurance (AUN-QA).",
         NAVY),
        ("REC 06", "Document Versioning & Licensure",
         "Incorporate multi-revision exhibit version control and model PACUCOA's separate board-examination-based licensure eligibility track.",
         GOLD_DARK),
    ]
    for idx, (rtag, rtitle, rbody, rhdr) in enumerate(recs):
        col = idx % 3
        row = idx // 3
        rx = 0.55 + col * (3.94 + 0.205)
        ry = 1.68 + row * (1.98 + 0.20)
        add_titled_card(
            s15, rx, ry, 3.94, 1.98,
            rtitle,
            [[{"text": rbody, "size": 9.8, "color": SLATE_DARK, "space_after": 0}]],
            header_bg=rhdr, badge_text=rtag, badge_bg=GOLD if rhdr != GOLD_DARK else WHITE
        )

    # =========================================================================
    # SLIDE 16: KEY REFERENCES & CLOSING DEFENSE BANNER
    # =========================================================================
    s16 = add_clean_slide(
        prs,
        "Slide 16 lists the key regulatory, methodological, security, and software quality references cited in the "
        "manuscript. Thank you very much—I am now ready for the panel's questions and live system demonstration."
    )
    add_slide_header(
        s16,
        "Key References",
        "Selected Regulatory, Methodological, Security, and Software Quality References (APA 7th Edition)",
        "REFERENCES & Q&A", 16, TOTAL
    )

    refs_left = [
        ("Aftab, M. U., et al. (2019). ", "Permission-based separation of duty in dynamic role-based access control model. Symmetry, 11(5), Article 669."),
        ("Commission on Higher Education. (2019). ", "Policies and guidelines on the grant of autonomous and deregulated status to private HEIs (CMO No. 12, s. 2019)."),
        ("Etikan, I., Musa, S. A., & Alkassim, R. S. (2016). ", "Comparison of convenience sampling and purposive sampling. American Journal of Theoretical and Applied Statistics, 5(1), 1–4."),
        ("Groll, S., Fuchs, L., & Pernul, G. (2025). ", "Separation of duty in information security. ACM Computing Surveys, 57(3), 1–38."),
        ("ISO & IEC. (2011 / 2023). ", "Systems and software engineering — SQuaRE — System and software quality models (ISO/IEC 25010)."),
    ]
    refs_right = [
        ("PACUCOA. (2023). ", "Manual of accreditation (Rev. ed., September 2023). Philippine Association of Colleges and Universities Commission on Accreditation."),
        ("Pardiñan, E. G., Bondad, R. M., & Mangubat, J. C. (2024). ", "Key informants' perception on records digitization and a web-based technology platform for accreditation of Philippine SUCs. Education and Information Technologies, 30, 11127–11150."),
        ("Richey, R. C., & Klein, J. D. (2007). ", "Design and development research: Methods, strategies, and issues. Lawrence Erlbaum Associates."),
        ("Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). ", "Role-based access control models. IEEE Computer, 29(2), 38–47."),
        ("Schwaber, K., & Sutherland, J. (2020). ", "The Scrum guide: The definitive guide to Scrum."),
    ]

    add_box(s16, 0.55, 1.64, 5.98, 4.10, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.03)
    add_box(s16, 6.80, 1.64, 5.98, 4.10, fill_rgb=SLATE_LIGHT, border_rgb=BORDER, rounded=True, radius=0.03)

    add_text(
        s16, 0.68, 1.72, 5.72, 3.94,
        [[{"text": a, "size": 9.1, "bold": True, "color": NAVY, "space_after": 6},
          {"text": b, "size": 9.0, "color": SLATE_DARK}] for a, b in refs_left],
        line_spacing=1.12
    )
    add_text(
        s16, 6.93, 1.72, 5.72, 3.94,
        [[{"text": a, "size": 9.1, "bold": True, "color": NAVY, "space_after": 6},
          {"text": b, "size": 9.0, "color": SLATE_DARK}] for a, b in refs_right],
        line_spacing=1.12
    )

    # Crest-Safe Closing Banner (x = 1.18", y = 5.86", w = 11.60", h = 0.54" -> bottom = 6.40")
    add_box(s16, 1.18, 5.86, 11.60, 0.54, fill_rgb=NAVY, border_rgb=GOLD, border_pt=1.5, rounded=True, radius=0.15)
    add_text(
        s16, 1.30, 5.88, 11.36, 0.50,
        [[
            {"text": "THANK YOU  ·  READY FOR PANEL QUESTIONS & LIVE SYSTEM DEMONSTRATION   ",
             "size": 10.5, "bold": True, "color": GOLD, "align": PP_ALIGN.CENTER, "space_after": 0},
            {"text": "|   Jose Marie Clyde B. Taburada (MIT Candidate, SUNN)",
             "size": 9.8, "bold": True, "color": WHITE},
        ]],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE
    )

    prs.save(output_path)
    print(f"[SUCCESS] Built 16-slide defense presentation -> '{output_path}'")


if __name__ == "__main__":
    build_presentation()
