import os
import pptx
from pptx import Presentation

pptx_path = "FINAL ORAL DEFENSE TEMPLATE.pptx"
prs = Presentation(pptx_path)

print(f"Total slides: {len(prs.slides)}")
print(f"Slide width: {prs.slide_width.inches} in, height: {prs.slide_height.inches} in")

for i, slide in enumerate(prs.slides):
    print(f"\n==================== SLIDE {i+1} ====================")
    slide_title = ""
    if slide.shapes.title and slide.shapes.title.text:
        slide_title = slide.shapes.title.text.strip()
    print(f"Title: {slide_title}")
    
    for s_idx, shape in enumerate(slide.shapes):
        if shape.has_text_frame:
            tf = shape.text_frame
            text_preview = tf.text.strip().replace('\n', ' // ')
            if text_preview:
                print(f"  Shape {s_idx} ({shape.name}): {text_preview[:150]}")
        elif shape.has_table:
            tbl = shape.table
            print(f"  Shape {s_idx} TABLE: {len(tbl.rows)} rows x {len(tbl.columns)} cols")
            for r_i, row in enumerate(tbl.rows):
                r_text = [c.text.strip().replace('\n', ' ') for c in row.cells]
                print(f"    R{r_i}: {r_text[:4]}")
