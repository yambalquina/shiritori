const app = document.querySelector("#app");

const symbols = ["○","△","□","▽","☆","◇","＋","◎","◐","×"];
const defaultNames = ["あなた","さくら","たくみ","けんた","みゆ","ゆうと","はるか","あおい","れん","まこと"];

const dictionary = [
  "りんご","ごりら","らっぱ","ぱんだ","だるま","まくら","らくだ",
  "だいこん","こあら","あさがお","ごぼう","うさぎ","ぎょうざ",
  "ざくろ","ろうそく","くじら","らんぷ","ぷりん","いるか","かめ",
  "めだか","からす","すいか","かもめ","めがね","ねこ","こま",
  "まり","りす","すずめ","ろけっと","とまと","とうふ","ふくろう",
  "うみ","みかん","かっぱ","ぱせり","ぼたん","たぬき","きつね",
  "ねずみ","みそ","そら","らじお","おにぎり","りょうり","うし",
  "しまうま","まつり","うどん","どらやき","しろくま"
];

let state = {
  screen:"menu",
  players:[],
  turn:0,
  history:[],
  currentWord:"りんご",
  message:"",
  gameOver:false
};

function normalizeWord(v){
  return v.trim().replace(/\s/g,"").replace(/[ァ-ン]/g, s =>
    String.fromCharCode(s.charCodeAt(0)-0x60)
  );
}

function firstKana(word){
  return word?.[0] || "";
}

function lastKana(word){
  if(!word) return "";
  const small = {
    "ゃ":"や","ゅ":"ゆ","ょ":"よ",
    "ぁ":"あ","ぃ":"い","ぅ":"う","ぇ":"え","ぉ":"お",
    "っ":"つ","ー":""
  };
  let c = word[word.length - 1];
  if(c === "ー" && word.length > 1) c = word[word.length - 2];
  return small[c] || c;
}

function isKnown(word){
  return dictionary.includes(word);
}

function validNext(word){
  const prev = state.history.at(-1)?.word || state.currentWord;
  if(!word) return "言葉を入力してください。";
  if(firstKana(word) !== lastKana(prev)) return `「${lastKana(prev)}」から始めてください。`;
  if(state.history.some(x => x.word === word)) return "同じ言葉は使えません。";
  if(!isKnown(word)) return "辞書にない言葉です。唱え直し。";
  return "";
}

function cpuPick(){
  const prev = state.history.at(-1)?.word || state.currentWord;
  const key = lastKana(prev);
  const used = new Set(state.history.map(x => x.word));

  const candidates = dictionary.filter(w =>
    firstKana(w) === key &&
    !used.has(w) &&
    !w.endsWith("ん")
  );

  const ranked = candidates.map(w => {
    const next = lastKana(w);
    const humanOptions = dictionary.filter(x =>
      firstKana(x) === next &&
      !used.has(x) &&
      !x.endsWith("ん")
    ).length;
    return { word:w, score:humanOptions };
  }).sort((a,b) => a.score - b.score);

  return ranked[0]?.word || key + "ん";
}

function render(){
  if(state.screen === "menu") renderMenu();
  if(state.screen === "cpu") renderCpu();
  if(state.screen === "room") renderRoom();
  if(state.screen === "multi") renderMulti();
}

function top(title="", right="☰"){
  return `
    <div class="top">
      <button class="iconBtn" onclick="goMenu()">‹</button>
      <div class="title">${title}</div>
      <button class="iconBtn">${right}</button>
    </div>
  `;
}

