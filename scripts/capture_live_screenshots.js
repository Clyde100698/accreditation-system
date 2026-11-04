const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const PROFILE_DIR = 'C:\\Users\\Acer\\AppData\\Local\\Temp\\chrome_capture_profile';
const OUT_DIR = path.resolve(__dirname, '../figures');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanupUI(sendCDP) {
  await sendCDP('Runtime.evaluate', {
    expression: `
      (() => {
        if (!document.getElementById('anti-dev-overlay-style')) {
          const style = document.createElement('style');
          style.id = 'anti-dev-overlay-style';
          style.textContent = \`
            nextjs-portal,
            [data-nextjs-toast],
            #nextjs-dev-overlay,
            [data-nextjs-dialog-overlay],
            [data-nextjs-dialog],
            [role="alert"],
            [class*="toast"],
            div.fixed.bottom-4.left-4,
            div.fixed.bottom-5.left-5 {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          \`;
          document.head.appendChild(style);
        }
        document.querySelectorAll('nextjs-portal, [data-nextjs-toast], #nextjs-dev-overlay, [data-nextjs-dialog]').forEach(el => el.remove());
      })()
    `
  });
}

const PAGES_TO_CAPTURE = [
  {
    name: 'figure16_executive_dashboard.png',
    url: 'http://localhost:3000/dashboard',
    title: 'Figure 16: Executive 5x2 Command Dashboard',
    waitMs: 4500,
    beforeCapture: async (sendCDP) => {
      await cleanupUI(sendCDP);
      await sleep(1500);
      await cleanupUI(sendCDP);
    }
  },
  {
    name: 'figure17_evidence_management.png',
    url: 'http://localhost:3000/evidence',
    title: 'Figure 17: Evidence Management Repository',
    waitMs: 5000,
    beforeCapture: async (sendCDP) => {
      await cleanupUI(sendCDP);
      await sleep(1500);
      // Click Expand All to show folder contents with documents
      await sendCDP('Runtime.evaluate', {
        expression: `
          (() => {
            const expBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Expand All'));
            if (expBtn) expBtn.click();
          })()
        `
      });
      await sleep(1500);
      await cleanupUI(sendCDP);
    }
  },
  {
    name: 'figure18_verification_queue.png',
    url: 'http://localhost:3000/verification',
    title: 'Figure 18: Verification Queue (Self-Verification Block)',
    waitMs: 4000,
    beforeCapture: async (sendCDP) => {
      await cleanupUI(sendCDP);
      await sleep(1000);
      await cleanupUI(sendCDP);
    }
  },
  {
    name: 'figure19_simulation_sandbox.png',
    url: 'http://localhost:3000/simulation',
    title: 'Figure 19: What-If Readiness Simulation Sandbox',
    waitMs: 4500,
    beforeCapture: async (sendCDP) => {
      await cleanupUI(sendCDP);
      // Select 3 criteria cards by clicking on the criteria items
      await sendCDP('Runtime.evaluate', {
        expression: `
          (() => {
            const items = Array.from(document.querySelectorAll('div.cursor-pointer')).filter(el => 
              el.textContent.includes('/5') || el.textContent.includes('Area')
            );
            for (let i = 0; i < Math.min(items.length, 3); i++) {
              items[i].click();
            }
          })()
        `
      });
      await sleep(1000);
      // Click Simulate Score Impact button
      await sendCDP('Runtime.evaluate', {
        expression: `
          (() => {
            const simBtn = Array.from(document.querySelectorAll('button')).find(b => 
              b.textContent.includes('Simulate Score Impact') || b.textContent.includes('Simulate')
            );
            if (simBtn) simBtn.click();
          })()
        `
      });
      await sleep(2000);
      await cleanupUI(sendCDP);
    }
  },
  {
    name: 'figure20_compliance_matrix.png',
    url: 'http://localhost:3000/recommendations',
    title: 'Figure 20: 4-Column Post-Visit Compliance Tracking Matrix',
    waitMs: 4500,
    beforeCapture: async (sendCDP) => {
      await cleanupUI(sendCDP);
      await sleep(1500);
      await cleanupUI(sendCDP);
    }
  }
];

async function run() {
  console.log('Starting headless Chrome on port', PORT);
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE_DIR}`,
    '--window-size=1600,1050',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions'
  ]);

  await sleep(2000);

  // Create clean page target directly on login
  const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/login`, { method: 'PUT' });
  const pageTarget = await targetRes.json();
  console.log('Opened target:', pageTarget.url);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let messageId = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) {
        reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      } else {
        resolve(msg.result);
      }
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('Connected to Chrome via WebSocket.');

  function sendCDP(method, params = {}) {
    const id = messageId++;
    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable domains
  await sendCDP('Page.enable');
  await sendCDP('Runtime.enable');
  await sendCDP('DOM.enable');

  // Set device metrics (crisp 1440x900 viewport with scale factor 2 for high-res publication screenshots)
  await sendCDP('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });

  console.log('Navigating to login page...');
  await sendCDP('Page.navigate', { url: 'http://localhost:3000/login' });
  await sleep(2500);

  // Authenticate with Supabase and set bypass user
  console.log('Authenticating with head.bscs@sti.edu...');
  await sendCDP('Runtime.evaluate', {
    expression: `
      (async () => {
        // Set bypass user
        localStorage.setItem('bypass_user', JSON.stringify({
          id: '0bd69a8b-3d8d-429d-ab0b-834f3712cb25',
          full_name: 'Engr. Clyde Taburada (BSCS Program Head)',
          email: 'head.bscs@sti.edu',
          role: 'program_head',
          auth_user_id: '103681cc-757c-4eb0-9a96-4efb7cb2b43f',
          institution_id: 'inst-1',
          department_id: 'dept-cict',
          program_id: 'b700c9cb-ec83-4585-b479-faa40d1136af',
          is_active: true,
          created_at: '2026-01-01',
          programs: {
            id: 'b700c9cb-ec83-4585-b479-faa40d1136af',
            department_id: 'dept-cict',
            code: 'BSCS',
            name: 'Bachelor of Science in Computer Science',
            current_level_id: 'lvl-2',
            is_accreditation_active: true
          }
        }));

        // Fill in credentials and submit form
        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        if (emailInput && passInput) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(emailInput, 'head.bscs@sti.edu');
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          nativeSetter.call(passInput, 'password123');
          passInput.dispatchEvent(new Event('input', { bubbles: true }));

          const btn = document.querySelector('form button[type="submit"]');
          if (btn) btn.click();
        }
      })()
    `
  });

  // Wait for auth & dashboard redirect
  await sleep(4000);

  // Capture each operational page
  for (const pageInfo of PAGES_TO_CAPTURE) {
    console.log(`\nCapturing ${pageInfo.title}...`);
    await sendCDP('Runtime.evaluate', {
      expression: `window.location.href = '${pageInfo.url}';`
    });
    await sleep(pageInfo.waitMs);

    if (pageInfo.beforeCapture) {
      try {
        await pageInfo.beforeCapture(sendCDP);
      } catch (err) {
        console.warn('beforeCapture hook error:', err.message);
      }
    }

    // Capture screenshot
    const res = await sendCDP('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true
    });

    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(OUT_DIR, pageInfo.name);
    fs.writeFileSync(outPath, buffer);
    console.log(`✓ Saved ${pageInfo.name} (${(buffer.length / 1024).toFixed(1)} KB) to ${outPath}`);
  }

  console.log('\nAll operational system screenshots captured successfully from actual running application!');

  ws.close();
  chromeProcess.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
