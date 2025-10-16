// ======================= 問題資料 (使用像素座標，假設圖片尺寸為768x768) =======================
const questions = [
  {
    id: 1,
    title: '第1題：迷宮中的選擇',
    text: '一場殘酷的捉迷藏即將開始，你選擇躲在哪裡？',
    image: 'Q1.png',
    width: 768,
    height: 768,
    type: 'clickable',
    options: [
      { id: 'door',    text: '一扇半掩的木門後', value: 'A', x: 150, y: 260, w: 140, h: 260 },
      { id: 'passage', text: '一段濕冷的綠牆通道', value: 'B', x: 480, y: 260, w: 130, h: 240 },
      { id: 'storage', text: '地下貯藏室',       value: 'C', x: 495, y: 555, w: 120, h: 140 }
    ]
  },
  {
    id: 2,
    title: '第2題：跳繩橋上',
    text: '繩索高速甩動，發出尖銳的破空聲，橋面在腳下微微晃動。<br>你站在橋邊，手上緊緊抱著唯一重要的東西。',
    image: 'ChatGPT Image 2025年6月24日 下午01_56_43.png',
    width: 768,
    height: 768,
    type: 'clickable',
    options: [
      { id: 'doll',     text: '一隻破布偶',       value: 'A', x: 295, y: 680, w: 80, h: 85 },
      { id: 'notebook', text: '一本舊筆記本',     value: 'B', x: 470, y: 700, w: 55, h: 55 },
      { id: 'photo',    text: '一張撕掉角的照片', value: 'C', x: 422, y: 695, w: 33, h: 40 }
    ]
  },
  {
    id: 3,
    title: '第3題：天空之聲',
    text: '獨自站在決戰的圓台上，四周寂靜無聲，唯有天空傳來幾段旋律，輕輕地撥動你的心弦。\n**請傾聽，選擇你喜歡的聲音。**\n**選擇你所愛的聲音，讓它成為此刻的記憶。**',
    image: 'ChatGPT Image 2025年6月24日 下午01_56_30.png',
    width: 768,
    height: 768,
    type: 'music',
    options: [
      { id: 'pink', text: 'Pink Soldiers',        audio: 'Pink Soldiers.mp3', value: 'A' },
      { id: 'rope', text: 'The Rope is Tied',     audio: 'The Rope is Tied  Squid Game OST.mp3', value: 'B' },
      { id: 'way',  text: 'Way Back Then',        audio: 'Way Back then.mp3', value: 'C' }
    ]
  }
];

// ======================= 香料對應表（基準：前20 / 中50 / 後30） =======================
const TOP_NOTE_MAP = {
  A: ['香檸檬', '桂花'],
  B: ['無花果', '白葡萄酒'],
  C: ['含羞草', '伯爵茶']
};

const HEART_NOTE_MAP = {
  A: ['小蒼蘭', '金銀花'],
  B: ['橙花', '茉莉花'],
  C: ['天竺葵', '青草', '海洋']
};

const BASE_NOTE_MAP = {
  A: ['檀香木', '白麝香'],
  B: ['零陵香豆', '香草'],
  C: ['鐵觀音', '麝香'] // 茶感
};

// ======================= 命名微調（群組比例 ±5%） =======================
// - 深沉/夜/木質/茶：後調+5%、中調-5%
// - 海洋/清新/花感：中調+5%、後調-5%
// 其餘 0%
function getNameAdjustments(perfumeName) {
  const deepKeys  = ['夜', '黑', 'noir', 'wood', '木', '檀', '茶', 'zen'];
  const freshKeys = ['海', 'wave', '潮', 'ocean', 'blue', '花', 'bloom', 'light', '清'];

  const hasDeep  = deepKeys.some(k => perfumeName.includes(k));
  const hasFresh = freshKeys.some(k => perfumeName.includes(k));

  if (hasDeep && !hasFresh) return { heartDelta: -5, baseDelta: +5, reason: '深沉/木質/夜色/茶意' };
  if (hasFresh && !hasDeep) return { heartDelta: +5, baseDelta: -5, reason: '海洋/清新/花感' };
  return { heartDelta: 0, baseDelta: 0, reason: null };
}

