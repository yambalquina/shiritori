const app = document.getElementById("app");

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
  `;
}

function startCpu(){
  app.innerHTML = `
    <div class="top">
      <button class="iconBtn" onclick="renderMenu()">‹</button>
      <div class="title">PCと対戦</div>
      <button class="iconBtn">…</button>
    </div>

    <section class="panel wordPanel">
      <div class="badge">あなたの番です</div>
      <div class="currentWord">りんご</div>
      <div>最後の文字：<span class="lastChar">ご</span></div>
    </section>

    <div class="historyTitle">これまでのしりとり</div>
    <div class="history">
      <div class="row">
        <span>1</span>
        <span>AI</span>
        <strong>りんご</strong>
      </div>
    </div>

    <div class="inputBox">
      <input placeholder="言葉を入力（ひらがな）">
      <button class="primary">決定</button>
    </div>

    <div class="rule">
      ⓘ ルール<br>
      ・最後に「ん」をつけた人が負けです。<br>
      ・その場で作った言葉は唱え直しになります。
    </div>
  `;
}

function setupRoom(){
  app.innerHTML = `
    <div class="top">
      <button class="iconBtn" onclick="renderMenu()">‹</button>
      <div class="title">みんなで対戦</div>
      <button class="iconBtn">☰</button>
    </div>

    <section class="panel" style="text-align:center;border:0;background:transparent">
      <div>ルームID　1234 5678　⧉</div>
      <p style="font-size:12px">このIDを友達に教えて、一緒に対戦しよう。</p>
    </section>

    <section class="panel">
      <h3>プレイヤー（最大10人）</h3>
      <div class="playersGrid">
        ${["○","△","□","▽","☆","◇","+","+","+","+"].map((s,i)=>`
          <div class="playerCard">
            <div>
              <div class="symbol">${s}</div>
              <div class="name">${i < 6 ? "参加者" + (i + 1) : "待機中"}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="panel">
      <h3>ゲーム設定</h3>
      <div class="settingRow"><span>◷　制限時間</span><strong>10秒 ›</strong></div>
      <div class="settingRow"><span>ⓘ　禁止ワード</span><strong>ON ›</strong></div>
      <button class="primary" style="width:100%;margin-top:18px">準備完了</button>
    </section>
  `;
}

renderMenu();
