import sys

# Generate a clean, standards-compliant single-page PDF with selectable text
def create_pdf(filename, title, recipient, date_str, validity_note, is_expired):
    # PDF Stream content
    # Coordinate system: (0,0) at bottom-left, page is 612 x 792 (Letter)
    
    status_label = "EXPIRED - OUTSIDE 5-YEAR PACUCOA RECENCY WINDOW" if is_expired else "VALID - WITHIN 5-YEAR PACUCOA RECENCY WINDOW"
    
    stream_content = f"""BT
/F1 20 Tf
50 720 Td
(STI WEST NEGROS UNIVERSITY) Tj
/F2 13 Tf
0 -26 Td
(College of Information and Communications Technology) Tj
/F1 16 Tf
0 -45 Td
({title}) Tj
/F2 11 Tf
0 -30 Td
(This certifies that:) Tj
/F1 14 Tf
0 -24 Td
({recipient}) Tj
/F2 11 Tf
0 -25 Td
(has successfully completed the specialized advanced training seminar on:) Tj
/F1 12 Tf
0 -20 Td
(Curriculum Development and Outcome-Based Quality Assessment) Tj
/F2 11 Tf
0 -35 Td
(Date of Completion and Issuance: {date_str}) Tj
0 -25 Td
(Accreditation Compliance Status: {status_label}) Tj
0 -25 Td
(Regulatory Note: {validity_note}) Tj
0 -45 Td
(Certified by: Office of the Academic Dean, CICT) Tj
0 -20 Td
(Document Tracking ID: STI-CICT-EXHIBIT-{date_str.replace(' ', '-').replace(',', '')}) Tj
ET"""

    stream_bytes = stream_content.encode('utf-8')
    stream_len = len(stream_bytes)

    pdf_structure = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length {stream_len} >>
stream
{stream_content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000256 00000 n 
0000000000 00000 n 
0000000000 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
500
%%EOF"""

    # We will write standard valid PDF binary
    with open(filename, 'wb') as f:
        # Simple valid header
        f.write(b"%PDF-1.4\n")
        
        offsets = []
        
        # Obj 1: Catalog
        offsets.append(f.tell())
        f.write(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
        
        # Obj 2: Pages
        offsets.append(f.tell())
        f.write(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
        
        # Obj 3: Page
        offsets.append(f.tell())
        f.write(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n")
        
        # Obj 4: Stream
        offsets.append(f.tell())
        f.write(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode('utf-8'))
        f.write(stream_bytes)
        f.write(b"\nendstream\nendobj\n")
        
        # Obj 5: Font F1 (Bold)
        offsets.append(f.tell())
        f.write(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
        
        # Obj 6: Font F2 (Regular)
        offsets.append(f.tell())
        f.write(b"6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
        
        # XRef
        xref_offset = f.tell()
        f.write(b"xref\n0 7\n0000000000 65535 f \n")
        for off in offsets:
            f.write(f"{off:010d} 00000 n \n".encode('utf-8'))
            
        f.write(b"trailer\n<< /Size 7 /Root 1 0 R >>\n")
        f.write(f"startxref\n{xref_offset}\n%%EOF\n".encode('utf-8'))

    print(f"Generated PDF: {filename}")

if __name__ == "__main__":
    # 1. Expired PDF (Dated August 15, 2017) -> 9 years old!
    create_pdf(
        filename="TEST_EXPIRED_EVIDENCE_2017.pdf",
        title="CERTIFICATE OF PARTICIPATION & TRAINING",
        recipient="Prof. Sarah Jenkins",
        date_str="August 15, 2017",
        validity_note="Recorded in SY 2017-2018 (Exceeds the 5-Year PACUCOA Validity Window)",
        is_expired=True
    )
    
    # 2. Valid PDF (Dated October 14, 2025) -> Current!
    create_pdf(
        filename="TEST_VALID_EVIDENCE_2025.pdf",
        title="CERTIFICATE OF PARTICIPATION & TRAINING",
        recipient="Prof. Sarah Jenkins",
        date_str="October 14, 2025",
        validity_note="Recorded in SY 2025-2026 (Valid within PACUCOA 5-Year Recency Window)",
        is_expired=False
    )

