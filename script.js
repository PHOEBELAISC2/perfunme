<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Perfume Story Quiz</title>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <style>
    :root{
      --bg:#0e0f1a; --panel:#151735; --panel-2:#1a1d42;
      --text:#f6f7fb; --muted:#aab0d6; --accent:#c1d7ff;
      --brand:#7aa2ff; --good:#7ee787;
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0; background: radial-gradient(1200px 600px at 50% -100px, #1b1e4a 0%, var(--bg) 50%, #0b0c17 100%);
      color:var(--text); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",Arial,sans-serif;
      display:flex; align-items:center; justify-content:center; padding:20px;
    }
    .app{width:min(860px,100%); background:linear-gradient(180deg,var(--panel),var(--panel-2));
      border:1px solid rgba(255,255,255,.06); border-radius:24px; box-shadow:0 20px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04); overflow:hidden}
    header{padding:18px 24px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; gap:12px; align-items:center}
    header .dot{width:10px;height:10px;border-radius:50%;background:var(--brand);box-shadow:0 0 12px var(--brand)}
    header h1{font-size:18px;margin:0;letter-spacing:.5px;font-weight:700}
    main{padding:24px}
    .hidden{display:none!important}

    #cover-page{text-align:center; padding:60px 16px 52px}
    .cover-title{font-size:28px;margin:0 0 12px}
    .cover-desc{color:var(--muted);margin:0 0 28px}
    .start-btn{display:inline-flex;gap:10px;align-items:center;padding:14px 20px;border-radius:14px;background:linear-gradient(180deg,#2a44b8,#152265);border:1px solid rgba(255,255,255,.12);color:#fff;font-weight:700;cursor:pointer}
    .start-btn:hover{filter:brightness(1.08)}
    .hint{margin-top:14px;color:var(--muted);font-size:13px}

    #question-container .card{background:rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.06); border-radius:18px; overflow:hidden}
    .q-head{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.06)}
    #question-title{margin:0 0 6px;font-size:20px}
    #question-text{margin:0;color:var(--accent);line-height:1.6}
    .scene-wrap{position:relative; padding:10px}
    .scene-svg{width:100%;height:auto;border-radius:14px;display:block}
    .hotspot{fill:rgba(122,162,255,.18);stroke:#7aa2ff;stroke-width:2;rx:6;ry:6;cursor:pointer;transition:.15s ease}
    .hotspot:hover{fill:rgba(122,162,255,.28)}
    .hotspot.clicked{fill:rgba(126,231,135,.28);stroke:var(--good)}

    .instruction-text{margin:14px 6px 6px;color:var(--muted)}
    .music-selection{display:flex;flex-wrap:wrap;gap:10px;margin:8px 6px 14px}
    .music-button{padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--text);cursor:pointer}
    .music-button.playing{outline:2px solid var(--brand)}
    .music-button.selected{background:rgba(122,162,255,.15)}
    .confirm-button{margin:0 6px 14px;padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(180deg,#2a44b8,#152265);color:#fff;cursor:pointer}
    .confirm-button:disabled{opacity:.5;cursor:not-allowed}

    #result-container .card{background:rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.06); border-radius:18px}
    .choices{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.06)}
    .choice-item{padding:8px 0}
    .choice-item h3{margin:0 0 4px; font-size:16px}
    .choice-item p{margin:0;color:var(--muted)}

    .perfume-naming{padding:18px}
    .perfume-naming h3{margin:0 0 10px}
    .perfume-naming input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:var(--text);margin-bottom:12px}
    .generate-btn{padding:12px 16px;border-radius:12px;background:linear-gradient(180deg,#2a44b8,#152265);border:1px solid rgba(255,255,255,.12);color:#fff;font-weight:700;cursor:pointer}
    .generate-btn:hover{filter:brightness(1.07)}

    #perfume-card-container{padding:16px}
    .perfume-card{margin:auto;max-width:680px;background: radial-gradient(1200px 300px at 50% -180px,#2b2f73 0%,#1a1a2e 55%,#121325 100%);color:#fff;border-radius:22px;border:1px solid rgba(255,255,255,.08);box-shadow:0 16px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06);padding:22px}
    .card-header h2{margin:0 0 6px;letter-spacing:.6px}
    .card-subtitle{margin:0;color:var(--muted)}
    .formula-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin:14px 0 8px}
    .formula-card-section{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px}
    .formula-card-section h4{margin:0 0 8px}
    .formula-card-list{list-style:none;padding:0;margin:0}
    .formula-card-list li{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,.08)}
    .formula-card-list li:last-child{border-bottom:none}
    .material-name{color:#e6e9ff}
    .material-weight{color:#b9c2ff}
    .formula-total-weight{color:var(--muted);margin:6px 0 0}
    .card-footer{margin-top:10px;display:flex;justify-content:space-between;color:var(--muted);font-size:13px}

    .share-buttons{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 0;justify-content:center}
    .share-btn{display:inline-flex;gap:8px;align-items:center;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--text);cursor:pointer}

    .toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(20px);background:#222a;color:#fff;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.2);opacity:0;transition:.25s;backdrop-filter:blur(6px);z-index:9999}
    .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

    .toolbar{padding:12px;display:flex;justify-content:flex-end}
    .restart-btn{padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--text);cursor:pointer}

    @media (max-width:560px){.cover-title{font-size:24px}#question-text{font-size:14px}}
  </style>
</head>
<body>
  <div class="app" id="app">
    <header>
      <div class="dot"></div>
      <h1>AI Perfume Story Quiz</h1>
    </header>

    <main>
      <!-- Cover -->
      <section id="cover-page">
        <h2 class="cover-title">在迷宮、繩橋與天空之聲之間，找到你的氣味</h2>
        <p class="cover-desc">完成 3 個情境問題；系統會按你的選擇與香水命名，微調前中後調比例及各香材份量（總量 6 ml）。</p>
        <button class="start-btn" id="start-btn">▶ 開始旅程</button>
        <div class="hint">貼士：香水名稱會影響配方的微調喔！</div>
      </section>

      <!-- Questions -->
      <section id="question-container" class="hidden">
        <div class="card">
          <div class="q-head">
            <h3 id="question-title"></h3>
            <p id="question-text"></p>
          </div>
          <div class="scene-wrap">
            <div id="scene"></div>
            <div id="music-player" class="hidden">
              <audio id="audio-player" controls preload="auto"></audio>
            </div>
          </div>
        </div>
        <div class="toolbar">
          <button id="restart-btn" class="restart-btn">↺ 重新開始</button>
        </div>
      </section>

      <!-- Results -->
      <section id="result-container" class="hidden">
        <div class="card">
          <div class="choices" id="result-content"></div>
        </div>
      </section>
    </main>
  </div>

  <script>
  // ---------------- 問題資料 ----------------
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
        { id: 'door',    text: '一扇半掩的木門後',     value: 'A', x: 150, y: 260, w: 140, h: 260 },
        { id: 'passage', text: '一段濕冷的綠牆通道',     value: 'B', x: 480, y: 260, w: 130, h: 240 },
        { id: 'storage', text: '地下貯藏室',             value: 'C', x: 495, y: 555, w: 120, h: 140 }
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
        { id: 'doll',     text: '一隻破布偶',           value: 'A', x: 295, y: 680, w: 80, h: 85 },
        { id: 'notebook', text: '一本舊筆記本',         value: 'B', x: 470, y: 700, w: 55, h: 55 },
        { id: 'photo',    text: '一張撕掉角的照片',     value: 'C', x: 422, y: 695, w: 33, h: 40 }
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
        { id: 'pink', text: 'Pink Soldiers',  audio: 'Pink Soldiers.mp3', value: 'A' },
        { id: 'rope', text: 'The Rope is Tied', audio: 'The Rope is Tied  Squid Game OST.mp3', value: 'B' },
        { id: 'way',  text: 'Way Back Then',  audio: 'Way Back then.mp3', value: 'C' }
      ]
    }
  ];

  // ---------- 香料對應表 ----------
  const TOP_NOTE_MAP = {       // Q1：前調
    A: ['香檸檬', '桂花'],
    B: ['無花果', '白葡萄酒'],
    C: ['含羞草', '伯爵茶']
  };
  const HEART_NOTE_MAP = {     // Q2：中調
    A: ['小蒼蘭', '金銀花'],
    B: ['橙花', '茉莉花'],
    C: ['天竺葵', '青草', '海洋']
  };
  const BASE_NOTE_MAP = {      // Q3：後調
    A: ['檀香木', '白麝香'],
    B: ['零陵香豆', '香草'],
    C: ['鐵觀音', '麝香']
  };

  // ---------- DOM ----------
  const coverPage = document.getElementById('cover-page');
  const startBtn = document.getElementById('start-btn');
  const questionContainer = document.getElementById('question-container');
  const resultContainer = document.getElementById('result-container');
  const questionTitle = document.getElementById('question-title');
  const questionText = document.getElementById('question-text');
  const scene = document.getElementById('scene');
  const musicPlayer = document.getElementById('music-player');
  const audioPlayer = document.getElementById('audio-player');
  const resultContent = document.getElementById('result-content');
  const restartBtn = document.getElementById('restart-btn');

  // ---------- 狀態 ----------
  let currentQuestion = 0;
  let answers = [];
  let answerValues = []; // [A|B|C, A|B|C, A|B|C]
  let currentAudio = null;
  let selectedMusicOption = null;

  document.addEventListener('DOMContentLoaded', () => {
    startBtn.addEventListener('click', startGame);
    coverPage.addEventListener('click', e => { if (e.target !== startBtn) startGame(); });
    restartBtn.addEventListener('click', restart);
  });

  function startGame(){
    coverPage.classList.add('hidden');
    questionContainer.classList.remove('hidden');
    currentQuestion = 0;
    answers = [];
    answerValues = [];
    showQuestion();
  }

  function showQuestion(){
    if (currentQuestion >= questions.length) { showResult(); return; }
    const q = questions[currentQuestion];
    questionTitle.textContent = q.title;
    const formattedText = q.text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    questionText.innerHTML = formattedText;
    scene.innerHTML = '';
    musicPlayer.classList.add('hidden');
    if (currentAudio){ audioPlayer.pause(); currentAudio = null; }

    if (q.type === 'clickable') createSVGScene(q);
    else if (q.type === 'music') createMusicOptions(q);
  }

  function createSVGScene(q){
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${q.width} ${q.height}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.classList.add('scene-svg');

    const img = document.createElementNS(NS, 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink','href', q.image);
    img.setAttribute('width', q.width); img.setAttribute('height', q.height);
    svg.appendChild(img);

    q.options.forEach(opt=>{
      const r = document.createElementNS(NS,'rect');
      r.setAttribute('x',opt.x); r.setAttribute('y',opt.y);
      r.setAttribute('width',opt.w); r.setAttribute('height',opt.h);
      r.classList.add('hotspot'); r.setAttribute('data-option',opt.id); r.setAttribute('title',opt.text);
      r.addEventListener('click',()=>handleAnswer(opt));
      svg.appendChild(r);
    });

    if (q.id === 2){
      const t = document.createElementNS(NS,'text');
      t.setAttribute('x','384'); t.setAttribute('y','650');
      t.setAttribute('text-anchor','middle');
      t.setAttribute('font-family','-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif');
      t.setAttribute('font-size','20'); t.setAttribute('font-weight','bold'); t.setAttribute('fill','white');
      t.textContent = '請選擇，你無法放手的珍寶';
      svg.appendChild(t);
    }
    scene.appendChild(svg);
  }

  function createMusicOptions(q){
    const NS='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox',`0 0 ${q.width} ${q.height}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.classList.add('scene-svg');
    const img=document.createElementNS(NS,'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink','href', q.image);
    img.setAttribute('width',q.width); img.setAttribute('height',q.height);
    svg.appendChild(img);
    scene.appendChild(svg);

    const tip=document.createElement('div'); tip.className='instruction-text'; tip.textContent='可選的按鍵，逐一聆聽：'; scene.appendChild(tip);
    const box=document.createElement('div'); box.className='music-selection';

    q.options.forEach(opt=>{
      const btn=document.createElement('button'); btn.className='music-button'; btn.textContent=opt.text;
      btn.addEventListener('click',(ev)=>handleMusicChoice(opt,ev));
      box.appendChild(btn);
    });

    const ok=document.createElement('button'); ok.className='confirm-button'; ok.textContent='確認選擇'; ok.disabled=true;
    ok.addEventListener('click',confirmMusicSelection);
    scene.appendChild(box); scene.appendChild(ok);

    setTimeout(()=>ok.scrollIntoView({block:'end',behavior:'smooth'}),100);
  }

  function handleAnswer(opt){
    const el=document.querySelector(`[data-option="${opt.id}"]`); if (el) el.classList.add('clicked');
    answers.push({question:questions[currentQuestion].title, answer:opt.text});
    answerValues.push(opt.value);
    setTimeout(()=>{ currentQuestion++; showQuestion(); }, 500);
  }

  function handleMusicChoice(opt,ev){
    if (currentAudio){
      audioPlayer.pause();
      document.querySelectorAll('.music-button').forEach(b=>b.classList.remove('playing','selected'));
    }
    audioPlayer.src = opt.audio;
    ev.target.classList.add('playing','selected');
    audioPlayer.play();
    currentAudio = opt.audio;
    selectedMusicOption = opt;
    const ok=document.querySelector('.confirm-button'); if (ok) ok.disabled=false;
  }

  function confirmMusicSelection(){
    if (!selectedMusicOption) return;
    answers.push({question:questions[currentQuestion].title, answer:selectedMusicOption.text});
    answerValues.push(selectedMusicOption.value);
    if (currentAudio) audioPlayer.pause();
    selectedMusicOption = null;
    currentQuestion++; showQuestion();
  }

  function showResult(){
    questionContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    if (currentAudio) audioPlayer.pause();

    let html = '<div class="choice-list">';
    answers.forEach(a=>{
      html += `<div class="choice-item"><h3>${a.question}</h3><p>你的選擇：${a.answer}</p></div>`;
    });
    html += `</div>
      <div class="perfume-naming">
        <h3>為你的香水命名</h3>
        <input type="text" id="perfume-name-input" placeholder="輸入香水名稱..." maxlength="30">
        <button id="generate-perfume-btn" class="generate-btn">生成配方卡</button>
      </div>
      <div id="perfume-card-container" class="hidden"></div>`;
    resultContent.innerHTML = html;
    document.getElementById('generate-perfume-btn').addEventListener('click', generatePerfumeCard);
  }

  function restart(){
    currentQuestion=0; answers=[]; answerValues=[]; currentAudio=null; selectedMusicOption=null;
    questionContainer.classList.add('hidden'); resultContainer.classList.add('hidden'); coverPage.classList.remove('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // ---------- 名稱 → 標籤 ----------
  function parseTagsFromName(raw){
    const s=(raw||'').toLowerCase(); const has = arr => arr.some(k=>s.includes(k));
    return {
      citrus:  has(['citrus','lemon','bergamot','晨','朝','光','晴','亮']),
      floral:  has(['floral','flower','花','花園','花語','花雨','瓣']),
      woody:   has(['wood','woody','木','森林','森','林']),
      sweet:   has(['sweet','vanilla','糖','蜜','甜']),
      musk:    has(['musk','麝','夜','暗','黑']),
      aquatic: has(['sea','ocean','wave','潮','浪','海','潟','藍']),
      green:   has(['green','草','葉','苔','雨','霧']),
      tea:     has(['tea','伯爵','鐵觀音','禪','茶']),
    };
  }

  // ---------- 由選項 → 標籤（氣質） ----------
  function tagsFromChoices(q1,q2,q3){
    const t={citrus:false,floral:false,woody:false,sweet:false,musk:false,aquatic:false,green:false,tea:false};
    // Q1 場景
    if (q1==='A') { t.citrus=true; }
    if (q1==='B') { t.green=true;  t.aquatic=true; }
    if (q1==='C') { t.tea=true;    t.musk=true; t.woody=true; }
    // Q2 物件
    if (q2==='A') { t.sweet=true; }
    if (q2==='B') { t.green=true; }
    if (q2==='C') { t.musk=true; }
    // Q3 音樂
    if (q3==='A') { t.citrus=true; t.musk=true; }
    if (q3==='B') { t.musk=true;   t.woody=true; }
    if (q3==='C') { t.floral=true; }
    return t;
  }

  // ---------- 小幅移動配比點數 ----------
  function shiftRatio(r, from, to, pts){ const o={...r}; const take=Math.min(pts,o[from]); o[from]-=take; o[to]+=take; return o; }

  // ---------- 依焦點名單重新分配一組內部重量 ----------
  function biasGroupWeights(materials, groupWeight, focusNames, bonus=0.2){
    if (!materials || materials.length===0) return {};
    const baseEach = groupWeight / materials.length;
    const focusSet = new Set(materials.filter(m=>focusNames.includes(m)));
    if (focusSet.size===0) return Object.fromEntries(materials.map(m=>[m, +baseEach.toFixed(3)]));
    let rawTotal=0; const w={};
    materials.forEach(m=>{
      const mul = focusSet.has(m) ? (1+bonus) : 1;
      w[m] = baseEach*mul; rawTotal += w[m];
    });
    const k = groupWeight / rawTotal;
    materials.forEach(m=> w[m] = +(w[m]*k).toFixed(3));
    return w;
  }

  // ---------- 選項 → 具體香材偏好（同組內傾斜目標） ----------
  const CHOICE_FOCUS = {
    Q1: {
      A: ['香檸檬','桂花'],
      B: ['無花果','白葡萄酒'],
      C: ['含羞草','伯爵茶']
    },
    Q2: {
      A: ['小蒼蘭','金銀花'],
      B: ['橙花','茉莉花'],
      C: ['天竺葵','青草','海洋']
    },
    Q3: {
      A: ['白麝香','檀香木'],
      B: ['麝香','檀香木','香草'],
      C: ['鐵觀音','禪茶','零陵香豆']
    }
  };

  // ---------- 名稱標籤 & 選項標籤 → 比例微調 ----------
  function applyRatioNudges(baseRatio, tagFromName, tagFromChoices){
    let r = {...baseRatio};

    // 先用選項標籤
    if (tagFromChoices.woody || tagFromChoices.musk) r = shiftRatio(r,'top','base',5);
    if (tagFromChoices.citrus)                        r = shiftRatio(r,'base','top',5);
    if (tagFromChoices.floral)                        r = shiftRatio(r,'base','heart',5);
    if (tagFromChoices.aquatic || tagFromChoices.green) r = shiftRatio(r,'base','heart',3);
    if (tagFromChoices.sweet)                         r = shiftRatio(r,'heart','base',3);
    if (tagFromChoices.tea)                           r = shiftRatio(r,'base','top',2);

    // 再用名稱標籤
    if (tagFromName.woody || tagFromName.musk) r = shiftRatio(r,'top','base',3);
    if (tagFromName.citrus)                    r = shiftRatio(r,'base','top',3);
    if (tagFromName.floral)                    r = shiftRatio(r,'base','heart',3);
    if (tagFromName.aquatic || tagFromName.green) r = shiftRatio(r,'base','heart',2);
    if (tagFromName.sweet)                     r = shiftRatio(r,'heart','base',2);
    if (tagFromName.tea)                       r = shiftRatio(r,'base','top',1);

    // 夾限與正規化
    const clamp = v => Math.max(5, Math.min(80, v));
    r.top=clamp(r.top); r.heart=clamp(r.heart); r.base=clamp(r.base);
    const s=r.top+r.heart+r.base;
    r.top=Math.round((r.top/s)*100);
    r.heart=Math.round((r.heart/s)*100);
    r.base=100-r.top-r.heart;
    return r;
  }

  // ---------- 主配方：同時考慮選項 + 名稱 ----------
  function getPerfumeFormulaChoiceAndName(answerValues, totalMl=6, nickname=''){
    if (!Array.isArray(answerValues) || answerValues.length !== 3) {
      throw new Error('❌ 答案應為長度 3 的字母陣列');
    }
    const [q1,q2,q3] = answerValues.map(x=>x.toUpperCase());
    const notes = {
      top:   TOP_NOTE_MAP[q1]   || [],
      heart: HEART_NOTE_MAP[q2] || [],
      base:  BASE_NOTE_MAP[q3]  || []
    };

    // 基礎比例（20/50/30），由「選項標籤」與「名稱標籤」輕推
    const tagsChoice = tagsFromChoices(q1,q2,q3);
    const tagsName   = parseTagsFromName(nickname);
    const ratio = applyRatioNudges({top:20,heart:50,base:30}, tagsName, tagsChoice);

    // 各組重量
    const groupWeight = {
      top:   +(totalMl * ratio.top   / 100).toFixed(3),
      heart: +(totalMl * ratio.heart / 100).toFixed(3),
      base:  +(totalMl * ratio.base  / 100).toFixed(3),
    };

    // 先依選項對應的焦點材料作偏重，後再用名稱標籤補微調
    const focusTopFromQ1   = (CHOICE_FOCUS.Q1[q1] || []);
    const focusHeartFromQ2 = (CHOICE_FOCUS.Q2[q2] || []);
    const focusBaseFromQ3  = (CHOICE_FOCUS.Q3[q3] || []);

    // 名稱標籤對焦
    const NAME_FOCUS = {
      top: [
        ...(tagsName.citrus ? ['香檸檬'] : []),
        ...(tagsName.floral ? ['桂花'] : []),
        ...(tagsName.tea    ? ['伯爵茶'] : []),
        ...(tagsName.green  ? ['無花果'] : []),
      ],
      heart: [
        ...(tagsName.floral ? ['小蒼蘭','橙花','茉莉花','金銀花','天竺葵'] : []),
        ...(tagsName.green  ? ['青草'] : []),
        ...(tagsName.aquatic? ['海洋'] : []),
      ],
      base: [
        ...(tagsName.woody  ? ['檀香木','紅木'] : []),
        ...(tagsName.sweet  ? ['香草','零陵香豆'] : []),
        ...(tagsName.musk   ? ['白麝香','麝香'] : []),
        ...(tagsName.tea    ? ['鐵觀音','禪茶'] : []),
      ]
    };

    // 合併焦點清單（選項優先，名稱補強）
    const FOCUS = {
      top:   Array.from(new Set([...focusTopFromQ1,   ...NAME_FOCUS.top])),
      heart: Array.from(new Set([...focusHeartFromQ2, ...NAME_FOCUS.heart])),
      base:  Array.from(new Set([...focusBaseFromQ3,  ...NAME_FOCUS.base])),
    };

    // 組內重新分配（小幅傾向焦點）
    const wTop   = biasGroupWeights(notes.top,   groupWeight.top,   FOCUS.top,   0.20);
    const wHeart = biasGroupWeights(notes.heart, groupWeight.heart, FOCUS.heart, 0.20);
    const wBase  = biasGroupWeights(notes.base,  groupWeight.base,  FOCUS.base,  0.20);

    const weights = {...wTop, ...wHeart, ...wBase};

    return { notes, ratio, weights, total: totalMl, nickname, q: [q1,q2,q3] };
  }

  // ---------- 渲染配方卡 ----------
  function renderCardFormula(result){
    const { notes, ratio, weights, total } = result;
    let html = '<div class="formula-grid">';
    html += `
      <div class="formula-card-section">
        <h4>前調 ${ratio.top}%</h4>
        <ul class="formula-card-list">
          ${notes.top.map(m=>`<li><span class="material-name">${m}</span><span class="material-weight">${weights[m].toFixed(3)}g</span></li>`).join('')}
        </ul>
      </div>`;
    html += `
      <div class="formula-card-section">
        <h4>中調 ${ratio.heart}%</h4>
        <ul class="formula-card-list">
          ${notes.heart.map(m=>`<li><span class="material-name">${m}</span><span class="material-weight">${weights[m].toFixed(3)}g</span></li>`).join('')}
        </ul>
      </div>`;
    html += `
      <div class="formula-card-section">
        <h4>後調 ${ratio.base}%</h4>
        <ul class="formula-card-list">
          ${notes.base.map(m=>`<li><span class="material-name">${m}</span><span class="material-weight">${weights[m].toFixed(3)}g</span></li>`).join('')}
        </ul>
      </div>`;
    html += '</div>';
    html += `<p class="formula-total-weight">總重量：${total} g</p>`;
    return html;
  }

  // ---------- 生成配方卡 ----------
  function generatePerfumeCard(){
    const perfumeName = document.getElementById('perfume-name-input').value.trim();
    if (!perfumeName){ alert('請輸入香水名稱！'); return; }
    try{
      const result = getPerfumeFormulaChoiceAndName(answerValues, 6, perfumeName);
      const cardHTML = `
        <div id="perfume-card" class="perfume-card">
          <div class="card-header">
            <h2>${escapeHTML(perfumeName)}</h2>
            <p class="card-subtitle">專屬配方卡</p>
          </div>
          <div class="card-content">
            ${renderCardFormula(result)}
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
        </div>`;
      const box = document.getElementById('perfume-card-container');
      box.innerHTML = cardHTML; box.classList.remove('hidden');
      document.querySelector('.perfume-naming').style.display='none';
      document.getElementById('copy-link-btn').addEventListener('click', copyLink);
      document.getElementById('download-png-btn').addEventListener('click', downloadPNG);
      document.getElementById('share-fb-btn').addEventListener('click', shareToFacebook);
      box.scrollIntoView({behavior:'smooth',block:'center'});
    }catch(e){
      console.error(e); alert('配方生成失敗，請重試！');
    }
  }

  // ---------- 分享 / 匯出 ----------
  function copyLink(){
    const name = document.getElementById('perfume-name-input').value.trim();
    const url = window.location.href;
    const text = `我創造了專屬香水「${name}」！來試試創造你的香水故事：${url}`;
    navigator.clipboard.writeText(text).then(()=>showToast('連結已複製！')).catch(()=>{
      const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); showToast('連結已複製！');
    });
  }

  async function downloadPNG(){
    const card = document.getElementById('perfume-card');
    const name = (document.getElementById('perfume-name-input').value.trim() || '我的香水');
    try{
      showToast('正在生成圖片...');
      const canvas = await html2canvas(card,{backgroundColor:'#1a1a2e',scale:2,logging:false});
      canvas.toBlob(blob=>{
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a'); a.download = `${name}_配方卡.png`; a.href=url; a.click(); URL.revokeObjectURL(url);
        showToast('圖片已下載！');
      });
    }catch(e){ console.error(e); showToast('圖片生成失敗，請重試！'); }
  }

  function shareToFacebook(){
    const name = document.getElementById('perfume-name-input').value.trim();
    const u = encodeURIComponent(window.location.href);
    const q = encodeURIComponent(`我創造了專屬香水「${name}」！`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${q}`,'_blank','width=600,height=400');
  }

  // ---------- 小工具 ----------
  function showToast(msg){
    const ex=document.querySelector('.toast'); if (ex) ex.remove();
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
    setTimeout(()=>t.classList.add('show'),10);
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); },3000);
  }
  function escapeHTML(s){return (s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  </script>
</body>
</html>
