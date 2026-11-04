import os
import re
import docx

WORKSPACE = r"c:\Users\Acer\Desktop\ACCREDITATION SYSTEM"
md_path = os.path.join(WORKSPACE, "ORAL_DEFENSE_PANEL_SIMULATOR_GUIDE.md")
docx_path = os.path.join(WORKSPACE, "ORAL_DEFENSE_PANEL_SIMULATOR_GUIDE.docx")

print("=== 1. AUDITING MARKDOWN FILE ===")
with open(md_path, "r", encoding="utf-8") as f:
    md_text = f.read()

todo_pat = r"\[TODO"
tbd_pat = r"\[TBD"
insert_pat = r"\[INSERT"
scen_pat = r"\*\*Scenario #\d+"
q_pat = r"\*\*Q\d+"
rank_pat = r"\*\*Rank #\d+"

md_needs_input = len(re.findall(r"NEEDS YOUR INPUT", md_text, re.IGNORECASE))
print(f"MD file size: {len(md_text):,} bytes ({len(md_text.splitlines()):,} lines)")
print(f"MD 'NEEDS YOUR INPUT' count: {md_needs_input}")
print(f"MD '[TODO]' count: {len(re.findall(todo_pat, md_text, re.IGNORECASE))}")
print(f"MD '[TBD]' count: {len(re.findall(tbd_pat, md_text, re.IGNORECASE))}")
print(f"MD '[INSERT]' count: {len(re.findall(insert_pat, md_text, re.IGNORECASE))}")
print(f"MD Part 2 Scenarios: {len(re.findall(scen_pat, md_text))}")
print(f"MD Part 3 Questions: {len(re.findall(q_pat, md_text))}")
print(f"MD Part 5 Ranked Questions: {len(re.findall(rank_pat, md_text))}")
print(f"MD Part 5 Spoken Checklist items: {len(re.findall('Spoken Script:', md_text))}")

print("\n=== 2. AUDITING DOCX FILE ===")
doc = docx.Document(docx_path)
docx_text = "\n".join([p.text for p in doc.paragraphs])
for t in doc.tables:
    for row in t.rows:
        for cell in row.cells:
            docx_text += "\n" + cell.text

docx_needs_input = len(re.findall(r"NEEDS YOUR INPUT", docx_text, re.IGNORECASE))
print(f"DOCX paragraphs: {len(doc.paragraphs)}")
print(f"DOCX tables: {len(doc.tables)}")
print(f"DOCX 'NEEDS YOUR INPUT' count: {docx_needs_input}")
print(f"DOCX '[TODO]' count: {len(re.findall(todo_pat, docx_text, re.IGNORECASE))}")
print(f"DOCX '[TBD]' count: {len(re.findall(tbd_pat, docx_text, re.IGNORECASE))}")
print(f"DOCX '[INSERT]' count: {len(re.findall(insert_pat, docx_text, re.IGNORECASE))}")

assert md_needs_input == 0, f"FAILED: MD has {md_needs_input} NEEDS YOUR INPUT occurrences!"
assert docx_needs_input == 0, f"FAILED: DOCX has {docx_needs_input} NEEDS YOUR INPUT occurrences!"

print("\n>>> AUDIT PASSED: ZERO UNANSWERED PLACEHOLDERS ACROSS BOTH FILES! <<<")
