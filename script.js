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

// ======================= 香料對應表 =======================
const TOP_NOTE_MAP = {       // Q1：前調（基準 20%）
  A: ['香檸檬', '桂花'],
  B: ['無花果', '白葡萄酒'],
  C: ['含羞草', '伯爵茶']
};

const HEART_NOTE_MAP = {     // Q2：中調（基準 50%）
  A: ['小蒼蘭', '金銀花'],
  B: ['橙花', '茉莉花'],
  C: ['天竺葵', '青草', '海洋']
};

const BASE_NOTE_MAP = {      // Q3：後調（基準 30%）
  A: ['檀香木', '白麝香'],
  B: ['零陵香豆', '香草'],
  C: ['鐵觀音', '麝香'] // 茶感
};

// ======================= 命名微調規則（±5%） =======================
// - 深沉/夜/木質/茶：後調+5%、中調-5%
// - 海洋/清新/花感：中調+5%、後調-5%
// 其餘不變
function getNameAdjustments(perfumeName) {
  const name = (perfumeName || '').toLowerCase();

  const deepKeys  = ['夜', '黑', 'noir', 'wood', '木', '檀', '茶', 'zen'];
  const freshKeys = ['海', 'wave', '潮', 'ocean', 'blue', '花', 'bloom', 'light', '清'];

  const hasDeep  = deepKeys.some(k => perfumeName.includes(k));
  const hasFresh = freshKeys.some(k => perfumeName.includes(k));

  if (hasDeep && !hasFresh)   return { heartDelta: -5, baseDelta: +5, reason: '深沉/木質/夜色/茶意' };
  if (hasFresh && !hasDeep)   return { heartDelta: +5, baseDelta: -5, reason: '海洋/清新/花感' };
  return { heartDelta: 0, baseDelta: 0, reason: null };
}

// ======================= 組內偏好分配（依命名） =======================
// 在同組內微調某材料的份量（不改變該組總 ml）
function biasWithinGroupByName(perfumeName, notes, weightsByMat) {
  const addBias = (targetMat, extraMl, groupMats) => {
    if (!groupMats || !groupMats.includes(targetMat)) return;
    const others = groupMats.filter(m => m !== targetMat);
    if (others.length === 0) return;
    const per = +(extraMl / others.length).toFixed(3);
    weightsByMat[targetMat] = +(weightsByMat[targetMat] + extraMl).toFixed(3);
    others.forEach(m => { weightsByMat[m] = +(weightsByMat[m] - per).toFixed(3); });
  };

  if (perfumeName.includes('茶') || perfumeName.toLowerCase().includes('tea')) {
    addBias('鐵觀音', 0.3, notes.base);
  }
  if (perfumeName.includes('木') || perfumeName.toLowerCase().includes('wood')) {
    addBias('檀香木', 0.3, notes.base);
  }
  if (perfumeName.includes('花') || perfumeName.toLowerCase().includes('bloom')) {
    addBias('茉莉花', 0.2, notes.heart);
    addBias('小蒼蘭', 0.2, notes.heart);
  }
}

// ======================= 依「答案內容」計算比例微調（正向語意） =======================
// 由三題的意象加總出前/中/後的加權，再與命名微調合併
function getAnswerAdjustments(answerValues) {
  const delta = { top: 0, heart: 0, base: 0 };
  const reasons = [];

  // Q1：場景藏身 → 對「開場氣息/延展」的傾向
  const q1 = (answerValues[0] || '').toUpperCase();
  if (q1 === 'A') { delta.top += 5; reasons.push('你在起點選擇了「迅速而明亮的開場」，提升前調帶出俐落第一印象。'); }
  if (q1 === 'B') { delta.heart += 3; delta.base += 2; reasons.push('你傾向「流動與綠意的穩定」，強化中調連續性，並給予基底些許延伸。'); }
  if (q1 === 'C') { delta.base += 5; reasons.push('你擁抱「靜穩與深度」，讓後調更具留香層次。'); }

  // Q2：珍寶象徵 → 對「情感主體」的傾向
  const q2 = (answerValues[1] || '').toUpperCase();
  if (q2 === 'A') { delta.heart += 5; reasons.push('你以「溫柔柔軟」作為核心，強化中調花香/主體。'); }
  if (q2 === 'B') { delta.top += 2; delta.heart += 3; reasons.push('你偏向「清晰與條理」，前調更俐落，同時穩住中調脈絡。'); }
  if (q2 === 'C') { delta.base += 3; delta.heart += 2; reasons.push('你選了「帶著記憶的餘韻」，後調更綿長，中調更有溫度。'); }

  // Q3：旋律 → 對「結尾情緒」的傾向
  const q3 = (answerValues[2] || '').toUpperCase();
  if (q3 === 'A') { delta.top += 3; reasons.push('你偏好「俏皮而乾淨」的節奏，再給前調一些亮度。'); }
  if (q3 === 'B') { delta.base += 5; reasons.push('你的旋律選擇帶來張力與深沉，使後調獲得更豐富的延展。'); }
  if (q3 === 'C') { delta.base += 3; delta.heart += 2; reasons.push('你選擇「溫柔惆悵的回望」，基底更沉著，中調更有情緒線。'); }

  return { delta, reasons };
}

