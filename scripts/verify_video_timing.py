with open('DEFENSE_VIDEO_RECORDING_PACKAGE.md', 'r', encoding='utf-8') as f:
    text = f.read()

import re
match = re.search(r'```text(.*?)```', text, re.DOTALL)
if match:
    tts = match.group(1).strip()
    words = tts.split()
    total = len(words)
    print(f"Total TTS Words: {total}")
    for wpm in [125, 128, 130]:
        sec = (total / wpm) * 60
        m = int(sec // 60)
        s = int(sec % 60)
        print(f"At {wpm} WPM: {m}m {s:02d}s ({sec:.1f}s) -> {'NOT LESS THAN 4 MIN (VALID!)' if sec >= 240 else 'UNDER 4 MIN'}")
else:
    print("Match failed")