// ======================= 命名微調（組內「各香味」±5%） =======================
// 傳回一個 map: { '香材名': deltaInGroupPct }，每支香材在其所屬組內最多 +5.0（或 0）
function getNameMaterialBias(perfumeName) {
  const name = perfumeName.toLowerCase();
  const bias = {};

  // 關鍵字 → 特定香材微調（+值代表在該組內增加比例）
  const add = (mat, delta) => { bias[mat] = clamp1dp((bias[mat] || 0) + delta, -5.0, 5.0); };

  if (perfumeName.includes('茶') || name.includes('tea'))       add('鐵觀音', 5.0);
  if (perfumeName.includes('木') || name.includes('wood'))      add('檀香木', 5.0);
  if (perfumeName.includes('花') || name.includes('bloom'))    { add('茉莉花', 3.0); add('小蒼蘭', 2.0); }
  if (name.includes('citrus') || perfumeName.includes('檸'))    add('香檸檬', 5.0);
  if (name.includes('fig') || perfumeName.includes('無花果'))    add('無花果', 5.0);
  if (name.includes('wine') || perfumeName.includes('酒'))       add('白葡萄酒', 5.0);
  if (name.includes('osmanthus') || perfumeName.includes('桂'))  add('桂花', 5.0);
  if (name.includes('musk') || perfumeName.includes('麝'))     { add('白麝香', 3.0); add('麝香', 3.0); }
  if (name.includes('vanilla') || perfumeName.includes('香草'))  add('香草', 5.0);
  if (name.includes('tonka') || perfumeName.includes('零陵香豆')) add('零陵香豆', 5.0);
  if (name.includes('ocean') || perfumeName.includes('海'))      add('海洋', 5.0);

  return bias;
}

// ======================= 依「答案內容」計算群組比例微調（±5% 以內） =======================
function getAnswerGroupAdjustments(answerValues) {
  const delta = { top: 0, heart: 0, base: 0 };

  // Q1：A亮開場(前+5), B穩定(中+3/後+2), C深沉(後+5)
  const q1 = (answerValues[0] || '').toUpperCase();
  if (q1 === 'A') { delta.top   += 5; }
  else if (q1 === 'B') { delta.heart += 3; delta.base  += 2; }
  else if (q1 === 'C') { delta.base  += 5; }

  // Q2：A柔軟(中+5), B條理(前+2/中+3), C記憶(後+3/中+2)
  const q2 = (answerValues[1] || '').toUpperCase();
  if (q2 === 'A') { delta.heart += 5; }
  else if (q2 === 'B') { delta.top += 2; delta.heart += 3; }
  else if (q2 === 'C') { delta.base += 3; delta.heart += 2; }

  // Q3：A俏皮(前+3), B張力(後+5), C惆悵(後+3/中+2)
  const q3 = (answerValues[2] || '').toUpperCase();
  if (q3 === 'A') { delta.top += 3; }
  else if (q3 === 'B') { delta.base += 5; }
  else if (q3 === 'C') { delta.base += 3; delta.heart += 2; }

  return delta;
}

// ======================= 依「答案內容」計算組內材料偏好（±5% 以內） =======================
// 讓該題對應的組內，首選香材+3.0，次選+2.0（若有第三支則 +0）
function getAnswerMaterialBias(answerValues) {
  const bias = {};
  const add = (mat, delta) => { bias[mat] = clamp1dp((bias[mat] || 0) + delta, -5.0, 5.0); };

  const q1 = (answerValues[0] || '').toUpperCase();
  if (q1 === 'A') { add('香檸檬', 3.0); add('桂花', 2.0); }
  if (q1 === 'B') { add('無花果', 3.0); add('白葡萄酒', 2.0); }
  if (q1 === 'C') { add('含羞草', 3.0); add('伯爵茶', 2.0); }

  const q2 = (answerValues[1] || '').toUpperCase();
  if (q2 === 'A') { add('小蒼蘭', 3.0); add('金銀花', 2.0); }
  if (q2 === 'B') { add('橙花', 3.0); add('茉莉花', 2.0); }
  if (q2 === 'C') { add('天竺葵', 3.0); add('青草', 2.0); /* 海洋留 0 作平衡 */ }

  const q3 = (answerValues[2] || '').toUpperCase();
  if (q3 === 'A') { add('白麝香', 3.0); /* A組實際在BASE_MAP.A，有兩支 */ add('檀香木', 2.0); }
  if (q3 === 'B') { add('香草', 3.0); add('零陵香豆', 2.0); }
  if (q3 === 'C') { add('麝香', 3.0); add('鐵觀音', 2.0); }

  return bias;
}

