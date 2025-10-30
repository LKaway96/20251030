// 完整修正版 sketch.js（選項固定兩欄排列）

let table;
let questions = [];
let currentIndex = 0;
let score = 0;
let state = 'loading'; // loading, question, feedback, finished
let feedbackTimer = 0;
let particles = [];
let cursorTrail = [];
const TRAIL_MAX = 12;

let baseW = 1024, baseH = 720;
let s = 1; // scale
let canvas;
let canvasContainerEl;

// ---------- preload / setup ----------
function preload() {
  // path 是相對於 index.html 的位置 → data/questions.csv
  table = loadTable('data/questions.csv', 'csv', 'header', () => {}, (err) => {
    console.error('loadTable error', err);
  });
}

function setup() {
  // 取得 container DOM，確保在 index.html 中存在 <div id="canvas-container">
  canvasContainerEl = document.getElementById('canvas-container') || document.body;

  const size = computeCanvasSize();
  canvas = createCanvas(size.w, size.h);
  canvas.parent('canvas-container');
  textFont('Arial, Helvetica, sans-serif');
  frameRate(60);
  noCursor();

  parseQuestions();
  state = questions.length ? 'question' : 'finished';
  updateScale();
}

function windowResized() {
  const size = computeCanvasSize();
  resizeCanvas(size.w, size.h);
  updateScale();
}

// 計算要建立或調整的畫布尺寸（以 container 的 client尺寸為主）
function computeCanvasSize() {
  const rect = canvasContainerEl.getBoundingClientRect ? canvasContainerEl.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
  // 設定最小尺寸與最大尺寸保護
  const w = Math.max(320, Math.round(rect.width || window.innerWidth));
  const h = Math.max(420, Math.round(rect.height || Math.min(window.innerHeight, baseH)));
  return { w, h };
}

function updateScale() {
  s = Math.min(width / baseW, height / baseH);
  s = constrain(s, 0.5, 1.6);
}

// ---------- CSV 解析 ----------
function parseQuestions() {
  questions = [];
  if (!table) return;
  const cols = table.columns || [];
  for (let r = 0; r < table.getRowCount(); r++) {
    const row = table.getRow(r);
    const q = { text: '', options: [], correct: null };
    // question 欄
    if (cols.indexOf('question') >= 0) {
      q.text = row.get('question').trim();
    } else {
      q.text = row.get(0).trim();
    }
    // options: 找出所有以 option 開頭的欄位，並以順序加入
    for (let c = 0; c < cols.length; c++) {
      const colName = cols[c];
      if (/^option/i.test(colName)) {
        const val = row.get(colName);
        q.options.push(val !== undefined ? val.trim() : '');
      }
      if (/^correct/i.test(colName)) {
        const val = row.get(colName);
        const n = parseInt((val || '').toString().trim(), 10);
        q.correct = isNaN(n) ? null : (n - 1);
      }
    }
    // 若沒有 option 欄，嘗試把剩餘欄視為選項（備援）
    if (q.options.length === 0) {
      for (let c = 1; c < table.getColumnCount(); c++) {
        q.options.push(row.get(c));
      }
    }
    // 如果 correct 為 null，嘗試預設為第一個選項
    if (q.correct === null) q.correct = 0;
    questions.push(q);
  }
}

// ---------- draw / UI ----------
function draw() {
  background(12, 18, 36);
  drawBackgroundStars();

  if (state === 'loading') {
    drawCenteredText('Loading questions...', 24 * s);
  } else if (state === 'question') {
    drawQuestionUI();
  } else if (state === 'feedback') {
    drawQuestionUI();
    drawFeedbackOverlay();
    if (millis() - feedbackTimer > 900) {
      nextQuestion();
    }
  } else if (state === 'finished') {
    drawResultScreen();
  }

  updateParticles();
  drawParticles();
  drawCursor();
}

function drawBackgroundStars() {
  noStroke();
  for (let i = 0; i < 40; i++) {
    const x = (i * 12345) % width;
    const y = (i * 9876) % height;
    const s1 = 0.4 + (i % 3) * 0.6;
    fill(255, 255, 255, 10);
    ellipse((x + frameCount * (i % 2 === 0 ? 0.25 : 0.12)) % width, y, s1);
  }
}

function drawCenteredText(txt, sizePx) {
  fill(220);
  textAlign(CENTER, CENTER);
  textSize(sizePx);
  text(txt, width / 2, height / 2);
}

