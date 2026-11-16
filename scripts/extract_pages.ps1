$w = New-Object -ComObject Word.Application
$w.Visible = $false
$docPath = (Resolve-Path 'CAPSTONE_BOOK_FINAL.docx').Path
$d = $w.Documents.Open($docPath)

$headings = @(
    'CHAPTER I: INTRODUCTION',
    'Background of the Study',
    'Background of the Institution',
    'The Developed System',
    'Objective of the Study',
    'General Objective',
    'Specifically, the study sought to:',
    'Conceptual Framework',
    'Narrative of the Conceptual Framework',
    'Significance of the Study',
    'Scope and Limitation of the Study',
    'Scope of the Study',
    'Limitations of the Study',
    'Definition of Terms',
    'CHAPTER II: RELATED LITERATURE AND PRIOR ARTS SEARCH',
    'Review of Related Literature',
    'Accreditation and Quality Assurance in Philippine Higher Education',
    'Digital Evidence Management and Continuous Readiness',
    'Decision Support and What-If Analysis in Education',
    'Access Control and Separation of Duties',
    'Software Quality Evaluation',
    'Accreditation and Quality Assurance Information Systems in Southeast Asia',
    'Prior Arts Search',
    'Scope of the Search',
    'Existing Systems',
    'Comparative Analysis',
    'Synthesis and Research Gap',
    'CHAPTER III: MATERIALS AND METHODS',
    'System Design',
    'Requirements Gathering',
    'Development Methodology',
    'System Architecture',
    'Hardware and Software Requirements',
    'Machine Learning and Artificial Intelligence Specifications',
    'Users, Roles, and Access Control',
    'Process Modeling',
    'Data Design',
    'System Process Flow',
    'Functional Modules',
    'Illustration of the Scoring Mechanics',
    'Research Design',
    'Locale of the Study',
    'Respondents of the Study (with sampling technique)',
    'Data Gathering Procedure',
    'Data Analysis',
    'Evaluation Instrument',
    'Statistical Treatment',
    'Ethical Considerations',
    'Declaration of the Use of AI',
    'CHAPTER IV: PRESENTATION, ANALYSIS AND INTERPRETATION',
    'Evidence Management and Mapping Implementation',
    'Readiness Scoring Engine, Executive 5x2 Command Dashboard, and Heatmap Visualization',
    'Executive 5x2 Command Dashboard and Heatmap Visualization',
    'Baseline Assessment of the BSCS Program',
    'Dual-Constraint Threshold Analysis',
    'Relationship to the Official Accreditation Status',
    'What-If Readiness Simulation Module and Optimization Analysis',
    'What-If Readiness Simulation Sandbox',
    'Simulation Analysis and Readiness Optimization',
    'Four-Column Post-Visit Compliance Tracking Matrix',
    'Role-Based Access Control and Independent Verification (Self-Verification Block)',
    'Software Quality Evaluation (ISO/IEC 25010)',
    'Respondent Profile',
    'Evaluation Results Across Quality Characteristics',
    'Interpretation and Qualitative Synthesis',
    'CHAPTER V: SUMMARY, CONCLUSION AND RECOMMENDATION',
    'Summary of Findings',
    'Conclusion',
    'Recommendation',
    'REFERENCES',
    'APPENDICES',
    'Appendix A. CURRICULUM VITAE',
    'Appendix B. CERTIFICATE OF PLAGIARISM',
    'Appendix C. CERTIFICATE OF UTILIZATION',
    "Appendix D. USER'S MANUAL"
)

$tocPages = @{}
$tablePages = @{}
$figPages = @{}

for ($s = 2; $s -le $d.Sections.Count; $s++) {
    $sec = $d.Sections.Item($s)
    foreach ($p in $sec.Range.Paragraphs) {
        $t = $p.Range.Text.Trim()
        foreach ($h in $headings) {
            if (-not $tocPages.ContainsKey($h) -and $t -eq $h) {
                $tocPages[$h] = $p.Range.Information(1).ToString()
            }
        }
        if ($t -match '^Table\s+(\d+)') {
            $tKey = 'Table ' + $matches[1]
            if (-not $tablePages.ContainsKey($tKey)) {
                $tablePages[$tKey] = $p.Range.Information(1).ToString()
            }
        }
        if ($t -match '^Figure\s+(\d+)') {
            $fKey = 'Figure ' + $matches[1]
            if (-not $figPages.ContainsKey($fKey)) {
                $figPages[$fKey] = $p.Range.Information(1).ToString()
            }
        }
    }
}

$out = @{
    toc_pages = $tocPages
    table_pages = $tablePages
    figure_pages = $figPages
}

$out | ConvertTo-Json -Depth 5 | Out-File -FilePath 'exact_pages.json' -Encoding utf8
Write-Host 'Exported exact_pages.json successfully!'

$d.Close([Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges)
try { $w.Quit() } catch {}
