// SVG要素の取得
const svgObject = document.getElementById("svgObject");

// シミュレーション実行関数（HTMLのボタンから呼ばれる）
function simulate() {
  const svg = svgObject.contentDocument;
  if (!svg) {
    alert("SVGが読み込まれていません。ページを再読み込みしてください。");
    return;
  }

  const buildings = svg.getElementById("buildings");
  const resultText = document.getElementById("resultText");

  // スコア計算（HTMLの新しいIDに合わせました）
  let score = 0;
  if (document.getElementById("soil_sand").checked) score += 2;
  if (document.getElementById("grain_uniform").checked) score += 1;
  if (document.getElementById("ground_loose").checked) score += 2;
  if (document.getElementById("water_high").checked) score += 2;
  if (document.getElementById("place_river").checked) score += 1;

  console.log("計算スコア:", score);

  // 判定に応じたアクション
  if (score >= 6) {
    resultText.innerHTML = `【判定：${score}点】激しい液状化が発生！<br>地表には泥水が噴き出します。`;
    resultText.style.color = "red";
    startAnimation(svg, 20, true); // 泥水あり
  } else if (score >= 3) {
    resultText.innerHTML = `【判定：${score}点】液状化の可能性あり。<br>少し地盤が弱くなり、建物が傾きます。`;
    resultText.style.color = "orange";
    startAnimation(svg, 8, false); // 泥水なし
  } else {
    resultText.innerHTML = `【判定：${score}点】地盤は安定しています。`;
    resultText.style.color = "blue";
    justShake(buildings); 
  }
}

// --- 以下、アニメーション関連（昨日作成したもの） ---

function startAnimation(svg, depth, showMud) {
  const building = svg.getElementById("buildings");
  if (!building) return;

  building.style.transformBox = "fill-box";
  building.style.transformOrigin = "center";

  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    const xMove = (shakeCount % 2 === 0) ? 3 : -3;
    building.style.transform = `translateX(${xMove}px)`;

    if (showMud && shakeCount === 10) {
      showMudWater(svg);
    }

    shakeCount++;

    if (shakeCount > 25) {
      clearInterval(shakeInterval);
      let move = 0;
      const sinkInterval = setInterval(() => {
        if (move >= depth) {
          clearInterval(sinkInterval);
          return;
        }
        move += 0.2;
        building.style.transform = `translateY(${move}px) rotate(${depth / 6}deg)`;
      }, 30);
    }
  }, 60);
}

function showMudWater(svg) {
  const svgRoot = svg.documentElement; 
  const mudPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  const initialPath = "M 50,217 Q 200,217 400,217 Q 600,217 750,217 L 750,217 L 50,217 Z";
  const expandedPath = "M 50,217 Q 150,205 300,215 Q 450,200 600,212 Q 700,205 750,217 L 750,225 L 50,225 Z";

  mudPath.setAttribute("d", initialPath);
  mudPath.setAttribute("fill", "#8f7640"); 
  mudPath.style.filter = "blur(3px)";
  mudPath.style.transition = "all 2.5s ease-out";
  
  svgRoot.appendChild(mudPath); 
  
  setTimeout(() => {
    mudPath.setAttribute("d", expandedPath);
    mudPath.style.opacity = "0.8";
  }, 100);
}

function justShake(element) {
  if (!element) return;
  let c = 0;
  const int = setInterval(() => {
    element.style.transform = `translateX(${c % 2 === 0 ? 2 : -2}px)`;
    if (c++ > 20) {
      clearInterval(int);
      element.style.transform = "none";
    }
  }, 50);
}