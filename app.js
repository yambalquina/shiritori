const app = document.getElementById("app");

function menu(){

  app.innerHTML = `

    <div class="title">

      <div class="copy">
        最後に「ん」をつけた人が負け。
      </div>

      <div class="logo">
        しりとり
      </div>

    </div>

    <button class="button" onclick="cpu()">
      PCと対戦
    </button>

    <button class="button">
      みんなで対戦
    </button>

  `;
}

function cpu(){

  app.innerHTML = `

    <button class="button" onclick="menu()">
      戻る
    </button>

    <div class="word">
      りんご
    </div>

    <div class="inputArea">

      <input
        class="input"
        placeholder="ことばを入力"
      >

      <button class="send">
        決定
      </button>

    </div>

    <div class="history">

      <div class="row">
        AI ：りんご
      </div>

    </div>

  `;
}

menu();
