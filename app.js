var app = document.getElementById("app");

var screen = "menu";
var history = [];
var message = "";
var players = [];
var turn = 0;

var words = [
  "りんご","ごりら","らっぱ","ぱんだ","だるま","まくら",
  "らくだ","だいこん","こあら","あさがお","ごぼう",
  "うさぎ","ぎょうざ","ざくろ","ろうそく","くじら",
  "いるか","かめ","めだか","からす","すいか","かもめ",
  "めがね","ねこ","こま","まり","りす","すずめ",
  "とまと","とうふ","ふくろう","うみ","かっぱ","ぱせり",
  "たぬき","きつね","ねずみ","みそ","そら","らじお"
];

function menu(){
  screen = "menu";

  app.innerHTML =
    '<div class="title">' +
      '<div class="copy">最後に「ん」をつけた人が負け。</div>' +
      '<div class="logo">しりとり</div>' +
    '</div>' +
    '<button class="button" onclick="startCpu()">PCと対戦</button>' +
    '<button class="button" onclick="setupMulti()">みんなで対戦</button>';
}

function startCpu(){
  screen = "cpu";
  history = ["りんご"];
  message = "ご から始まる言葉を入力";
  drawCpu();
}

function setupMulti(){
  screen = "setup";
  players = [
    {name:"参加者1", mark:"○", alive:true},
    {name:"参加者2", mark:"△", alive:true},
    {name:"参加者3", mark:"□", alive:true}
  ];
  drawSetup();
}

function drawSetup(){
  var html = "";

  html += '<button class="button" onclick="menu()">戻る</button>';
  html += '<div class="title">';
  html += '<div class="copy">最大10人まで登録</div>';
  html += '<div class="logo">対戦設定</div>';
  html += '</div>';

  html += '<div class="history">';

  for(var i=0;i<players.length;i++){
    html += '<div class="row">';
    html += players[i].mark + "　";
    html += '<input value="' + players[i].name + '" onchange="players[' + i + '].name=this.value">';
    html += '</div>';
  }

  html += '</div>';

  html += '<button class="button" onclick="addPlayer()">参加者を追加</button>';
  html += '<button class="button" onclick="startMulti()">開始</button>';

  app.innerHTML = html;
}

function addPlayer(){
  if(players.length >= 10){
    alert("参加者は10人までです。");
    return;
  }

  var marks = ["○","△","□","▽","◇","☆","◎","＋","×","◐"];
  var n = players.length + 1;

  players.push({
    name:"参加者" + n,
    mark:marks[players.length],
    alive:true
  });

  drawSetup();
}

function startMulti(){
  screen = "multi";
  history = ["りんご"];
  turn = 0;
  message = players[turn].name + " の番です。";
  drawMulti();
}

function drawCpu(){
  var current = history[history.length - 1];

  app.innerHTML =
    '<button class="button" onclick="menu()">戻る</button>' +
    '<div class="word">' + current + '</div>' +
    '<p style="text-align:center;">次は「' + lastChar(current) + '」</p>' +
    '<div class="inputArea">' +
      '<input id="wordInput" class="input" placeholder="ことばを入力">' +
      '<button class="send" onclick="submitCpu()">決定</button>' +
    '</div>' +
    '<p>' + message + '</p>' +
    makeHistory();

  bindInput();
}

function drawMulti(){
  var current = history[history.length - 1];
  var p = players[turn];

  var html = "";

  html += '<button class="button" onclick="menu()">戻る</button>';
  html += '<div class="word">' + current + '</div>';
  html += '<p style="text-align:center;">次は「' + lastChar(current) + '」</p>';
  html += '<p style="text-align:center;font-size:20px;">' + p.mark + "　" + p.name + " の番</p>";

  html += '<div class="inputArea">';
  html += '<input id="wordInput" class="input" placeholder="ことばを入力">';
  html += '<button class="send" onclick="submitMulti()">決定</button>';
  html += '</div>';

  html += '<p>' + message + '</p>';

  html += '<div class="history">';
  for(var i=0;i<players.length;i++){
    html += '<div class="row">';
    html += players[i].mark + "　" + players[i].name + "　";
    html += players[i].alive ? "参加中" : "脱落";
    html += '</div>';
  }
  html += '</div>';

  html += makeHistory();

  app.innerHTML = html;
  bindInput();
}

