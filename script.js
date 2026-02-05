// SVGオブジェクト取得
const svgObject = document.getElementById("svgObject");

function init() {
  console.log("init 実行");

  const svg = svgObject.contentDocument;
  if (!svg) {
    console.error("SVGがまだ読み込まれていません");
    return;
  }

  // SVG内要素
  const groundwater = svg.getElementById("groundwater");
  const buildings = svg.getElementById("buildings");

  // 結果表示エリア
  const resultText = document.getElementById("resultText");

  /* -------------------------
     地下水位：即時反映
  -------------------------- */
  const waterHigh = document.getElementById("q4_yes");
  const waterRadios = document.querySelectorAll(
    'input[name="water_level"]'
  );

  waterRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (!groundwater) return;

      groundwater.style.transition = "transform 1s ease";
      groundwater.style.transform =
        waterHigh.checked ? "translateY(-50px)" : "translateY(0)";
    });
  });

  /* -------------------------
     実行ボタン
  -------------------------- */
  document.getElementById("runB").onclick = () => {
    console.log("地震発生ボタン押下");

    let score = 0;

    if (document.getElementById("q1_yes").checked) score += 2;
    if (document.getElementById("q2_yes").checked) score += 1;
    if (document.getElementById("q3_yes").checked) score += 2;
    if (document.getElementById("q4_yes").checked) score += 2;
    if (document.getElementById("q5_yes").checked) score += 1;

    console.log("スコア:", score);

    if (score >= 6) {
      resultText.innerHTML =
        `【判定：${score}点】激しい液状化が発生！<br>
         建物が沈下し、地表に泥水が噴き出します。`;
      resultText.style.color = "red";
      startAnimation(svg, 20, true);
    }
    else if (score >= 3) {
      resultText.innerHTML =
        `【判定：${score}点】液状化の可能性あり。<br>
         建物が傾きます。`;
      resultText.style.color = "orange";
      startAnimation(svg, 8, false);
    }
    else {
      resultText.innerHTML =
        `【判定：${score}点】地盤は安定しています。`;
      resultText.style.color = "blue";
      justShake(buildings);
    }
  };
}

/* -------------------------
   揺れ → 沈下
-------------------------- */
function startAnimation(svg, depth, showMud) {
  const building = svg.getElementById("buildings");
  if (!building) return;

  building.style.transformBox = "fill-box";
  building.style.transformOrigin = "center";

  let count = 0;
  const shake = setInterval(() => {
    building.style.transform =
      `translateX(${count % 2 === 0 ? 3 : -3}px)`;

    if (showMud && count === 10) {
      showMudWater(svg);
    }

    count++;
    if (count > 25) {
      clearInterval(shake);
      sink(building, depth);
    }
  }, 200);
}

function sink(building, depth) {
  let y = 0;
  const interval = setInterval(() => {
    y += 0.3;
    building.style.transform =
      `translateY(${y}px) rotate(${depth / 6}deg)`;

    if (y >= depth) {
      clearInterval(interval);
    }
  }, 30);
}

/* -------------------------
   泥水噴出
-------------------------- */
function showMudWater(svg) {
  const svgRoot = svg.documentElement; 
  const mudPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  // 最初は地表の線と同じ真っ直ぐな状態（もわもわの元）
  const initialPath = "M 50,217 Q 200,217 400,217 Q 600,217 750,217 L 750,217 L 50,217 Z";
  
  // もわもわと波打つ状態（少し上に盛り上がる）
  const expandedPath = "M 50,217 Q 150,205 300,215 Q 450,200 600,212 Q 700,205 750,217 L 750,225 L 50,225 Z";

  mudPath.setAttribute("d", initialPath);
  mudPath.setAttribute("fill", "#8f7640"); // 泥の色
  
  // 「もわもわ感」を出すためのフィルター（ぼかし）
  mudPath.style.filter = "blur(4px)";
  mudPath.style.opacity = "0";
  mudPath.style.transition = "all 2.5s ease-out"; // ゆっくり広がる
  
  svgRoot.appendChild(mudPath); 
  
  // 0.1秒後に広がり始める
  setTimeout(() => {
    mudPath.setAttribute("d", expandedPath);
    mudPath.style.opacity = "0.8"; // じわっと浮き出る
  }, 100);
}

/* -------------------------
   液状化なし：揺れのみ
-------------------------- */
function justShake(element) {
  if (!element) return;

  let c = 0;
  const int = setInterval(() => {
    element.style.transform =
      `translateX(${c % 2 === 0 ? 2 : -2}px)`;
    c++;
    if (c > 20) {
      clearInterval(int);
      element.style.transform = "none";
    }
  }, 200);
}

/* -------------------------
   SVGロード待ち
-------------------------- */
if (
  svgObject.contentDocument &&
  svgObject.contentDocument.readyState === "complete"
) {
  init();
} else {
  svgObject.addEventListener("load", init);
}
