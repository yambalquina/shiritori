const app = document.getElementById("app");

let history = [];
let message = "";

const words = [
  "りんご","ごりら","らっぱ","ぱんだ","だるま","まくら",
  "らくだ","だいこん","こあら","あさがお","ごぼう",
  "うさぎ","ぎょうざ","ざくろ","ろうそく","くじら",
  "いるか","かめ","めだか","からす","すいか","かもめ",
  "めがね","ねこ","こま","まり","りす","すずめ",
  "とまと","とうふ","ふくろう","うみ","かっぱ","ぱせり",
  "たぬき","きつね","ねずみ","みそ","そら","らじお"
];

function menu(){
  app.innerHTML =
    '<div class="title">' +
      '<div class="copy">最後に「ん」をつけた人が負け。</div>' +
      '<div class="logo">しりとり</div>' +
    '</div>' +

    '<button class="button" onclick="startCpu()">PCと対戦</button>' +
    '<button class="button">みんなで対戦</button>';
}

function startCpu(){
  history = ["りんご"];
  message = "「ご」から始まる言葉を入力";
  drawCpu();
}

function drawCpu(){
  const current = history[history.length - 1];

  app.innerHTML =
    '<button class="button" onclick="menu()">戻る</button>' +

    '<div class="word">' + current + '</div>' +

    '<p style="text-align:center;">次は「' + lastChar(current) + '」</p>' +

    '<div class="inputArea">' +
      '<input id="wordInput" class="input" placeholder="ことばを入力">' +
      '<button class="send" onclick="submitWord()">決定</button>' +
    '</div>' +

    '<p id="debug" style="font-size:12px;color:#555;">入力待ち</p>' +

    '<p style="min-height:24px;">' + message + '</p>' +

    '<div class="history">' +
      history.map(function(w,i){
        return '<div class="row">' + (i + 1) + '：' + w + '</div>';
      }).join("") +
    '</div>';

  const input = document.getElementById("wordInput");

  input.addEventListener("input", function(){
    document.getElementById("debug").textContent = "入力中：" + input.value;
  });

  input.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      submitWord();
    }
  });

  input.focus();
}

function submitWord(){
  const input = document.getElementById("wordInput");
  let word = input.value;

  word = normalize(word);

  const current = history[history.length - 1];

  if(word === ""){
    message = "言葉を入力してね。";
    drawCpu();
    return;
  }

  if(firstChar(word) !== lastChar(current)){
    message = "入力：" + word + " ／ 「" + lastChar(current) + "」から始めてね。";
    drawCpu();
    return;
  }

  if(history.indexOf(word) !== -1){
    message = "入力：" + word + " ／ 同じ言葉は使えません。";
    drawCpu();
    return;
  }

  if(words.indexOf(word) === -1){
    message = "入力：" + word + " ／ 辞書にない言葉です。唱え直し。";
    drawCpu();
    return;
  }

  history.push(word);

  if(lastChar(word) === "ん"){
    message = "あなたの負け。";
    drawCpu();
    return;
  }

  const aiWord = pickAiWord();

  history.push(aiWord);

  if(lastChar(aiWord) === "ん"){
    message = "AIの負け。";
    drawCpu();
    return;
  }

  message = "AI：" + aiWord;
  drawCpu();
}

function pickAiWord(){
  const current = history[history.length - 1];
  const need = lastChar(current);

  const candidates = words.filter(function(w){
    return firstChar(w) === need &&
           history.indexOf(w) === -1 &&
           lastChar(w) !== "ん";
  });

  if(candidates.length === 0){
    return need + "ん";
  }

  return candidates[0];
}

function normalize(text){
  return text
    .trim()
    .replace(/\s/g,"")
    .replace(/[ァ-ン]/g,function(s){
      return String.fromCharCode(s.charCodeAt(0) - 0x60);
    });
}

function firstChar(word){
  return word.charAt(0);
}

function lastChar(word){
  let c = word.charAt(word.length - 1);

  if(c === "ー" && word.length >= 2){
    c = word.charAt(word.length - 2);
  }

  const small = {
    "ゃ":"や",
    "ゅ":"ゆ",
    "ょ":"よ",
    "ぁ":"あ",
    "ぃ":"い",
    "ぅ":"う",
    "ぇ":"え",
    "ぉ":"お",
    "っ":"つ"
  };

  return small[c] || c;
}

menu();