// ======================= 1位小數 clamp 與正規化工具 =======================
function clamp1dp(v, min, max) {
  const r = Math.max(min, Math.min(max, v));
  return Math.round(r * 10) / 10;
}

// 群組比例（前/中/後）正規化到 100.0%，各取 1 位小數
function normalizeRatiosTo1dp(r) {
  const sumRaw = r.top + r.heart + r.base;
  let rt = {
    top:   (r.top   / sumRaw) * 100,
    heart: (r.heart / sumRaw) * 100,
    base:  (r.base  / sumRaw) * 100,
  };
  rt.top   = Math.round(rt.top   * 10) / 10;
  rt.heart = Math.round(rt.heart * 10) / 10;
  rt.base  = Math.round(rt.base  * 10) / 10;

  const sum1dp = +(rt.top + rt.heart + rt.base).toFixed(1);
  const diff = +(100.0 - sum1dp).toFixed(1);
  if (diff !== 0) {
    const entries = [['top', rt.top], ['heart', rt.heart], ['base', rt.base]].sort((a,b)=>b[1]-a[1]);
    const keyMax = entries[0][0];
    rt[keyMax] = +(rt[keyMax] + diff).toFixed(1);
  }
  return rt;
}

// 組內材料分配（各香味）正規化到 100.0%，各取 1 位小數
function normalizeMaterialDistTo1dp(obj) {
  // obj: { '香材名': dist(未正規化，可能含偏好) }
  const mats = Object.keys(obj);
  if (mats.length === 0) return obj;

  const sumRaw = mats.reduce((s, k) => s + obj[k], 0);
  let dist = {};
  mats.forEach(k => { dist[k] = sumRaw > 0 ? (obj[k] / sumRaw) * 100 : 100 / mats.length; });

  mats.forEach(k => { dist[k] = Math.round(dist[k] * 10) / 10; });

  let sum1dp = +(mats.reduce((s, k) => s + dist[k], 0)).toFixed(1);
  let diff = +(100.0 - sum1dp).toFixed(1);
  if (diff !== 0) {
    // 把差值補到目前最大的那個材料
    const maxKey = mats.slice().sort((a,b)=>dist[b]-dist[a])[0];
    dist[maxKey] = +(dist[maxKey] + diff).toFixed(1);
  }
  return dist;
}

// 建立某一組的材料分配（含 ±5% 偏好，取 1 位小數，總和為該組的 100%）
function buildGroupMaterialDistribution(materials, answerMatBias, nameMatBias) {
  if (!materials || materials.length === 0) return {};

  // 先均分
  const baseEach = +(100 / materials.length).toFixed(1);
  let raw = {};
  materials.forEach(m => raw[m] = baseEach);

  // 疊加偏好（每支上限 ±5.0）
  const add = (m, d) => {
    raw[m] = raw[m] ?? baseEach;
    raw[m] = clamp1dp(raw[m] + d, 0, 100); // 單支不超界，最後會正規化
  };

  materials.forEach(m => {
    if (answerMatBias[m]) add(m, clamp1dp(answerMatBias[m], -5.0, 5.0));
    if (nameMatBias[m])   add(m, clamp1dp(nameMatBias[m],   -5.0, 5.0));
  });

  // 正規化到 100.0%，各 1 位小數
  return normalizeMaterialDistTo1dp(raw);
}

