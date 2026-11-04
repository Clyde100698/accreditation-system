import pptx
from pptx import Presentation

prs = Presentation("FINAL ORAL DEFENSE TEMPLATE.pptx")

for idx, slide in enumerate(prs.slides):
    print(f"Slide {idx+1}: {len(slide.shapes)} shapes")
    for s in slide.shapes:
        if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
            print(f"  Picture: {s.name}")
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                for r in p.runs:
                    color = r.font.color.rgb if r.font and r.font.color and r.font.color.type == pptx.enum.dml.MSO_COLOR_TYPE.RGB else None
                    print(f"    Run: '{r.text[:30]}' color={color} bold={r.font.bold}")

print("\nSlide Masters:")
for sm in prs.slide_masters:
    print(f"Master: {sm}")
    for s in sm.shapes:
        print(f"  Master Shape: {s.name}, {s.shape_type}")
        if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
            print(f"    Master Picture: {s.name}")
