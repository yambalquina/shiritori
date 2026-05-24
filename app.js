const app = document.getElementById("app");

let history = [];
let message = "";
let mode = "menu";
let players = [];
let turn = 0;

const words = [
  "りんご","ごりら","らっぱ","ぱんだ","だるま","まくら",
  "らくだ","だいこん","こあら","あさがお","ごぼう",
  "うさぎ","ぎょうざ","ざくろ","ろうそく","くじら",
  "いるか","かめ","めだか","からす","すいか","かもめ",
  "めがね","ねこ","こま","まり","りす","すずめ",
  "とまと","とうふ","ふくろう","うみ","かっぱ","ぱせり",
  "たぬき","きつね","ねずみ","みそ","そら","らじお"
];

const marks = ["○","△","□","▽","◇","☆","◎","＋","×","◐"];

function menu(){
  mode = "menu";

  app.innerHTML =
    '<div class="title">' +
      '<div class="copy">最後に「ん」をつけた人が負け。</div>' +
      '<div class="logo">しりとり</div>' +
    '</div>' +

    '<button class="button" onclick="startCpu()">PCと対戦</button>' +
    '<button class="button" onclick="setupMulti()">みんなで対戦</button>';
}

function startCpu(){
  mode = "cpu";
  history = ["りんご"];
  message = "「ご」から始まる言葉を入力";
  drawCpu();
}

function setupMulti(){
  mode = "setup";
  players = [
    { name:"参加者1", mark:"○", alive:true },
    { name:"参加者2", mark:"△", alive:true },
    { name:"参加者3", mark:"□", alive:true }
  ];

  drawSetup();
}

function drawSetup(){
  app.innerHTML =
    '<button class="button" onclick="menu()">戻る</button>' +

    '<div class="title">' +
      '<div class="copy">最大10人まで登録</div>' +
      '<div class="logo">対戦設定</div>' +
    '</div>' +

    '<div class="history">' +
      players.map(function(p,i){
        return '<div class="row">' +
          p.mark + '　' +
          '<input value="' + p.name + '" onchange="changeName(' + i + ', this.value)" style="width:70%;height:32px;">' +
        '</div>';
      }).join("") +
    '</div>' +

    '<button class="button" onclick="addPlayer()">参加者を追加</button>' +
    '<button class="button" onclick="startMulti()">開始</button>';
}

function addPlayer(){
  if(players.length >= 10){
    alert("参加者は10人までです。");
    return;
  }

  const i = players.length;

  players.push({
    name:"参加者" + (i + 1),
    mark:marks[i],
    alive:true
  });

  drawSetup();
}

function changeName(index, value){
  players[index].name = value || ("参加者" + (index + 1));
}

function startMulti(){
  mode = "multi";
  history = ["りんご"];
  turn = 0;
  message = players[turn].name + " の番です。";
  drawMulti();
}

function drawCpu(){
  const current = history[history.length - 1];

  app.innerHTML =
    '<button class="button" onclick="menu()">戻る</button>' +
    '<div class="word">' + current + '</div>' +
    '<p style="text-align:center;">次は「' + lastChar(current) + '」</p>' +

    '<div class="inputArea">' +
      '<input id="wordInput" class="input" placeholder="ことばを入力">' +
      '<button class="send" onclick="submitCpuWord()">決定</button>' +
    '</div>' +

    '<p id="debug" style="font-size:12px;color:#555;">入力待ち</p>' +
    '<p style="min-height:24px;">' + message + '</p>' +

    '<div class="history">' +
      history.map(function(w,i){
        return '<div class="row">' + (i + 1) + '：' + w + '</div>';
      }).join("") +
    '</div>';

  bindInput();
}

function drawMulti(){
  const current = history[history.length - 1];
  const p = players[turn];

  app.innerHTML =
    '<button class="button" onclick="menu()">戻る</button>' +

    '<div class="word">' + current + '</div>' +
    '<p style="text-align:center;">次は「' + lastChar(current) + '」</p>' +

    '<div style="text-align:center;font-size:20px;margin-top:20px;">' +
      p.mark + '　' + p.name + ' の番' +
    '</div>' +

    '<div class="inputArea">' +
      '<input id="wordInput"
