import io
import docx
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl

def docx_to_markdown(docx_path, md_path):
    doc = docx.Document(docx_path)
    md_lines = []
    
    for child in doc.element.body:
        if isinstance(child, CT_P):
            p = docx.text.paragraph.Paragraph(child, doc)
            raw_text = p.text
            text = raw_text.strip()
            if not text:
                continue

            # Cleanly format tab-aligned TOC / List of Tables / List of Figures lines without dots
            if "\t" in raw_text:
                left_part, right_part = raw_text.split("\t", 1)
                left_clean = " ".join(left_part.strip().split())
                right_clean = right_part.strip()
                # Preserve visual hierarchy indentation
                pf = p.paragraph_format
                first_ind = pf.first_line_indent.inches if pf.first_line_indent else 0.0
                left_ind = pf.left_indent.inches if pf.left_indent else 0.0
                eff_indent = max(0.0, left_ind + first_ind)
                indent_spaces = " " * int(round(eff_indent * 10))
                pad = max(2, 74 - len(indent_spaces) - len(left_clean) - len(right_clean))
                md_lines.append(f"{indent_spaces}{left_clean}{' ' * pad}{right_clean}")
                continue
            
            # Check styling or heading conventions
            if text.startswith("CHAPTER ") or text in [
                "INTRODUCTION", "RELATED LITERATURE AND PRIOR ARTS SEARCH",
                "MATERIALS AND METHODS", "PRESENTATION, ANALYSIS AND INTERPRETATION",
                "SUMMARY, CONCLUSION AND RECOMMENDATION",
                "APPROVAL SHEET", "ACKNOWLEDGEMENT", "DEDICATION", 
                "ABSTRACT", "TABLE OF CONTENTS", "LIST OF TABLES", 
                "LIST OF FIGURES", "REFERENCES", "APPENDICES"
            ]:
                md_lines.append(f"\n# {text}\n")
            elif p.runs and p.runs[0].bold and len(text) < 80 and not text.startswith("Table ") and text != "Page":
                md_lines.append(f"\n### {text}\n")
            elif text.startswith("Table ") or text.startswith("Figure "):
                md_lines.append(f"\n**{text}**\n")
            elif text.startswith("Note."):
                md_lines.append(f"*{text}*\n")
            else:
                md_lines.append(f"{text}\n")
                
        elif isinstance(child, CT_Tbl):
            tbl = docx.table.Table(child, doc)
            rows = tbl.rows
            if not rows:
                continue
            
            header_cells = [c.text.strip().replace("\n", " ") for c in rows[0].cells]
            md_lines.append("\n| " + " | ".join(header_cells) + " |")
            md_lines.append("| " + " | ".join(["---"] * len(header_cells)) + " |")
            
            for row in rows[1:]:
                cells = [c.text.strip().replace("\n", " ") for c in row.cells]
                md_lines.append("| " + " | ".join(cells) + " |")
            md_lines.append("\n")

    with io.open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"[SUCCESS] Converted {docx_path} to {md_path}")

if __name__ == "__main__":
    import os
    src = "CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL.docx"
    if os.path.exists("CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL_LATEST.docx"):
        src = "CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL_LATEST.docx"
    docx_to_markdown(src, "CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL.md")
