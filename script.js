// SVG要素の取得
const svgObject = document.getElementById("svgObject");

// シミュレーション実行関数
function simulate() {
  console.log("ボタンが押された");
  
  const svg = svgObject.contentDocument;
  if (!svg) {
    alert("SVGがまだ読み込まれていません。少し待ってから再度押してください。");
    return;
  }

  const resultText = document.getElementById("resultText");

  // --- 1. スコア計算 (HTMLのIDに合わせました) ---
  let score = 0;
  
  // チェックが入っていたら加点
  if (document.getElementById("q1_yes").checked) score += 2;
  if (document.getElementById("q2_yes").checked) score += 1;
  if (document.getElementById("q3_yes").checked) score += 2;
  if (document.getElementById("q4_yes").checked) score += 2;
  if (document.getElementById("q5_yes").checked) score += 1;

  console.log("計算スコア:", score);

  // --- 2. 地下水位の連動 (追加した部分) ---
  const groundwater = svg.getElementById("groundwater");
  if (groundwater) {
    const waterRect = groundwater.querySelector("rect");
    if (waterRect) {
      // 「地下水が高い」にチェックがあれば高い位置(224.91)、なければ低い位置(274.91)
      const isHigh = document.getElementById("q4_yes").checked;
      waterRect.setAttribute("y", isHigh ? "224.91" : "274.91");
      console.log("地下水位を更新:", isHigh ? "高" : "低");
    }
  }

  // --- 3. 判定に応じたアクション ---
  if (score >= 6) {
    resultText.innerHTML = `【判定：${score}点】激しい液状化が発生！<br>地表には泥水が噴き出します。`;
    resultText.style.color = "red";
    startAnimation(svg, 20, true); // 沈む＋泥水
  } else if (score >= 3) {
    resultText.innerHTML = `【判定：${score}点】液状化の可能性あり。<br>少し地盤が弱くなり、建物が傾きます。`;
    resultText.style.color = "orange";
    startAnimation(svg, 8, false); // 少し沈む
  } else {
    resultText.innerHTML = `【判定：${score}点】地盤は安定しています。`;
    resultText.style.color = "blue";
    const buildings = svg.getElementById("buildings");
    justShake(buildings); // 揺れるだけ
  }
}

// --- 以下、アニメーション関連 ---

function startAnimation(svg, depth, showMud) {
  const building = svg.getElementById("buildings");
  if (!building) {
    console.error("SVG内に 'buildings' というIDが見つかりません。");
    return;
  }

  // SVGでは setAttribute を使う
  building.setAttribute("transform-origin", "center");
  building.setAttribute("transform-box", "fill-box");


  let shakeCount = 0;

  const shakeInterval = setInterval(() => {
    const xMove = shakeCount % 2 === 0 ? 3 : -3;
    building.setAttribute("transform", `translate(${xMove}, 0)`);

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
        building.setAttribute(
          "transform",
          `translate(0 ${move}) rotate(${depth / 6})`
        );
      }, 30);
    }
  }, 100);
}

function showMudWater(svg) {
  const svgRoot = svg.documentElement; 
  const mudPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  const initialPath = "M 50,217 Q 200,217 400,217 Q 600,217 750,217 L 750,217 L 50,217 Z";
  const expandedPath = "M 50,217 Q 150,205 300,215 Q 450,200 600,212 Q 700,205 750,217 L 750,225 L 50,225 Z";

  mudPath.setAttribute("d", initialPath);
  mudPath.setAttribute("fill", "#8f7640"); 
  mudPath.setAttribute("opacity", "0.8");
  mudPath.setAttribute("filter", "url(#blur)");

  svgRoot.appendChild(mudPath); 
  
  setTimeout(() => {
    mudPath.setAttribute("d", expandedPath);
  }, 100);
}

function justShake(element) {
  if (!element) return;

  let c = 0;
  const int = setInterval(() => {
    const x = c % 2 === 0 ? 2 : -2;
    element.setAttribute("transform", `translate(${x}, 0)`);

    if (c++ > 20) {
      clearInterval(int);
      element.setAttribute("transform", "translate(0, 0)");
    }
  }, 50);
}
