import re

def check_file(path):
    print("========================================")
    print("Checking:", path)
    print("========================================")
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    for idx, line in enumerate(lines):
        # Find anything like [something]
        matches = re.findall(r"\[([^\]\n]+)\]", line)
        for m in matches:
            # Skip python list definitions like ['a', 'b']
            if m.startswith("'") or m.startswith('"'):
                continue
            # Skip markdown links like [text](url)
            if "](" in line:
                continue
            # Skip pure numbers like [1]
            if m.isdigit():
                continue
            print(f"Line {idx+1}: [{m}]")

check_file("scripts/book_chapters_1_to_3.py")
check_file("scripts/book_chapters_4_to_end.py")
check_file("CAPSTONE_BOOK_CHAPTERS_I_TO_V_FINAL.md")
