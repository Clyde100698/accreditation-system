import os

p = r"C:\Users\Acer\.gemini\antigravity\brain\6c30c42e-9345-4f2e-a03d-954c4d7bd387\scratch\part4_part5_data.py"
with open(p, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Line 201 (index 200)
lines[200] = '        "\'Thank you, Panelist. Under official FAAP and PACUCOA accreditation policies, Level I formal accreditation carries a validity period of three (3) years, making the official expiration September 2029. In our CICT internal planning sessions, the committee structured their preparation milestones across a four-year horizon toward 2030 to synchronize with the university plan. However, as an accreditation system, regulatory accuracy is paramount. I acknowledge this clerical error, and I will revise \\"four (4) years (valid until September 2030)\\" to \\"three (3) years (valid until September 2029)\\" on pages 3, 4, and 90 of the manuscript.\'"\n'

with open(p, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Line 201 fixed!")

