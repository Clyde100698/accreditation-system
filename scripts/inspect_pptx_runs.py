import pptx
from pptx import Presentation
from pptx.dml.color import RGBColor

prs = Presentation("FINAL ORAL DEFENSE TEMPLATE.pptx")

for i in [0, 1, 5]:
    slide = prs.slides[i]
    print(f"\n--- SLIDE {i+1} FORMATTING ---")
    for s in slide.shapes:
        if s.has_text_frame:
            for p_idx, p in enumerate(s.text_frame.paragraphs):
                font_name = p.font.name if p.font else None
                font_size = p.font.size.pt if p.font and p.font.size else None
                bold = p.font.bold if p.font else None
                align = p.alignment
                print(f"  Shape '{s.name}' P{p_idx}: align={align}, text='{p.text[:40]}'")
                for r in p.runs:
                    r_font = r.font.name
                    r_size = r.font.size.pt if r.font.size else None
                    r_bold = r.font.bold
                    r_color = r.font.color.rgb if r.font.color and hasattr(r.font.color, 'rgb') else None
                    print(f"    Run: '{r.text[:30]}' font={r_font}, size={r_size}, bold={r_bold}, color={r_color}")