function renderMenu(){
  app.innerHTML = `
    <div class="top">
      <button class="iconBtn">⚙</button>
      <span></span>
    </div>

    <section class="hero">
      <div class="copy">最後に「ん」をつけた人が負け。</div>
      <div class="logo">しりとり</div>
      <div class="ruleLine"></div>
    </section>

    <button class="cardBtn" onclick="startCpu()">
      <div class="mark">‹›</div>
      <div>
        <strong>PCと対戦</strong>
        <span>最強AIとしりとり</span>
      </div>
      <div class="chev">›</div>
    </button>

    <button class="cardBtn" onclick="setupRoom()">
      <div class="mark">○△</div>
      <div>
        <strong>みんなで対戦</strong>
        <span>最大10人で対戦</span>
      </div>
      <div class="chev">›</div>
    </button>

    <button class="cardBtn" onclick="alert('最後に「ん」をつけた人が負け。その場で作った言葉は唱え直し。')">
      <div class="mark">□</div>
      <div>
        <strong>ルール</strong>
        <span>しりとりのルール説明</span>
      </div>
      <div class="chev">›</div>
    </button>

    <div class="smallNav">
      <button class="pill">履歴・戦績</button>
    </div>
  `;
}

function startCpu(){
  state.screen = "cpu";
  state.players = [
    { name:"あなた", symbol:"○", alive:true },
    { name:"AI", symbol:"◇", alive:true }
  ];
  state.turn = 0;
  state.history = [{ player:"AI", word:"りんご" }];
  state.message = "あなたの番です。";
  state.gameOver = false;
  render();
}

function setupRoom(){
  state.screen = "room";
  state.players = defaultNames.slice(0,7).map((name,i) => ({
    name,
    symbol:symbols[i],
    alive:true
  }));
  render();
}

function startMulti(){
  state.screen = "multi";
  state.turn = 0;
  state.history = [{ player:"開始", word:"りんご" }];
  state.message = "あなたの番です。";
  state.gameOver = false;
  render();
}

function renderCpu(){
  const last = state.history.at(-1)?.word || "りんご";

  app.innerHTML = `
    ${top("PCと対戦","…")}

    <div class="panel" style="border:0;background:transparent;padding:6px 0">
      最強AI（えげつない）
      <span style="float:right">検証中…</span>
    </div>

    ${wordPanel(last, "あなたの番です")}
    ${historyPanel()}
    ${inputPanel("submitCpuWord()")}
    ${rulePanel()}
    ${gameOverModal()}
  `;
}