function drawQuestionUI() {
  if (!questions[currentIndex]) return;
  const q = questions[currentIndex];

  // layout 參數（會根據 s 調整）
  const leftPad = 64 * s;
  const topPad = 48 * s;
  const optGap = 14 * s;
  const optH = 60 * s;
  const colPadding = 20 * s;

  const optWSingle = width - leftPad * 2;
  // 固定兩欄排列：每列兩個選項
  const columns = 2;
  const optW = (width - leftPad * 2 - colPadding * (columns - 1)) / columns;

  // 題目
  push();
  textAlign(LEFT, TOP);
  fill(230);
  textSize(26 * s);
  text(q.text, leftPad, topPad, width - leftPad * 2, 200 * s);
  pop();

  // 選項
  const startY = topPad + (110 * s);
  for (let i = 0; i < q.options.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = leftPad + col * (optW + colPadding);
    const y = startY + row * (optH + optGap);

    const hovered = mouseX > x && mouseX < x + optW && mouseY > y && mouseY < y + optH;
    if (hovered) {
      fill(35, 140, 255, 200);
      stroke(100, 190, 255);
      strokeWeight(2 * s);
    } else {
      fill(255, 255, 255, 8);
      noStroke();
    }
    rect(x, y, optW, optH, 10 * s);

    noStroke();
    fill(245);
    textSize(18 * s);
    textAlign(LEFT, CENTER);
    text(`${i + 1}. ${q.options[i]}`, x + 14 * s, y + optH / 2);

    if (hovered) {
      push();
      fill(255, 255, 255, 24);
      ellipse(x + optW - 36 * s, y + optH / 2, 36 * s);
      pop();
    }
  }

  // 頂部資訊
  push();
  textSize(14 * s);
  fill(200);
  textAlign(RIGHT, TOP);
  text(`Question ${currentIndex + 1}/${questions.length}`, width - 18 * s, 12 * s);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 18 * s, 12 * s);
  pop();
}

// ---------- input / selection ----------
function mousePressed() {
  if (state === 'question') {
    handleSelection();
  } else if (state === 'finished') {
    // reset
    score = 0;
    currentIndex = 0;
    state = questions.length ? 'question' : 'finished';
  }
}

function handleSelection() {
  const q = questions[currentIndex];
  if (!q) return;

  const leftPad = 64 * s;
  const topPad = 48 * s;
  const startY = topPad + (110 * s);
  const optGap = 14 * s;
  const optH = 60 * s;
  const colPadding = 20 * s;
  const columns = 2; // 固定兩欄
  const optW = (width - leftPad * 2 - colPadding * (columns - 1)) / columns;

  for (let i = 0; i < q.options.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = leftPad + col * (optW + colPadding);
    const y = startY + row * (optH + optGap);
    const clicked = mouseX > x && mouseX < x + optW && mouseY > y && mouseY < y + optH;
    if (clicked) {
      const correct = (i === q.correct);
      if (correct) score++;
      makePulse(mouseX, mouseY, correct ? color(40, 220, 120) : color(255, 80, 80));
      spawnParticles(mouseX, mouseY, correct ? color(80, 220, 140) : color(255, 120, 120), correct ? 18 : 12);
      state = 'feedback';
      feedbackTimer = millis();
      return;
    }
  }
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= questions.length) {
    state = 'finished';
    // 根據分數生成不同風格的結尾粒子
    const pct = questions.length ? (score / questions.length) : 0;
    if (pct >= 0.8) {
      for (let i = 0; i < 120; i++) spawnParticles(random(width), random(height / 2), color(random(120, 255), random(120, 255), random(120, 255)), 1);
    } else if (pct >= 0.4) {
      for (let i = 0; i < 60; i++) spawnParticles(random(width), height + random(20, 120), color(180, 200, 255), 1, -random(1.5, 3.5));
    } else {
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: random(width),
          y: random(-height, 0),
          vx: 0,
          vy: random(2, 6),
          life: random(100, 300),
          color: color(150, 180, 255, 90),
          size: random(1, 2),
          gravity: 0.02
        });
      }
    }
  } else {
    state = 'question';
  }
}

// ---------- feedback / result UI ----------
function drawFeedbackOverlay() {
  const q = questions[currentIndex];
  if (!q) return;

  const leftPad = 64 * s;
  const topPad = 48 * s;
  const startY = topPad + (110 * s);
  const optGap = 14 * s;
  const optH = 60 * s;
  const colPadding = 20 * s;
  const columns = 2; // 固定兩欄
  const optW = (width - leftPad * 2 - colPadding * (columns - 1)) / columns;

  // 標示正確選項
  for (let i = 0; i < q.options.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = leftPad + col * (optW + colPadding);
    const y = startY + row * (optH + optGap);
    if (i === q.correct) {
      noStroke();
      fill(40, 220, 120, 120);
      rect(x, y, optW, optH, 10 * s);
    }
  }
}