// ======================= 比例正規化到 100% =======================
function normalizeRatios(r) {
  const sum = r.top + r.heart + r.base;
  if (sum === 100) return r;
  const scale = 100 / sum;
  return {
    top:   Math.max(0, +(r.top   * scale).toFixed(2)),
    heart: Math.max(0, +(r.heart * scale).toFixed(2)),
    base:  Math.max(0, +(r.base  * scale).toFixed(2)),
  };
}

// ======================= 香水配方計算（ml，總量預設 6 ml） =======================
function getPerfumeFormula(answerValues, totalMl = 6, ratioOverride = null) {
  if (!Array.isArray(answerValues) || answerValues.length !== 3) {
    throw new Error('❌ 答案應為長度 3 的字母陣列');
  }

  const [q1, q2, q3] = answerValues.map(a => a.toUpperCase());
  const notes = {
    top:   TOP_NOTE_MAP[q1]   || [],
    heart: HEART_NOTE_MAP[q2] || [],
    base:  BASE_NOTE_MAP[q3]  || []
  };

  // 1) 命名之後會傳進來的基準（或預設 20/50/30）
  let ratio = ratioOverride || { top: 20, heart: 50, base: 30 };

  // 2) 由「答案」帶來的比例微調
  const answerAdj = getAnswerAdjustments(answerValues);
  ratio = {
    top:   ratio.top   + answerAdj.delta.top,
    heart: ratio.heart + answerAdj.delta.heart,
    base:  ratio.base  + answerAdj.delta.base
  };

  // 3) 正規化（避免總和≠100）
  ratio = normalizeRatios(ratio);

  // 4) 轉換為 ml，並平均到同組內的材料
  const weights = {};
  for (const noteType of ['top', 'heart', 'base']) {
    const groupVol = +(totalMl * ratio[noteType] / 100).toFixed(3);
    const materials = notes[noteType];
    if (!materials || materials.length === 0) continue;
    const eachBase = +(groupVol / materials.length).toFixed(3);
    let residual = +(groupVol - eachBase * materials.length).toFixed(3);
    materials.forEach((mat, idx) => {
      weights[mat] = +(eachBase + (idx === 0 ? residual : 0)).toFixed(3);
    });
  }

  return {
    notes,
    ratio,
    weights,
    total: totalMl,
    unit: 'ml',
    answerReasons: answerAdj.reasons
  };
}

