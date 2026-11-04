import pptx

prs = pptx.Presentation('FINAL ORAL DEFENSE TEMPLATE.pptx')

for idx, slide in enumerate(prs.slides):
    print(f"\n==================== SLIDE {idx+1} ====================")
    for s in slide.shapes:
        print(f"Shape: {s.name} | Type: {s.shape_type} | Placeholder: {s.is_placeholder}")
        if s.is_placeholder:
            print(f"  Placeholder format type: {s.placeholder_format.type}, idx: {s.placeholder_format.idx}")
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                print(f"  Paragraph: '{p.text}' | level={p.level}")
                for r in p.runs:
                    fn = r.font.name if r.font else None
                    fs = r.font.size.pt if r.font and r.font.size else None
                    b = r.font.bold if r.font else None
                    c = str(r.font.color.rgb) if r.font and r.font.color and hasattr(r.font.color, 'rgb') else None
                    print(f"    Run: '{r.text}' | font={fn}, sz={fs}, b={b}, c={c}")
