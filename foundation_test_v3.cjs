const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST = '/home/z/my-project/smart-engineering/dist';
const OUT = '/home/z/my-project/download';
const PORT = 9393;

const mimeTypes = {
  '.html':'text/html; charset=utf-8', '.js':'application/javascript',
  '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml',
  '.png':'image/png', '.ico':'image/x-icon', '.webmanifest':'application/manifest+json',
};

async function main() {
  const server = http.createServer((req, res) => {
    let fp = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(fp, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); }
      else { res.writeHead(200, {'Content-Type': mimeTypes[path.extname(fp)]||'text/octet-stream'}); res.end(data); }
    });
  });
  await new Promise((res) => server.listen(PORT, '0.0.0.0', () => { console.log(`Server on :${PORT}`); res(); }));

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Navigate to foundation page
  await page.goto(`http://127.0.0.1:${PORT}/foundation`, { timeout: 15000, waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('Page loaded');

  // Take initial screenshot
  await page.screenshot({ path: path.join(OUT, 'foundation_01_initial.png') });

  // Helper: Click foundation type button
  async function selectType(type) {
    const typeTexts = {
      'isolated': 'منفرد',
      'continuous': 'مستمر',
      'combined': 'مشترك',
      'mat': 'حصيرة',
    };
    const txt = typeTexts[type];
    await page.click(`button:has-text("${txt}")`);
    await page.waitForTimeout(400);
    console.log(`  Type: ${txt}`);
  }

  // Helper: Click load case button
  async function selectLoadCase(lc) {
    const lcTexts = { 1: 'دائمة', 2: 'رياح', 3: 'زلزال' };
    const txt = lcTexts[lc];
    // Click within load case section
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes(txt) && text.length < 30) {
        await btn.click();
        await page.waitForTimeout(300);
        console.log(`  Load case: ${txt}`);
        return;
      }
    }
  }

  // Helper: Set all inputs via Zustand store through page evaluation
  async function setInputsAndCalculate(inputs) {
    await page.evaluate((inputs) => {
      // Set Zustand persisted store directly
      const key = 'smart-engineering-foundation-v5';
      const current = JSON.parse(localStorage.getItem(key) || '{}');
      current.state = current.state || {};
      current.state.inputs = { ...current.state.inputs, ...inputs };
      localStorage.setItem(key, JSON.stringify(current));
    }, inputs);
    
    // Reload to pick up localStorage changes
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    // Click calculate button
    try {
      await page.click('button:has-text("احسب")', { timeout: 3000 });
    } catch(e) {
      try {
        await page.click('button:has-text("Calculate")', { timeout: 3000 });
      } catch(e2) {
        console.log('  WARNING: Could not find calculate button');
      }
    }
    await page.waitForTimeout(2000);
  }

  // Helper: Get results from localStorage
  async function getResults() {
    return await page.evaluate(() => {
      const key = 'smart-engineering-foundation-v5';
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return data.state?.results || null;
    });
  }

  // ============================================================
  // Test 1: Isolated Foundation (أساس منفرد)
  // ============================================================
  console.log('\n=== Test 1: أساس منفرد (Isolated) ===');
  await setInputsAndCalculate({
    type: 'isolated', B: 2.5, L: 3.0, D_f: 0.6, t: 0.4,
    V: 450, M_x: 30, M_y: 15, H: 25, loadCase: 1,
    q_allowable: 250, soilDensity: 18, c_w: 15, delta_friction: 25,
    E_passive: 0, E_active: 0, U_uplift: 0,
    concreteGrade: 'C25/30', steelGrade: 'B400', cover: 50,
    columnWidth: 0.4, columnDepth: 0.4, isSteelColumn: false,
    basePlateWidth: 0.3, basePlateDepth: 0.3,
    barDiameterChosen: 14, betaEccentricity: 1.15, maxColumnSpacing: 5.0,
  });
  
  let r = await getResults();
  if (r && r.calculated) {
    console.log('  σ₁ =', r.sigma_1, 'kN/m²');
    console.log('  σ₂ =', r.sigma_2, 'kN/m²');
    console.log('  q_magnified =', r.q_magnified, 'kN/m²');
    console.log('  Bearing safe =', r.bearingSafe);
    console.log('  Bearing ratio =', r.bearingVerificationRatio + '%');
    console.log('  M_u =', r.M_u, 'kN.m');
    console.log('  Bottom X =', `Φ${r.bottomRebarX.diameter}/${r.bottomRebarX.spacing}mm (${r.bottomRebarX.count} bars)`);
    console.log('  Top rebar required =', r.topRebarRequired);
    console.log('  Top rebar message =', r.topRebarMessage);
  } else {
    console.log('  Results not calculated yet');
  }
  await page.screenshot({ path: path.join(OUT, 'foundation_02_isolated.png') });

  // ============================================================
  // Test 2: Continuous/Strip Foundation (أساس مستمر)
  // ============================================================
  console.log('\n=== Test 2: أساس مستمر (Continuous/Strip) ===');
  await setInputsAndCalculate({
    type: 'continuous', B: 2.0, L: 4.0, D_f: 0.5, t: 0.35,
    V: 350, M_x: 20, M_y: 10, H: 15, loadCase: 1,
    q_allowable: 200, soilDensity: 18, c_w: 12, delta_friction: 22,
    E_passive: 0, E_active: 0, U_uplift: 0,
    concreteGrade: 'C25/30', steelGrade: 'B400', cover: 50,
    columnWidth: 0.3, columnDepth: 0.3, isSteelColumn: false,
    basePlateWidth: 0.25, basePlateDepth: 0.25,
    barDiameterChosen: 14, betaEccentricity: 1.15, maxColumnSpacing: 4.0,
  });
  r = await getResults();
  if (r && r.calculated) {
    console.log('  σ₁ =', r.sigma_1, 'kN/m²');
    console.log('  σ₂ =', r.sigma_2, 'kN/m²');
    console.log('  Top rebar required =', r.topRebarRequired);
    console.log('  Top rebar message =', r.topRebarMessage);
  }
  await page.screenshot({ path: path.join(OUT, 'foundation_03_continuous.png') });

  // ============================================================
  // Test 3: Combined Foundation (أساس مشترك)
  // ============================================================
  console.log('\n=== Test 3: أساس مشترك (Combined) ===');
  await setInputsAndCalculate({
    type: 'combined', B: 3.0, L: 5.0, D_f: 0.8, t: 0.5,
    V: 600, M_x: 50, M_y: 25, H: 35, loadCase: 1,
    q_allowable: 250, soilDensity: 19, c_w: 18, delta_friction: 28,
    E_passive: 0, E_active: 0, U_uplift: 0,
    concreteGrade: 'C30/37', steelGrade: 'B400', cover: 50,
    columnWidth: 0.4, columnDepth: 0.4, isSteelColumn: false,
    basePlateWidth: 0.3, basePlateDepth: 0.3,
    barDiameterChosen: 16, betaEccentricity: 1.15, maxColumnSpacing: 5.0,
  });
  r = await getResults();
  if (r && r.calculated) {
    console.log('  σ₁ =', r.sigma_1, 'kN/m²');
    console.log('  σ₂ =', r.sigma_2, 'kN/m²');
    console.log('  Top rebar required =', r.topRebarRequired);
    console.log('  Top rebar message =', r.topRebarMessage);
    console.log('  Top X =', `Φ${r.topRebarX.diameter}/${r.topRebarX.spacing}mm (${r.topRebarX.count} bars)`);
    console.log('  Top Y =', `Φ${r.topRebarY.diameter}/${r.topRebarY.spacing}mm (${r.topRebarY.count} bars)`);
  }
  await page.screenshot({ path: path.join(OUT, 'foundation_04_combined.png') });

  // ============================================================
  // Test 4: Mat/Raft Foundation (حصيرة عامة)
  // ============================================================
  console.log('\n=== Test 4: حصيرة عامة (Mat/Raft) ===');
  await setInputsAndCalculate({
    type: 'mat', B: 8.0, L: 10.0, D_f: 1.5, t: 0.8,
    V: 2500, M_x: 100, M_y: 50, H: 80, loadCase: 1,
    q_allowable: 200, soilDensity: 18, c_w: 20, delta_friction: 30,
    E_passive: 0, E_active: 0, U_uplift: 0,
    concreteGrade: 'C30/37', steelGrade: 'B400', cover: 50,
    columnWidth: 0.5, columnDepth: 0.5, isSteelColumn: false,
    basePlateWidth: 0.4, basePlateDepth: 0.4,
    barDiameterChosen: 16, betaEccentricity: 1.15, maxColumnSpacing: 6.0,
  });
  r = await getResults();
  if (r && r.calculated) {
    console.log('  σ₁ =', r.sigma_1, 'kN/m²');
    console.log('  σ₂ =', r.sigma_2, 'kN/m²');
    console.log('  Top rebar required =', r.topRebarRequired);
    console.log('  Top rebar message =', r.topRebarMessage);
    console.log('  Column strip note =', r.columnStripNote);
    console.log('  Top X =', `Φ${r.topRebarX.diameter}/${r.topRebarX.spacing}mm (${r.topRebarX.count} bars)`);
    console.log('  Top Y =', `Φ${r.topRebarY.diameter}/${r.topRebarY.spacing}mm (${r.topRebarY.count} bars)`);
    console.log('  Raft stiffness =', JSON.stringify(r.raftStiffnessCheck));
  }
  await page.screenshot({ path: path.join(OUT, 'foundation_05_raft.png') });

  // ============================================================
  // Test 5: Wind Load Case (حالة الرياح) - with Combined
  // ============================================================
  console.log('\n=== Test 5: حالة الرياح + أساس مشترك ===');
  await setInputsAndCalculate({
    type: 'combined', B: 3.0, L: 5.0, D_f: 0.8, t: 0.5,
    V: 600, M_x: 80, M_y: 40, H: 60, loadCase: 2,
    q_allowable: 250, soilDensity: 19, c_w: 18, delta_friction: 28,
    E_passive: 0, E_active: 0, U_uplift: 0,
    concreteGrade: 'C30/37', steelGrade: 'B400', cover: 50,
    columnWidth: 0.4, columnDepth: 0.4, isSteelColumn: false,
    basePlateWidth: 0.3, basePlateDepth: 0.3,
    barDiameterChosen: 16, betaEccentricity: 1.15, maxColumnSpacing: 5.0,
  });
  r = await getResults();
  if (r && r.calculated) {
    console.log('  σ₁ =', r.sigma_1, 'kN/m²');
    console.log('  q_magnified =', r.q_magnified, 'kN/m²');
    console.log('  Load case warning =', r.loadCaseWarning);
  }
  await page.screenshot({ path: path.join(OUT, 'foundation_06_wind_load.png') });

  // ============================================================
  // Test 6: Seismic Load Case (حالة الزلزال) - with Mat
  // ============================================================
  console.log('\n=== Test 6: حالة الزلزال + حصيرة عامة ===');
  await setInputsAndCalculate({
    type: 'mat', B: 8.0, L: 10.0, D_f: 1.5, t: 0.8,
    V: 2500, M_x: 200, M_y: 100, H: 150, loadCase: 3,
    q_allowable: 200, soilDensity: 18, c_w: 20, delta_friction: 30,
    E_passive: 0, E_active: 0, U_uplift: 0,
    concreteGrade: 'C30/37', steelGrade: 'B400', cover: 50,
    columnWidth: 0.5, columnDepth: 0.5, isSteelColumn: false,
    basePlateWidth: 0.4, basePlateDepth: 0.4,
    barDiameterChosen: 16, betaEccentricity: 1.15, maxColumnSpacing: 6.0,
  });
  r = await getResults();
  if (r && r.calculated) {
    console.log('  σ₁ =', r.sigma_1, 'kN/m²');
    console.log('  σ₂ =', r.sigma_2, 'kN/m²');
    console.log('  q_magnified =', r.q_magnified, 'kN/m²');
    console.log('  Load case warning =', r.loadCaseWarning);
    console.log('  Has tension =', r.hasTension);
    console.log('  Raft stiffness =', JSON.stringify(r.raftStiffnessCheck));
    console.log('  Column strip note =', r.columnStripNote);
    console.log('  Top X =', `Φ${r.topRebarX.diameter}/${r.topRebarX.spacing}mm (${r.topRebarX.count} bars, As=${r.topRebarX.areaProvided.toFixed(0)}mm²)`);
  }
  await page.screenshot({ path: path.join(OUT, 'foundation_07_seismic_load.png') });
  await page.screenshot({ path: path.join(OUT, 'foundation_08_seismic_full.png'), fullPage: true });

  await browser.close();
  server.close();
  console.log('\n✅ All 6 tests completed with screenshots!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
