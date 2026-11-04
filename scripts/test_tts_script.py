tts_script = """
Every few years, universities face a familiar crisis: Accreditation. Thousands of physical documents scattered across offices. Duplicate syllabi in unmanaged drives. Spreadsheets prone to calculation errors. And zero real-time visibility into whether a program actually qualifies.

What if accreditation was no longer an episodic scramble, but an automated, real-time institutional asset?

Introducing the Web-Based Accreditation Management and Readiness Assessment System for STI West Negros University.

How does the system work?

At the core is an automated scoring engine aligned natively with PACUCOA standards. 

How does the formula work?

At the criterion level, the system evaluates verified documents against required quotas. Zero documents yield a score of zero. Partial submissions score between one and two. Meeting the quota benchmarks at three point zero, and surplus documentation scales up to five.

Each area mean is multiplied by its PACUCOA weight, summing to thirty total weights. Instruction carries a weight of four, Physical Plant carries two, and the remaining eight areas carry three each.

Crucially, the Executive Dashboard enforces Dual-Constraint Floor Rules. A program can achieve an overall baseline of three point two two, but if Laboratory sits at two point six seven, Research at two point eight two, or Student Services at one point three zero, the system flags the bottleneck. Level One formal accreditation is blocked until every area clears the three point zero floor!

How does the collaborative workflow operate?

Faculty simply drag and drop a PDF into the Evidence Library. Server-side text parsing inspects the document, detects matching criteria, and validates the five-year window.

What if an uploader tries to approve their own document?

The system immediately triggers a database-level Self-Verification Block. Separation of duties is strictly enforced. Only designated Area Chairs can evaluate submissions, backed by a mandatory preview gate that requires document inspection before approval.

Now, the ultimate question: What if?

What if academic leaders want to know what it takes to upgrade their accreditation level without risking live data?

They launch the What-If Readiness Simulation Sandbox!

What if we resolve ten priority criteria in our deficit areas?

We select ten criteria across Laboratory, Research, and Student Services. Click run simulation!

Instantly, the projected rating leaps from three point two two to three point five seven. Every deficit area clears the floor, qualifying the program for Level Two readiness ahead of the twenty-thirty resurvey! Best of all, it runs in an isolated browser sandbox with zero mutation to live production records.

Finally, the Four-Column Post-Visit Compliance Matrix tracks recommendations, sub-numbered actions, and verified evidence links, fulfilling revisit deadlines thirty days prior to survey visits.

Evaluated under the international ISO twenty-five-zero-ten standard by fifteen institutional stakeholders, the system achieved an outstanding grand mean of four point eight three out of five, with security highest at four point eight nine.

From paper chaos to intelligent cloud governance. Continuous quality assurance, simplified.
"""

words = tts_script.strip().split()
print(f"Total Words: {len(words)}")
print(f"Duration at 130 wpm: {len(words)/130:.2f} mins ({int((len(words)/130)*60)} seconds)")
print(f"Duration at 135 wpm: {len(words)/135:.2f} mins ({int((len(words)/135)*60)} seconds)")
print(f"Duration at 140 wpm: {len(words)/140:.2f} mins ({int((len(words)/140)*60)} seconds)")
