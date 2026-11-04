import pptx
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

prs = Presentation("FINAL ORAL DEFENSE TEMPLATE.pptx")

for idx, slide in enumerate(prs.slides):
    print(f"\n--- Slide {idx+1} ---")
    print(f"Layout name: {slide.slide_layout.name}")
    for s in slide.shapes:
        print(f"  Shape: {s.name}, Type: {s.shape_type}, Left: {s.left.inches:.2f}, Top: {s.top.inches:.2f}, Width: {s.width.inches:.2f}, Height: {s.height.inches:.2f}")
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                font_name = p.font.name if p.font else None
                font_size = p.font.size.pt if p.font and p.font.size else None
                print(f"    P: '{p.text[:60]}' (font={font_name}, size={font_size})")
