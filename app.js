const app = document.getElementById("app");

let history = ["りんご"];

const words = [
  "りんご","ごりら","らっぱ","ぱんだ","だるま","まくら",
  "らくだ","だいこん","こあら","あさがお","ごぼう",
  "うさぎ","ぎょうざ","ざくろ","ろうそく","くじら",
  "らんぷ","ぷりん","いるか","かめ","めだか","からす",
  "すいか","かもめ","めがね","ねこ","こま","まり",
  "りす","すずめ","とまと","とうふ","ふくろう","うみ",
  "みかん","かっぱ","ぱせり","たぬき","きつね","ねずみ"
];

function lastChar(word){
  return word[word.length - 1];
}

function firstChar(word){
  return word[0];
}

function menu(){
  app.innerHTML = `
    <div class="title">
      <div class="copy">最後に「ん」をつけた人が負け。</div>
      <div class="logo">しりとり</div>
    </div>

    <button class="button" onclick="cpuStart()">PCと対戦</button>
    <button class="button">みんなで対戦</button>
  `;
}

function cpuStart(){
  history = ["りんご"];
  cpuScreen("");
}

function cpuScreen(message){
  const current = history[history.length - 1];

  app.innerHTML = `
    <button class="button" onclick="menu()">戻る</button>

    <div class="word">${current}</div>

    <p style="text-align:center;">
      「${lastChar(current)}」から始まる言葉
    </p>

    <div class="inputArea">
      <input id="wordInput" class="input" placeholder="ことばを入力">
      <button class="send" onclick="submitWord()">決定</button>
    </div>

    <p style="min-height:24px;">${message}</p>

    <div class="history">
      ${history.map((w,i)=>`
        <div class="row">${i + 1}：${w}</div>
      `).join("")}
    </div>
  `;
}

function submitWord(){
  const input = document.getElementById("wordInput");
  const word = input.value.trim();

  const current = history[history.length - 1];

  if(word === ""){
    cpuScreen("言葉を入力してね。");
    return;
  }

  if(firstChar(word) !== lastChar(current)){
    cpuScreen(`「${lastChar(current)}」から始めてね。`);
    return;
  }

  if(history.includes(word)){
    cpuScreen("同じ言葉は使えません。");
    return;
  }

  if(!words.includes(word)){
    cpuScreen("辞書にない言葉です。唱え直し。");
    return;
  }

  history.push(word);

  if(lastChar(word) === "ん"){
    cpuScreen("あなたの負け。");
    return;
  }

  const aiWord = cpuPick();

  history.push(aiWord);

  if(lastChar(aiWord) === "ん"){
    cpuScreen("AIの負け。");
    return;
  }

  cpuScreen(`AI：${aiWord}`);
}

function cpuPick(){
  const current = history[history.length - 1];
  const need = lastChar(current);

  const candidates = words.filter(w => {
    return firstChar(w) === need &&
           !history.includes(w) &&
           lastChar(w) !== "ん";
  });

  if(candidates.length === 0){
    return need + "ん";
  }

  return candidates[0];
}

menu();