// ======================= 香水配方計算（g，總量固定 6 g） =======================
function getPerfumeFormula(answerValues, totalG = 6, ratioOverride = null, perfumeNameForMaterials = '') {
  if (!Array.isArray(answerValues) || answerValues.length !== 3) {
    throw new Error('❌ 答案應為長度 3 的字母陣列');
  }

  const [q1, q2, q3] = answerValues.map(a => a.toUpperCase());
  const notes = {
    top:   TOP_NOTE_MAP[q1]   || [],
    heart: HEART_NOTE_MAP[q2] || [],
    base:  BASE_NOTE_MAP[q3]  || []
  };

  // 1) 群組比例：基準 20/50/30 → 命名 ±5% → 答案 ±5% → 正規化到 1 位小數
  let ratio = ratioOverride || { top: 20, heart: 50, base: 30 };

  // 命名微調（群組）
  // （若外部已先做過可略，這裡保險再處理一次為 1dp）
  ratio = normalizeRatiosTo1dp(ratio);

  // 答案微調（群組）
  const ansGrp = getAnswerGroupAdjustments(answerValues);
  ratio = {
    top:   ratio.top   + ansGrp.top,
    heart: ratio.heart + ansGrp.heart,
    base:  ratio.base  + ansGrp.base
  };
  ratio = normalizeRatiosTo1dp(ratio);

  // 2) 組內各香味分配：均分 → 答案偏好 ±5% → 命名偏好 ±5% → 正規化到 1 位小數
  const ansMatBias  = getAnswerMaterialBias(answerValues);
  const nameMatBias = getNameMaterialBias(perfumeNameForMaterials);

  const distTop   = buildGroupMaterialDistribution(notes.top,   ansMatBias, nameMatBias);
  const distHeart = buildGroupMaterialDistribution(notes.heart, ansMatBias, nameMatBias);
  const distBase  = buildGroupMaterialDistribution(notes.base,  ansMatBias, nameMatBias);

  // 3) 依群組比例 → 轉 g → 再依組內分配到各香味（保留 3 位小數）
  const groupG = {
    top:   +(totalG * ratio.top   / 100).toFixed(3),
    heart: +(totalG * ratio.heart / 100).toFixed(3),
    base:  +(totalG * ratio.base  / 100).toFixed(3),
  };

  const weights = {};
  const assign = (dist, groupKey) => {
    Object.entries(dist).forEach(([mat, pct]) => {
      const g = +(groupG[groupKey] * (pct / 100)).toFixed(3);
      weights[mat] = g;
    });
  };
  assign(distTop, 'top');
  assign(distHeart, 'heart');
  assign(distBase, 'base');

  return { notes, ratio, weights, total: totalG, unit: 'g',
           materialDist: { top: distTop, heart: distHeart, base: distBase }, groupG };
}

// ======================= 分析式 Summary（不顯示答案原因） =======================
function buildResultSummary(result, perfumeName, nameAdjInfo) {
  const { ratio, total, groupG } = result;

  const nameLine = (nameAdjInfo && (nameAdjInfo.heartDelta !== 0 || nameAdjInfo.baseDelta !== 0))
    ? `「${perfumeName}」觸發命名偏好（${nameAdjInfo.reason}），比例隨之微調，更貼近你的氣味意象。`
    : `命名未帶來額外偏好，本次比例主要根據你的直覺選擇而定。`;

  const lines = [
    `<p>${nameLine}</p>`,
    `<p>層次分配：前調 ${ratio.top.toFixed(1)}%（${groupG.top} g）、中調 ${ratio.heart.toFixed(1)}%（${groupG.heart} g）、後調 ${ratio.base.toFixed(1)}%（${groupG.base} g），總量 ${total} g。</p>`
  ];
  return lines.join('');
}

// ======================= 一般配方區塊渲染（g 顯示） =======================
function renderPerfumeFormula(result) {
  const { notes, ratio, weights, total, unit, materialDist } = result;

  const listHtml = (arr, dist) => arr.map(mat => {
    const pctInGroup = dist[mat] !== undefined ? `（組內 ${dist[mat].toFixed(1)}%）` : '';
    return `<li>${mat}：${(weights[mat] ?? 0).toFixed(3)} ${unit} ${pctInGroup}</li>`;
  }).join('');

  return `
    <div class="perfume-formula">
      <h3>✨ 你的專屬香水配方 ✨</h3>
      <p class="formula-total">總重量：${total} ${unit}</p>

      <div class="formula-section">
        <h4>▸ 前調（${ratio.top.toFixed(1)}%）</h4>
        <ul class="formula-list">${listHtml(notes.top, materialDist.top || {})}</ul>
      </div>

      <div class="formula-section">
        <h4>▸ 中調（${ratio.heart.toFixed(1)}%）</h4>
        <ul class="formula-list">${listHtml(notes.heart, materialDist.heart || {})}</ul>
      </div>

      <div class="formula-section">
        <h4>▸ 後調（${ratio.base.toFixed(1)}%）</h4>
        <ul class="formula-list">${listHtml(notes.base, materialDist.base || {})}</ul>
      </div>
    </div>
  `;
}

