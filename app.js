var app = document.getElementById("app");

var screen = "menu";
var history = [];
var message = "";
var players = [];
var turn = 0;
var pendingWord = "";
var pendingSpeaker = -1;
var rejectVotes = {};
var aiLastWord = "";

var aiWords = [
  "ごりら","らっぱ","ぱんだ","だるま","まくら","らくだ","こあら",
  "あさがお","ごぼう","うさぎ","ぎょうざ","ざくろ","ろうそく",
  "くじら","らじお","おにぎり","りんどう","うみ","みそ","そら",
  "かっぱ","ぱせり","りす","すずめ","めがね","ねこ","こま",
  "まり","からす","すいか","かもめ","めだか","たぬき","きつね",
  "ねずみ","とまと","とうふ","ふくろう","しまうま","まつり"
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
  history = [{name:"AI", word:"りんご"}];
  message = "「ご」から始まる言葉を入力";
  aiLastWord = "";
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
    html += '<input value="' + players[i].name + '" onchange="changeName(' + i + ', this.value)" style="width:70%;height:32px;">';
    html += '</div>';
  }
  html += '</div>';

  html += '<button class="button" onclick="addPlayer()">参加者を追加</button>';
  html += '<button class="button" onclick="startMulti()">開始</button>';

  app.innerHTML = html;
}

function changeName(i, value){
  players[i].name = value || ("参加者" + (i + 1));
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
  history = [{name:"開始", word:"りんご"}];
  turn = 0;
  pendingWord = "";
  pendingSpeaker = -1;
  rejectVotes = {};
  message = players[turn].name + " の番です。";
  drawMulti();
}

function drawCpu(){
  var current = lastWord();

  app.innerHTML =
    '<button class="button" onclick="menu()">戻る</button>' +
    '<div class="word">' + current + '</div>' +
    '<p style="text-align:center;">次は「' + lastChar(current) + '」</p>' +

    '<div class="inputArea">' +
      '<input id="wordInput" class="input" placeholder="ことばを入力">' +
      '<button class="send" onclick="submitCpu()">決定</button>' +
    '</div>' +

    '<button class="button" onclick="rejectAi()">AIの言葉をReject</button>' +

    '<p>' + message + '</p>' +
    makeHistory();

  bindInput();
}

function drawMulti(){
  var current = lastWord();
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

  if(pendingWord !== ""){
    html += '<div class="history">';
    html += '<div class="row">判定中：' + pendingWord + '</div>';
    for(var i=0;i<players.length;i++){
      if(i !== pendingSpeaker && players[i].alive){
        html += '<button class="button" onclick="voteReject(' + i + ')">';
        html += players[i].mark + ' Reject';
        html += '</button>';
      }
    }
    html += '<button class="button" onclick="finishVote()">投票を締め切る</button>';
    html += '</div>';
  }

  html += '<div class="history">';
  for(var j=0;j<players.length;j++){
    html += '<div class="row" style="opacity:' + (players[j].alive ? '1' : '0.3') + '">';
    html += players[j].mark + "　" + players[j].name + "　";
    html += players[j].alive ? "参加中" : "脱落";
    html += '</div>';
  }
  html += '</div>';

  html += makeHistory();

  app.innerHTML = html;
  bindInput();
}

function submitCpu(){
  var input = document.getElementById("wordInput");
  var word = normalize(input.value);
  var check = basicCheck(word);

  if(check !== true){
    message = check;
    drawCpu();
    return;
  }

  history.push({name:"あなた", word:word});

  if(lastChar(word) === "ん"){
    message = "あなたの負け。";
    drawCpu();
    return;
  }

  var ai = pickAi();
  aiLastWord = ai;
  history.push({name:"AI", word:ai});

  if(lastChar(ai) === "ん"){
    message = "AIの負け。";
  }else{
    message = "AI：" + ai + "　怪しいと思ったらRejectできます。";
  }

  drawCpu();
}

