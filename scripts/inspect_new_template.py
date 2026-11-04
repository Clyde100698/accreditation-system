import pptx

prs = pptx.Presentation('FINAL ORAL DEFENSE TEMPLATE (2).pptx')
print(f"Presentation Slide Width: {prs.slide_width.inches} in, Height: {prs.slide_height.inches} in")
print(f"Total slides: {len(prs.slides)}\n")

for idx, slide in enumerate(prs.slides):
    title = "No Title"
    if slide.shapes.title and slide.shapes.title.text:
        title = slide.shapes.title.text.strip().replace('\n', ' ')
    print(f"==================================================")
    print(f"SLIDE {idx+1}: {title} (Layout: {slide.slide_layout.name})")
    print(f"==================================================")
    for s_idx, shape in enumerate(slide.shapes):
        print(f"  Shape {s_idx+1}: '{shape.name}' (Type: {shape.shape_type})")
        print(f"    Left: {shape.left.inches:.2f} in, Top: {shape.top.inches:.2f} in, Width: {shape.width.inches:.2f} in, Height: {shape.height.inches:.2f} in")
        if shape.has_text_frame:
            tf = shape.text_frame
            for p_idx, p in enumerate(tf.paragraphs):
                p_text = p.text.strip()
                if p_text:
                    runs_info = []
                    for r in p.runs:
                        font_name = r.font.name if r.font else None
                        font_size = r.font.size.pt if r.font and r.font.size else None
                        bold = r.font.bold if r.font else None
                        color = r.font.color.rgb if r.font and r.font.color and hasattr(r.font.color, 'rgb') else None
                        runs_info.append(f"{r.text[:30]} (font={font_name}, sz={font_size}, b={bold}, c={color})")
                    print(f"    P{p_idx+1}: {p_text}")
                    print(f"       Runs: {runs_info}")
        if shape.has_table:
            table = shape.table
            print(f"    Table: {len(table.rows)} rows x {len(table.columns)} cols")
            for r_idx, row in enumerate(table.rows):
                row_txt = [c.text.strip().replace('\n', ' ') for c in row.cells]
                print(f"      Row {r_idx+1}: {row_txt}")
        if shape.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
            print(f"    Image: {shape.image.filename if hasattr(shape.image, 'filename') else 'picture'} ({shape.image.content_type})")
    print()
