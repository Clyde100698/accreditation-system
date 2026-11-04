import os

p = r"C:\Users\Acer\.gemini\antigravity\brain\6c30c42e-9345-4f2e-a03d-954c4d7bd387\scratch\build_defense_simulator_docs.py"
with open(p, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace(
    'add_sub_heading(doc, "5.4 Master [NEEDS YOUR INPUT] Pre-Defense Preparation Checklist")',
    'add_sub_heading(doc, "5.4 Master Pre-Defense Action Checklist & Verified Spoken Answers")'
)

text = text.replace(
    'add_sub_heading(doc, "5.4 Master [NEEDS YOUR INPUT] Checklist Before the Defense")',
    'add_sub_heading(doc, "5.4 Master Pre-Defense Action Checklist & Verified Spoken Answers")'
)

text = text.replace(
    'lines.append("### 5.4 Master `[NEEDS YOUR INPUT]` Checklist Before the Defense")',
    'lines.append("### 5.4 Master Pre-Defense Action Checklist & Verified Spoken Answers")'
)

with open(p, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated build_defense_simulator_docs.py headings!")