// ======================= 配方卡格式渲染（顯示 g + 比例1位小數 + 總重量6 g） =======================
function renderCardFormula(result) {
  const { notes, ratio, weights, total, unit, materialDist } = result;
  const mkList = (arr, dist) => arr.map(mat =>
    `<li><span class="material-name">${mat}</span><span class="material-weight">${(weights[mat] ?? 0).toFixed(3)}${unit} <em class="subpct">（組內 ${dist[mat]?.toFixed(1) ?? '0.0'}%）</em></span></li>`
  ).join('');

  let html = '<div class="formula-grid">';
  html += `
    <div class="formula-card-section">
      <h4>前調 ${ratio.top.toFixed(1)}%</h4>
      <ul class="formula-card-list">${mkList(notes.top, materialDist.top || {})}</ul>
    </div>
  `;
  html += `
    <div class="formula-card-section">
      <h4>中調 ${ratio.heart.toFixed(1)}%</h4>
      <ul class="formula-card-list">${mkList(notes.heart, materialDist.heart || {})}</ul>
    </div>
  `;
  html += `
    <div class="formula-card-section">
      <h4>後調 ${ratio.base.toFixed(1)}%</h4>
      <ul class="formula-card-list">${mkList(notes.base, materialDist.base || {})}</ul>
    </div>
  `;
  html += '</div>';
  html += `<p class="formula-total-weight">總重量：${total} ${unit}</p>`;
  return html;
}

// ======================= 狀態管理 & DOM 元素 =======================
let currentQuestion = 0;
let answers = [];
let answerValues = []; // 儲存 A, B, C 值
let currentAudio = null;
let selectedMusicOption = null;

const coverPage       = document.getElementById('cover-page');
const questionContainer = document.getElementById('question-container');
const resultContainer = document.getElementById('result-container');
const questionTitle   = document.getElementById('question-title');
const questionText    = document.getElementById('question-text');
const scene           = document.getElementById('scene');
const musicPlayer     = document.getElementById('music-player');
const audioPlayer     = document.getElementById('audio-player');
const resultContent   = document.getElementById('result-content');
const restartBtn      = document.getElementById('restart-btn');

// ======================= 封面頁面功能 =======================
function startGame() {
  coverPage.classList.add('hidden');
  questionContainer.classList.remove('hidden');
  showQuestion();
}

// ======================= 初始化 =======================
document.addEventListener('DOMContentLoaded', () => {
  coverPage.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restart);
});

// ======================= 顯示問題 =======================
function showQuestion() {
  if (currentQuestion >= questions.length) {
    showResult();
    return;
  }

  const question = questions[currentQuestion];
  questionTitle.textContent = question.title;
  const formattedText = question.text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  questionText.innerHTML = formattedText;

  scene.innerHTML = '';
  musicPlayer.classList.add('hidden');

  if (currentAudio) {
    audioPlayer.pause();
    currentAudio = null;
  }

  if (question.type === 'clickable') {
    createSVGScene(question);
  } else if (question.type === 'music') {
    createMusicOptions(question);
  }
}