// ======================= 分析式 Summary（正向描述 + 實際 ml） =======================
function buildResultSummary(result, perfumeName, nameAdjInfo) {
  const { ratio, total, notes, weights, answerReasons } = result;

  // 找出每組的主角香材（該組中重量最大者）
  const pickHero = (arr) => {
    if (!arr || arr.length === 0) return null;
    return arr.map(m => ({ m, w: weights[m] || 0 }))
              .sort((a,b) => b.w - a.w)[0];
  };
  const heroTop   = pickHero(notes.top);
  const heroHeart = pickHero(notes.heart);
  const heroBase  = pickHero(notes.base);

  // 命名微調描述
  const nameLine = (nameAdjInfo && (nameAdjInfo.heartDelta !== 0 || nameAdjInfo.baseDelta !== 0))
    ? `因為「${perfumeName}」這個名字帶出 ${nameAdjInfo.reason}，系統進一步微調比例，使香氣更貼近命名意象。`
    : `命名沒有帶來額外強烈偏好，因此以你作答的氣味方向作為主要依據。`;

  // 各組實際 ml
  const groupMl = {
    top:   +(total * ratio.top   / 100).toFixed(3),
    heart: +(total * ratio.heart / 100).toFixed(3),
    base:  +(total * ratio.base  / 100).toFixed(3),
  };

  const lines = [
    ...answerReasons,
    nameLine,
    `因此本次的層次分配為：前調 ${ratio.top}%（${groupMl.top} ml）、中調 ${ratio.heart}%（${groupMl.heart} ml）、後調 ${ratio.base}%（${groupMl.base} ml），總量 ${total} ml。`,
    `主角香材亮點：` +
      `${heroTop ? `前調以「${heroTop.m}」更顯醒神` : '前調清爽開啟' }、` +
      `${heroHeart ? `中調以「${heroHeart.m}」連結情緒` : '中調柔和承接' }、` +
      `${heroBase ? `後調由「${heroBase.m}」延展餘韻` : '後調沉穩收束' }，` +
      `共同構成專屬的氣味敘事。`
  ];

  return lines.map(t => `<p>${t}</p>`).join('');
}

// ======================= 一般配方區塊渲染（ml 顯示） =======================
function renderPerfumeFormula(result) {
  const { notes, ratio, weights, total, unit } = result;
  const listHtml = (arr) => arr.map(mat => `<li>${mat}：${(weights[mat] ?? 0).toFixed(3)} ${unit}</li>`).join('');

  return `
    <div class="perfume-formula">
      <h3>✨ 你的專屬香水配方 ✨</h3>
      <p class="formula-total">總重量：${total} ${unit}</p>

      <div class="formula-section">
        <h4>▸ 前調（${ratio.top}%）</h4>
        <ul class="formula-list">${listHtml(notes.top)}</ul>
      </div>

      <div class="formula-section">
        <h4>▸ 中調（${ratio.heart}%）</h4>
        <ul class="formula-list">${listHtml(notes.heart)}</ul>
      </div>

      <div class="formula-section">
        <h4>▸ 後調（${ratio.base}%）</h4>
        <ul class="formula-list">${listHtml(notes.base)}</ul>
      </div>
    </div>
  `;
}

// ======================= 配方卡格式渲染（顯示 ml + 總重量 6 ml） =======================
function renderCardFormula(result) {
  const { notes, ratio, weights, total, unit } = result;
  const mkList = (arr) => arr.map(mat =>
    `<li><span class="material-name">${mat}</span><span class="material-weight">${(weights[mat] ?? 0).toFixed(3)}${unit}</span></li>`
  ).join('');

  let html = '<div class="formula-grid">';
  html += `
    <div class="formula-card-section">
      <h4>前調 ${ratio.top}%</h4>
      <ul class="formula-card-list">${mkList(notes.top)}</ul>
    </div>
  `;
  html += `
    <div class="formula-card-section">
      <h4>中調 ${ratio.heart}%</h4>
      <ul class="formula-card-list">${mkList(notes.heart)}</ul>
    </div>
  `;
  html += `
    <div class="formula-card-section">
      <h4>後調 ${ratio.base}%</h4>
      <ul class="formula-card-list">${mkList(notes.base)}</ul>
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

// ======================= 生成配方卡（動態比例 + 分析說明 + 6 ml） =======================
function generatePerfumeCard() {
  const perfumeName = document.getElementById('perfume-name-input').value.trim();
  if (!perfumeName) { alert('請輸入香水名稱！'); return; }

  try {
    // 1) 先用命名做中/後調 ±5% 微調
    const nameAdj = getNameAdjustments(perfumeName);
    let baseRatio = { top: 20, heart: 50 + nameAdj.heartDelta, base: 30 + nameAdj.baseDelta };
    baseRatio = normalizeRatios(baseRatio);

    // 2) 依「答案 + 命名後基準」計算比例與 ml
    const perfumeResult = getPerfumeFormula(answerValues, 6, baseRatio);

    // 3) 組內偏好分配（茶/木/花等）
    biasWithinGroupByName(perfumeName, perfumeResult.notes, perfumeResult.weights);

    // 4) 分析式 Summary
    const richSummaryHTML = buildResultSummary(perfumeResult, perfumeName, nameAdj);

    // 5) 卡片輸出
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
