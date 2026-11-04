import pptx

prs = pptx.Presentation('FINAL ORAL DEFENSE TEMPLATE.pptx')
print(f"Presentation Dimensions: {prs.slide_width.inches:.2f} x {prs.slide_height.inches:.2f} inches")

for i, slide in enumerate(prs.slides):
    print(f"\n--- Slide {i+1} ---")
    for s in slide.shapes:
        print(f"  Shape '{s.name}': left={s.left.inches:.2f}, top={s.top.inches:.2f}, w={s.width.inches:.2f}, h={s.height.inches:.2f}, is_ph={s.is_placeholder}")
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                print(f"    Text: '{p.text}'")