// ======================= 創建SVG場景 =======================
function createSVGScene(question) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${question.width} ${question.height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('scene-svg');

  const imgEl = document.createElementNS(svgNS, 'image');
  imgEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', question.image);
  imgEl.setAttribute('width', question.width);
  imgEl.setAttribute('height', question.height);
  svg.appendChild(imgEl);

  question.options.forEach(option => {
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', option.x);
    rect.setAttribute('y', option.y);
    rect.setAttribute('width', option.w);
    rect.setAttribute('height', option.h);
    rect.classList.add('hotspot');
    rect.setAttribute('data-option', option.id);
    rect.setAttribute('title', option.text);
    rect.addEventListener('click', () => handleAnswer(option));
    svg.appendChild(rect);
  });

  if (question.id === 2) {
    const instructionText = document.createElementNS(svgNS, 'text');
    instructionText.setAttribute('x', '384');
    instructionText.setAttribute('y', '650');
    instructionText.setAttribute('text-anchor', 'middle');
    instructionText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    instructionText.setAttribute('font-size', '20');
    instructionText.setAttribute('font-weight', 'bold');
    instructionText.setAttribute('fill', 'white');
    instructionText.textContent = '請選擇，你無法放手的珍寶';
    svg.appendChild(instructionText);
  }

  scene.appendChild(svg);
}

// ======================= 創建音樂選項 =======================
function createMusicOptions(question) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${question.width} ${question.height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('scene-svg');

  const imgEl = document.createElementNS(svgNS, 'image');
  imgEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', question.image);
  imgEl.setAttribute('width', question.width);
  imgEl.setAttribute('height', question.height);
  svg.appendChild(imgEl);

  scene.appendChild(svg);

  const instructionText = document.createElement('div');
  instructionText.className = 'instruction-text';
  instructionText.textContent = '可選的按鍵,逐一聆聽:';
  scene.appendChild(instructionText);

  const musicSelection = document.createElement('div');
  musicSelection.className = 'music-selection';

  question.options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'music-button';
    button.textContent = option.text;
    button.addEventListener('click', (ev) => handleMusicChoice(option, ev.target));
    musicSelection.appendChild(button);
  });

  const confirmButton = document.createElement('button');
  confirmButton.className = 'confirm-button';
  confirmButton.textContent = '確認選擇';
  confirmButton.disabled = true;
  confirmButton.addEventListener('click', confirmMusicSelection);

  scene.appendChild(musicSelection);
  scene.appendChild(confirmButton);

  setTimeout(() => {
    confirmButton.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, 100);
}

// ======================= 處理答案選擇 =======================
function handleAnswer(option) {
  const clickedArea = document.querySelector(`[data-option="${option.id}"]`);
  if (clickedArea) clickedArea.classList.add('clicked');

  answers.push({ question: questions[currentQuestion].title, answer: option.text });
  answerValues.push(option.value);

  setTimeout(() => {
    currentQuestion++;
    showQuestion();
  }, 500);
}

// ======================= 處理音樂選擇 =======================
function handleMusicChoice(option, btnEl) {
  if (currentAudio) {
    audioPlayer.pause();
    document.querySelectorAll('.music-button').forEach(btn => btn.classList.remove('playing', 'selected'));
  }

  audioPlayer.src = option.audio;
  btnEl.classList.add('playing', 'selected');
  audioPlayer.play();
  currentAudio = option.audio;
  selectedMusicOption = option;

  const confirmButton = document.querySelector('.confirm-button');
  if (confirmButton) confirmButton.disabled = false;
}

function confirmMusicSelection() {
  if (!selectedMusicOption) return;
  answers.push({ question: questions[currentQuestion].title, answer: selectedMusicOption.text });
  answerValues.push(selectedMusicOption.value);
  if (currentAudio) audioPlayer.pause();
  selectedMusicOption = null;
  currentQuestion++;
  showQuestion();
}

// ======================= 顯示結果 =======================
function showResult() {
  questionContainer.classList.add('hidden');
  resultContainer.classList.remove('hidden');

  if (currentAudio) audioPlayer.pause();

  let resultHTML = '';
  answers.forEach((answer) => {
    resultHTML += `
      <div class="choice-item">
        <h3>${answer.question}</h3>
        <p>你的選擇：${answer.answer}</p>
      </div>
    `;
  });

  resultHTML += `
    <div class="perfume-naming">
      <h3>為你的香水命名</h3>
      <input type="text" id="perfume-name-input" placeholder="輸入香水名稱..." maxlength="30">
      <button id="generate-perfume-btn" class="generate-btn">生成配方卡</button>
    </div>
  `;

  resultHTML += '<div id="perfume-card-container" class="hidden"></div>';
  resultContent.innerHTML = resultHTML;

  document.getElementById('generate-perfume-btn').addEventListener('click', generatePerfumeCard);
}

