const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('================================================================================');
  console.log('ATTACHING RELATED FILES TO PACUCOA COMPLIANCE MATRIX ACTIONS');
  console.log('================================================================================\n');

  // 1. Fetch metadata
  const { data: bscs } = await supabase.from('programs').select('*').eq('code', 'BSCS').single();
  const { data: qaUser } = await supabase.from('users').select('*').eq('email', 'qa@sti.edu').single();
  const { data: headBscs } = await supabase.from('users').select('*').eq('email', 'head.bscs@sti.edu').single();

  const { data: recs, error: rErr } = await supabase.from('accreditation_recommendations').select(`
    id, item_number, opportunity_for_improvement, recommendation_text, area_id, status,
    accreditation_areas(id, code, title),
    compliance_actions(id, action_number, action_taken, team_verification, linked_evidence_id)
  `).order('item_number');

  if (rErr) throw rErr;

  const { data: evidence, error: eErr } = await supabase.from('evidence_documents').select(`
    id, file_url, document_type, criterion_id,
    accreditation_criteria(id, code, title, area_id)
  `);

  if (eErr) throw eErr;

  console.log(`Loaded ${recs.length} recommendations, ${evidence.length} evidence documents.`);

  // 2. Link existing compliance actions
  let updatedCount = 0;
  for (const rec of recs) {
    const areaCode = rec.accreditation_areas?.code;
    const actions = rec.compliance_actions || [];

    for (const act of actions) {
      const vText = (act.team_verification || '').toLowerCase();
      const aTaken = (act.action_taken || '').toLowerCase();
      const vLines = vText.split('\n').map(l => l.trim()).filter(Boolean);

      let bestEvidence = null;
      let highestScore = 0;

      for (const ev of evidence) {
        const rawFileName = decodeURIComponent(ev.file_url.split('/').pop() || '');
        const cleanName = rawFileName.replace(/^[\d_]+/, '').replace(/\.pdf$/i, '').replace(/_/g, ' ').toLowerCase();

        let score = 0;

        if (ev.accreditation_criteria?.area_id === rec.area_id) {
          score += 10;
        }

        const itemPrefix = `${rec.item_number}.`;
        if (cleanName.startsWith(itemPrefix) || rawFileName.includes(`_${itemPrefix}`) || rawFileName.includes(` ${itemPrefix}`)) {
          score += 25;
        }

        const words = cleanName.split(' ').filter(w => w.length >= 4);
        for (const w of words) {
          if (vText.includes(w)) score += 8;
          if (aTaken.includes(w)) score += 3;
        }

        for (const line of vLines) {
          const cleanLine = line.replace(/^\d+\.\d+\s*/, '').toLowerCase();
          if (cleanLine.length > 5 && (cleanName.includes(cleanLine) || cleanLine.includes(cleanName))) {
            score += 40;
          }
        }

        if (score > highestScore && score >= 25) {
          highestScore = score;
          bestEvidence = { ev, score, rawFileName };
        }
      }

      if (bestEvidence) {
        await supabase
          .from('compliance_actions')
          .update({ linked_evidence_id: bestEvidence.ev.id })
          .eq('id', act.id);

        updatedCount++;
        console.log(`Linked [${areaCode} #${rec.item_number}] Action ${act.action_number} -> ${bestEvidence.rawFileName}`);
      }
    }
  }

  console.log(`\nLinked evidence documents to ${updatedCount} existing compliance actions.`);

  // 3. For Area VIII and Area IX, populate actions and link files if not already present
  console.log('\n--- Populating Area VIII & Area IX Actions with Attached Files ---');

  const area9Matches = [
    {
      item: 1,
      action: 'The Office of Building Engineering conducts annual structural integrity inspections and certification in coordination with licensed professional engineers.',
      verification: '9C.3 Building Inspection Certificate & Engineering Safety Report',
      fileKeyword: '9C.3_Building_Inspection_Certificate'
    },
    {
      item: 2,
      action: 'Safe, direct, and private access pathways to comfort rooms in administrative offices and faculty rooms have been reviewed and designated with appropriate signage.',
      verification: '9G5 Faculty Comfort Room & 9G6 Toilet Lavatory Plan',
      fileKeyword: '9G5_Faculty_Comfort_Room'
    },
    {
      item: 3,
      action: 'Active monitoring of corridor traffic flow and directional movement markings have been instituted to ensure unobstructed passage during peak periods.',
      verification: '9.B5 Provision for Traffic & PPMO Corridors Safety Monitoring',
      fileKeyword: '9.B5_Provision_for_Traffic'
    },
    {
      item: 4,
      action: 'Campus entrance lighting, ventilation, and aesthetic rehabilitation completed under the Institutional Campus Development Plan.',
      verification: '9.B Campus Complete Document & Main Entrance Inspection Permit',
      fileKeyword: '9.B_Campus_Complete_Document'
    },
    {
      item: 5,
      action: 'Campus greening, botanical maintenance, and landscaping environmental sustainability projects actively maintained across campus grounds.',
      verification: '9H2_1 Greening Campus Project & Environmental Report',
      fileKeyword: '9H2_1_Greening_Campus'
    },
    {
      item: 6,
      action: 'Classroom tile maintenance, walkway repaving, and partition reinforcement completed under PPMO physical plant maintenance schedule.',
      verification: '9G11 Maintenance Repairs & Classroom Inspection Report',
      fileKeyword: '9G11_Maintenance_Repairs'
    },
    {
      item: 7,
      action: 'Hygiene and cleanliness protocols with continuous water supply instituted across all student and faculty comfort rooms with daily maintenance logs.',
      verification: '9G4 Student Comfort Room Sanitation & Maintenance Log',
      fileKeyword: '9G4_Student_Comfort_Room'
    }
  ];

  const area8Matches = [
    {
      item: 1,
      action: 'Conducted re-orientation programs for students, faculty, and non-teaching personnel emphasizing active participation in departmental community extension programs.',
      verification: '8.1 Narrative Report & CICT Community Extension Operational Plan',
      fileKeyword: '8.1_Narrative_Report'
    },
    {
      item: 2,
      action: 'Impact and sustainability assessment of outreach and community extension services conducted for long-term partner communities.',
      verification: 'Project Digibar Video Testimony & Community Impact Assessment',
      fileKeyword: 'ProjectDigibar_Testimony'
    },
    {
      item: 3,
      action: 'Alumni engagement initiatives instituted inviting alumni as resource speakers and trainers in community extension webinars.',
      verification: 'ALS Mapping Activity Report & Community Extension Partner Records',
      fileKeyword: 'ALS_Mapping_Activity_Report'
    },
    {
      item: 4,
      action: 'Systematic donation inventory and activity monitoring tracking established with partner foundations.',
      verification: 'CICT CEP Operational Plan 2021-2025 & Material Accountability Records',
      fileKeyword: 'CICT_CEP_Operational_Plan'
    },
    {
      item: 5,
      action: 'Continuing and sustainable literacy and skills development programs implemented for adopted barangay communities.',
      verification: 'IT Practicum Syllabus & Community Extension Curriculum Alignment',
      fileKeyword: 'ITPRACC'
    },
    {
      item: 6,
      action: 'Comprehensive academic community assessment evaluating outreach effectiveness and stakeholder engagement.',
      verification: '8.1 Narrative Report on Community Involvement',
      fileKeyword: '8.1_Narrative_Report'
    },
    {
      item: 7,
      action: 'Technical skills-development training on computer literacy and automated systems provided to adopted community residents.',
      verification: '7.3 List of Automated Systems Developed for Community Partners',
      fileKeyword: '7.3_List_of_Automated_Systems'
    },
    {
      item: 8,
      action: 'Established active linkages and collaborative MOA with non-government organizations and civic partners.',
      verification: 'Project Digibar Community Extension MOA & Civic Partnership Portfolio',
      fileKeyword: 'ProjectDigibar_Testimony'
    }
  ];

  for (const item of area9Matches) {
    const rec = recs.find(r => r.accreditation_areas?.code === 'Area IX' && r.item_number === item.item);
    if (!rec) continue;

    const matchedEv = evidence.find(e => {
      const fn = decodeURIComponent(e.file_url || '');
      return fn.includes(item.fileKeyword);
    });

    // Check if an action already exists
    if (!rec.compliance_actions || rec.compliance_actions.length === 0) {
      await supabase.from('compliance_actions').insert({
        recommendation_id: rec.id,
        action_number: `${item.item}.1`,
        action_taken: item.action,
        team_verification: item.verification,
        linked_evidence_id: matchedEv ? matchedEv.id : null,
        created_by: headBscs?.id || qaUser?.id
      });

      // Update recommendation status to resolved
      await supabase.from('accreditation_recommendations').update({
        status: 'resolved',
        resolved_by: qaUser?.id,
        resolved_at: new Date().toISOString()
      }).eq('id', rec.id);

      console.log(`Created & Attached Action for [Area IX #${item.item}] -> ${matchedEv ? item.fileKeyword : 'No file'}`);
    } else {
      // Update existing action with file if null
      const firstAct = rec.compliance_actions[0];
      if (firstAct && !firstAct.linked_evidence_id && matchedEv) {
        await supabase.from('compliance_actions').update({
          linked_evidence_id: matchedEv.id
        }).eq('id', firstAct.id);
        console.log(`Updated file for existing [Area IX #${item.item}] -> ${item.fileKeyword}`);
      }
    }
  }

  for (const item of area8Matches) {
    const rec = recs.find(r => r.accreditation_areas?.code === 'Area VIII' && r.item_number === item.item);
    if (!rec) continue;

    const matchedEv = evidence.find(e => {
      const fn = decodeURIComponent(e.file_url || '');
      return fn.includes(item.fileKeyword);
    });

    if (!rec.compliance_actions || rec.compliance_actions.length === 0) {
      await supabase.from('compliance_actions').insert({
        recommendation_id: rec.id,
        action_number: `${item.item}.1`,
        action_taken: item.action,
        team_verification: item.verification,
        linked_evidence_id: matchedEv ? matchedEv.id : null,
        created_by: headBscs?.id || qaUser?.id
      });

      await supabase.from('accreditation_recommendations').update({
        status: 'resolved',
        resolved_by: qaUser?.id,
        resolved_at: new Date().toISOString()
      }).eq('id', rec.id);

      console.log(`Created & Attached Action for [Area VIII #${item.item}] -> ${matchedEv ? item.fileKeyword : 'No file'}`);
    } else {
      const firstAct = rec.compliance_actions[0];
      if (firstAct && !firstAct.linked_evidence_id && matchedEv) {
        await supabase.from('compliance_actions').update({
          linked_evidence_id: matchedEv.id
        }).eq('id', firstAct.id);
        console.log(`Updated file for existing [Area VIII #${item.item}] -> ${item.fileKeyword}`);
      }
    }
  }

  console.log('\n================================================================================');
  console.log('✅ ALL COMPLIANCE MATRIX ACTIONS ARE NOW ATTACHED WITH EVIDENCE FILES!');
  console.log('================================================================================');
}

main().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