function drawResultScreen() {
  const pct = questions.length ? (score / questions.length) : 0;
  if (pct >= 0.8) {
    drawCenteredText(`Excellent! ${score}/${questions.length}`, 40 * s);
    drawPraiseParticles();
  } else if (pct >= 0.4) {
    drawCenteredText(`Good effort: ${score}/${questions.length}`, 34 * s);
    drawBalloons();
  } else {
    drawCenteredText(`Keep trying: ${score}/${questions.length}`, 30 * s);
    drawGentleRain();
  }
  push();
  textSize(14 * s);
  fill(200);
  textAlign(CENTER, BOTTOM);
  text('Click anywhere to retry', width / 2, height - 16 * s);
  pop();
}

function drawPraiseParticles() {
  for (let i = 0; i < 6; i++) {
    const x = (frameCount * (i + 1) * 37) % width;
    const y = 120 * s + sin((frameCount * 0.05 + i)) * 60 * s;
    stroke(255, 220, 100, 220);
    strokeWeight(2 * s);
    line(x - 6 * s, y, x + 6 * s, y);
    line(x, y - 6 * s, x, y + 6 * s);
    noStroke();
  }
}

function drawBalloons() {
  for (let i = 0; i < 8; i++) {
    const x = (i * 123 + frameCount * 0.2) % width;
    const y = 170 * s + sin((frameCount * 0.02 + i)) * 50 * s;
    fill(200, 150 + i * 8, 220, 230);
    ellipse(x, y, 60 * s, 78 * s);
    stroke(255, 255, 255, 90);
    strokeWeight(1 * s);
    line(x, y + 38 * s, x, y + 80 * s);
    noStroke();
  }
}

function drawGentleRain() {
  stroke(150, 180, 255, 60);
  strokeWeight(1);
  for (let i = 0; i < 40; i++) {
    const x = (i * 73 + frameCount * 0.6) % width;
    line(x, 120 * s, x, height - 120 * s);
  }
  noStroke();
}

// ---------- particles / cursor ----------
function spawnParticles(x, y, col, count = 8, vyRange = undefined) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + random(-8, 8),
      y: y + random(-8, 8),
      vx: random(-3, 3),
      vy: vyRange !== undefined ? vyRange + random(-1, 1) : random(-4, 4),
      life: 30 + random(30),
      color: col,
      size: random(2, 6) * s,
      gravity: 0.06 * s
    });
  }
}

function makePulse(x, y, col) {
  particles.push({ x, y, vx: 0, vy: 0, life: 24, color: col, size: 80 * s, pulse: true });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += (p.vx || 0);
    p.y += (p.vy || 0);
    p.vy += (p.gravity || 0);
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // cursor trail
  cursorTrail.push({ x: mouseX, y: mouseY, t: 28 });
  if (cursorTrail.length > TRAIL_MAX) cursorTrail.shift();
  for (let t of cursorTrail) t.t--;
  cursorTrail = cursorTrail.filter(t => t.t > 0);
}

function drawParticles() {
  noStroke();
  for (const p of particles) {
    const alpha = map(p.life, 0, 80, 0, 255);
    if (p.pulse) {
      push();
      fill(red(p.color), green(p.color), blue(p.color), alpha * 0.6);
      ellipse(p.x, p.y, p.size * (1 - p.life / 24));
      pop();
    } else {
      fill(red(p.color), green(p.color), blue(p.color), alpha);
      ellipse(p.x, p.y, p.size);
    }
  }

  // cursor trail
  for (let i = 0; i < cursorTrail.length; i++) {
    const t = cursorTrail[i];
    const s2 = map(i, 0, cursorTrail.length - 1, 6 * s, 18 * s);
    fill(255, 210 - i * 16);
    ellipse(t.x, t.y, s2);
  }
}

function drawCursor() {
  push();
  blendMode(ADD);
  fill(30, 160, 255, 60);
  ellipse(mouseX, mouseY, 46 * s);
  blendMode(BLEND);
  stroke(200);
  strokeWeight(1.2 * s);
  noFill();
  ellipse(mouseX, mouseY, 14 * s);
  noStroke();
  pop();
}