// ======================= 重新開始 =======================
function restart() {
  currentQuestion = 0;
  answers = [];
  answerValues = [];
  currentAudio = null;
  selectedMusicOption = null;

  questionContainer.classList.add('hidden');
  resultContainer.classList.add('hidden');
  coverPage.classList.remove('hidden');
}

// ======================= 生成配方卡（群組±5%→1dp；材料±5%/組→1dp；單位 g） =======================
function generatePerfumeCard() {
  const perfumeName = document.getElementById('perfume-name-input').value.trim();
  if (!perfumeName) { alert('請輸入香水名稱！'); return; }

  try {
    // 1) 先做命名帶來的群組 ±5%（中/後調）→ 1 位小數
    const nameAdj = getNameAdjustments(perfumeName);
    let baseRatio = { top: 20, heart: 50 + nameAdj.heartDelta, base: 30 + nameAdj.baseDelta };
    baseRatio = normalizeRatiosTo1dp(baseRatio);

    // 2) 計算整體（群組比例 + 組內材料分配），總量固定 6 g
    const perfumeResult = getPerfumeFormula(answerValues, 6, baseRatio, perfumeName);

    // 3) 生成 Summary（不顯示答案原因）
    const richSummaryHTML = buildResultSummary(perfumeResult, perfumeName, nameAdj);

    // 4) 卡片輸出
    const cardHTML = `
      <div id="perfume-card" class="perfume-card">
        <div class="card-header">
          <h2>${perfumeName}</h2>
          <p class="card-subtitle">專屬配方卡</p>
        </div>

        <div class="card-content">
          ${renderCardFormula(perfumeResult)}
          <div class="card-summary">
            <h4>結果說明</h4>
            ${richSummaryHTML}
          </div>
        </div>

        <div class="card-footer">
          <p class="creation-date">創建於 ${new Date().toLocaleDateString('zh-TW')}</p>
          <p class="card-signature">21C@JC-JCISC</p>
        </div>
      </div>

      <div class="share-buttons">
        <button id="copy-link-btn" class="share-btn"><span class="icon">🔗</span> 複製連結</button>
        <button id="download-png-btn" class="share-btn"><span class="icon">📷</span> 下載圖片</button>
        <button id="share-fb-btn" class="share-btn"><span class="icon">📱</span> 分享到 Facebook</button>
      </div>
    `;

    const cardContainer = document.getElementById('perfume-card-container');
    cardContainer.innerHTML = cardHTML;
    cardContainer.classList.remove('hidden');

    document.querySelector('.perfume-naming').style.display = 'none';

    document.getElementById('copy-link-btn').addEventListener('click', copyLink);
    document.getElementById('download-png-btn').addEventListener('click', downloadPNG);
    document.getElementById('share-fb-btn').addEventListener('click', shareToFacebook);

    cardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    console.error('配方生成錯誤:', error);
    alert('配方生成失敗，請重試！');
  }
}

// ======================= 分享 / 下載 =======================
function copyLink() {
  const perfumeName = document.getElementById('perfume-name-input').value.trim();
  const url = window.location.href;
  const shareText = `我創造了專屬香水「${perfumeName}」！來試試創造你的香水故事：${url}`;

  navigator.clipboard.writeText(shareText).then(() => {
    showToast('連結已複製！');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('連結已複製！');
  });
}

async function downloadPNG() {
  const perfumeCard = document.getElementById('perfume-card');
  const perfumeName = document.getElementById('perfume-name-input').value.trim();

  try {
    showToast('正在生成圖片...');
    const canvas = await html2canvas(perfumeCard, { backgroundColor: '#1a1a2e', scale: 2, logging: false });
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${perfumeName}_配方卡.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast('圖片已下載！');
    });
  } catch (error) {
    console.error('截圖失敗:', error);
    showToast('圖片生成失敗，請重試！');
  }
}

function shareToFacebook() {
  const perfumeName = document.getElementById('perfume-name-input').value.trim();
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`我創造了專屬香水「${perfumeName}」！`);
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
  window.open(fbShareUrl, '_blank', 'width=600,height=400');
}

// ======================= Toast =======================
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