function rejectAi(){
  if(aiLastWord === ""){
    message = "RejectできるAI発言がありません。";
    drawCpu();
    return;
  }

  history.pop();
  message = "AIの「" + aiLastWord + "」をReject。AIが唱え直します。";

  var ai = pickAi();
  aiLastWord = ai;
  history.push({name:"AI", word:ai});

  message += " 新しい発言：" + ai;
  drawCpu();
}

function submitMulti(){
  if(pendingWord !== ""){
    message = "投票中です。先に判定を終えてください。";
    drawMulti();
    return;
  }

  var input = document.getElementById("wordInput");
  var word = normalize(input.value);
  var check = basicCheck(word);

  if(check !== true){
    message = check;
    drawMulti();
    return;
  }

  pendingWord = word;
  pendingSpeaker = turn;
  rejectVotes = {};

  message = word + " を発言。怪しい場合は発言者以外がReject投票。";
  drawMulti();
}

function voteReject(i){
  rejectVotes[i] = true;
  message = players[i].name + " がRejectしました。";
  drawMulti();
}

function finishVote(){
  var voters = 0;
  var rejects = 0;

  for(var i=0;i<players.length;i++){
    if(players[i].alive && i !== pendingSpeaker){
      voters++;
      if(rejectVotes[i]) rejects++;
    }
  }

  var rejected = false;

  if(rejects > voters / 2){
    rejected = true;
  }else if(voters % 2 === 0 && rejects === voters / 2){
    rejected = Math.random() < 0.5;
  }

  if(rejected){
    message = "Reject成立。「" + pendingWord + "」は無効。唱え直し。";
    pendingWord = "";
    pendingSpeaker = -1;
    rejectVotes = {};
    drawMulti();
    return;
  }

  var word = pendingWord;
  history.push({name:players[pendingSpeaker].name, word:word});

  if(lastChar(word) === "ん"){
    players[pendingSpeaker].alive = false;
    message = players[pendingSpeaker].name + " は脱落。";
  }else{
    message = "有効。";
  }

  pendingWord = "";
  pendingSpeaker = -1;
  rejectVotes = {};

  if(checkWinner()){
    drawMulti();
    return;
  }

  nextTurn();
  message += " " + players[turn].name + " の番です。";
  drawMulti();
}

function checkWinner(){
  var count = 0;
  var winner = "";

  for(var i=0;i<players.length;i++){
    if(players[i].alive){
      count++;
      winner = players[i].name;
    }
  }

  if(count <= 1){
    message = winner + " の勝ち。";
    return true;
  }

  return false;
}

function basicCheck(word){
  if(word === ""){
    return "言葉を入力してね。";
  }

  if(firstChar(word) !== lastChar(lastWord())){
    return "「" + lastChar(lastWord()) + "」から始めてね。";
  }

  for(var i=0;i<history.length;i++){
    if(history[i].word === word){
      return "同じ言葉は使えません。";
    }
  }

  return true;
}

function pickAi(){
  var need = lastChar(lastWord());
  var candidates = [];

  for(var i=0;i<aiWords.length;i++){
    var w = aiWords[i];

    if(firstChar(w) === need && usedWord(w) === false && lastChar(w) !== "ん"){
      candidates.push(w);
    }
  }

  if(candidates.length === 0){
    return need + "ん";
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function usedWord(word){
  for(var i=0;i<history.length;i++){
    if(history[i].word === word){
      return true;
    }
  }
  return false;
}

function nextTurn(){
  do{
    turn++;
    if(turn >= players.length){
      turn = 0;
    }
  }while(players[turn].alive === false);
}

function makeHistory(){
  var html = '<div class="history">';

  for(var i=0;i<history.length;i++){
    html += '<div class="row">';
    html += history[i].name + "：" + history[i].word;
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function bindInput(){
  var input = document.getElementById("wordInput");
  if(!input) return;

  input.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      if(screen === "cpu") submitCpu();
      if(screen === "multi") submitMulti();
    }
  });
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

function lastWord(){
  return history[history.length - 1].word;
}

menu();