function makeHistory(){
  var html = '<div class="history">';

  for(var i=0;i<history.length;i++){
    html += '<div class="row">' + (i + 1) + "：" + history[i] + '</div>';
  }

  html += '</div>';

  return html;
}

function bindInput(){
  var input = document.getElementById("wordInput");

  input.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      if(screen === "cpu") submitCpu();
      if(screen === "multi") submitMulti();
    }
  });

  input.focus();
}

function submitCpu(){
  var result = checkWord();

  if(result !== true){
    message = result;
    drawCpu();
    return;
  }

  var word = normalize(document.getElementById("wordInput").value);
  history.push(word);

  if(lastChar(word) === "ん"){
    message = "あなたの負け。";
    drawCpu();
    return;
  }

  var ai = pickAi();
  history.push(ai);

  if(lastChar(ai) === "ん"){
    message = "AIの負け。";
    drawCpu();
    return;
  }

  message = "AI：" + ai;
  drawCpu();
}

function submitMulti(){
  var result = checkWord();

  if(result !== true){
    message = result;
    drawMulti();
    return;
  }

  var word = normalize(document.getElementById("wordInput").value);
  history.push(word);

  if(lastChar(word) === "ん"){
    players[turn].alive = false;
    message = players[turn].name + " は脱落。";
  }

  var aliveCount = 0;
  var winner = "";

  for(var i=0;i<players.length;i++){
    if(players[i].alive){
      aliveCount++;
      winner = players[i].name;
    }
  }

  if(aliveCount <= 1){
    message = winner + " の勝ち。";
    drawMulti();
    return;
  }

  nextTurn();
  message = players[turn].name + " の番です。";
  drawMulti();
}

function nextTurn(){
  do{
    turn++;
    if(turn >= players.length){
      turn = 0;
    }
  }while(players[turn].alive === false);
}

function checkWord(){
  var word = normalize(document.getElementById("wordInput").value);
  var current = history[history.length - 1];

  if(word === ""){
    return "言葉を入力してね。";
  }

  if(firstChar(word) !== lastChar(current)){
    return "「" + lastChar(current) + "」から始めてね。";
  }

  if(history.indexOf(word) !== -1){
    return "同じ言葉は使えません。";
  }

  if(words.indexOf(word) === -1){
    return "辞書にない言葉です。唱え直し。";
  }

  return true;
}

function pickAi(){
  var current = history[history.length - 1];
  var need = lastChar(current);

  for(var i=0;i<words.length;i++){
    if(firstChar(words[i]) === need && history.indexOf(words[i]) === -1 && lastChar(words[i]) !== "ん"){
      return words[i];
    }
  }

  return need + "ん";
}

function normalize(text){
  return text.trim().replace(/\s/g,"").replace(/[ァ-ン]/g,function(s){
    return String.fromCharCode(s.charCodeAt(0) - 96);
  });
}

function firstChar(word){
  return word.charAt(0);
}

function lastChar(word){
  var c = word.charAt(word.length - 1);

  if(c === "ー" && word.length >= 2){
    c = word.charAt(word.length - 2);
  }

  if(c === "ゃ") return "や";
  if(c === "ゅ") return "ゆ";
  if(c === "ょ") return "よ";
  if(c === "ぁ") return "あ";
  if(c === "ぃ") return "い";
  if(c === "ぅ") return "う";
  if(c === "ぇ") return "え";
  if(c === "ぉ") return "お";
  if(c === "っ") return "つ";

  return c;
}

menu();
