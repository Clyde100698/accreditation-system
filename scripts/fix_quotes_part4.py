import os

p = r"C:\Users\Acer\.gemini\antigravity\brain\6c30c42e-9345-4f2e-a03d-954c4d7bd387\scratch\part4_part5_data.py"
with open(p, "r", encoding="utf-8") as f:
    text = f.read()

# Fix unescaped double quotes on M-01 (line 67)
text = text.replace(
    'to read "three (3) years (valid until September 2029)".\'"',
    'to read \\"three (3) years (valid until September 2029)\\".\'"'
)

# Fix unescaped double quotes on Rank #9 (line 201)
text = text.replace(
    'to revise "four (4) years (valid until September 2030)" to "three (3) years (valid until September 2029)" on pages 3, 4, and 90 of the manuscript.\'"',
    'to revise \\"four (4) years (valid until September 2030)\\" to \\"three (3) years (valid until September 2029)\\" on pages 3, 4, and 90 of the manuscript.\'"'
)

with open(p, "w", encoding="utf-8") as f:
    f.write(text)

print("Fixed quotes in part4_part5_data.py!")