function renderRoom(){
  app.innerHTML = `
    ${top("みんなで対戦","☰")}

    <section class="panel" style="text-align:center;border:0;background:transparent">
      <div>ルームID　1234 5678　⧉</div>
      <p style="font-size:12px">このIDを友達に教えて、一緒に対戦しよう。</p>
    </section>

    <section class="panel">
      <h3>プレイヤー（最大10人）</h3>
      <div class="playersGrid">
        ${Array.from({length:10}).map((_,i) => {
          const p = state.players[i];
          return `
            <div class="playerCard">
              <div>
                <div class="symbol">${p?.symbol || "+"}</div>
                <div class="name">
                  ${p?.name || "待機中"}
                  ${i === 0 ? '<span class="host">ホスト</span>' : ""}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </section>

    <section class="panel">
      <h3>ゲーム設定</h3>
      <div class="settingRow"><span>◷　制限時間</span><strong>10秒 ›</strong></div>
      <div class="settingRow"><span>ⓘ　禁止ワード</span><strong>ON ›</strong></div>
      <button class="primary" style="width:100%;margin-top:18px" onclick="startMulti()">準備完了</button>
      <p style="text-align:center;font-size:12px">全員が「準備完了」になると開始できます</p>
    </section>
  `;
}

function renderMulti(){
  const alive = state.players.filter(p => p.alive).length;
  const last = state.history.at(-1)?.word || "りんご";

  app.innerHTML = `
    ${top("みんなで対戦", `${alive}人 / ${state.players.length}人`)}

    <div class="gameLayout">
      <div>
        ${wordPanel(last, `${state.players[state.turn]?.name || ""}の番です`)}
        ${historyPanel()}
        <div class="timer">
          <div>残り時間<br><strong>07</strong>秒</div>
        </div>
        ${inputPanel("submitMultiWord()")}
      </div>

      <aside class="sidePlayers">
        <strong>プレイヤー</strong>
        ${state.players.map((p,i) => `
          <div class="playerListItem ${!p.alive ? "dead" : ""} ${i === state.turn ? "turn" : ""}">
            <span>${p.alive ? p.symbol : "×"}</span>
            <span>${p.name}${i === state.turn ? "<br>考え中…" : ""}</span>
          </div>
        `).join("")}
      </aside>
    </div>

    ${rulePanel()}
    ${gameOverModal()}
  `;
}

function wordPanel(word, label){
  return `
    <section class="panel wordPanel">
      <div class="badge">${label}</div>
      <div class="currentWord">${word}</div>
      <div>最後の文字：<span class="lastChar">${lastKana(word)}</span></div>
    </section>
  `;
}

function historyPanel(){
  return `
    <div class="historyTitle">これまでのしりとり</div>
    <div class="history">
      ${state.history.map((h,i) => `
        <div class="row">
          <span>${i + 1}</span>
          <span>${h.player}</span>
          <strong>${h.word}</strong>
        </div>
      `).join("")}
    </div>
    <div class="message">${state.message || ""}</div>
  `;
}

function inputPanel(action){
  return `
    <div class="inputBox">
      <input id="wordInput" placeholder="言葉を入力（ひらがな）" autocomplete="off" />
      <button class="primary" onclick="${action}">決定</button>
    </div>
  `;
}

function rulePanel(){
  return `
    <div class="rule">
      ⓘ ルール<br>
      ・最後に「ん」をつけた人が負けです。<br>
      ・その場で作った言葉は唱え直しになります。
    </div>
  `;
}

function submitCpuWord(){
  const input = document.querySelector("#wordInput");
  const word = normalizeWord(input.value);
  const error = validNext(word);

  if(error){
    state.message = error;
    render();
    return;
  }

  state.history.push({ player:"あなた", word });

  if(word.endsWith("ん")){
    lose("あなた");
    return;
  }

  const ai = cpuPick();
  state.history.push({ player:"AI", word:ai });

  if(ai.endsWith("ん")){
    lose("AI");
    return;
  }

  state.message = `AIは「${ai}」。次は「${lastKana(ai)}」。`;
  render();
}

function submitMultiWord(){
  const p = state.players[state.turn];
  const word = normalizeWord(document.querySelector("#wordInput").value);
  const error = validNext(word);

  if(error){
    state.message = error;
    render();
    return;
  }

  state.history.push({ player:p.name, word });

  if(word.endsWith("ん")){
    p.alive = false;
    state.message = `${p.symbol} ${p.name} 脱落。`;
  }

  const alive = state.players.filter(x => x.alive);

  if(alive.length <= 1){
    win(alive[0]?.name || "該当者なし");
    return;
  }

  nextTurn();
  render();
}

function nextTurn(){
  let i = state.turn;
  do {
    i = (i + 1) % state.players.length;
  } while(!state.players[i].alive);
  state.turn = i;
}

function lose(name){
  state.gameOver = `${name} の負け`;
  render();
}

function win(name){
  state.gameOver = `${name} の勝ち`;
  render();
}

function gameOverModal(){
  if(!state.gameOver) return "";

  return `
    <div class="modal">
      <div class="modalBox">
        <h2>${state.gameOver}</h2>
        <p>言葉の連鎖は終了しました。</p>
        <button class="primary" onclick="goMenu()" style="width:100%">戻る</button>
      </div>
    </div>
  `;
}

function goMenu(){
  state.screen = "menu";
  render();
}

document.addEventListener("keydown", e => {
  if(e.key === "Enter"){
    if(state.screen === "cpu") submitCpuWord();
    if(state.screen === "multi") submitMultiWord();
  }
});

render();
