const svgObject = document.getElementById("svgObject");

// init（説明書）の定義
function init() {
  console.log("initが実行された");
  const svg = svgObject.contentDocument;
  if (!svg) {
    console.error("svgの中身が見つかりません");
    return;
  }

  const groundwater = svg.getElementById("groundwater");
  const buildings = svg.getElementById("buildings");
  const msgArea = document.getElementById("result_message");

  // --- ① 水位の連動 ---
  const waterRadio = document.getElementById("q4_yes");
  const waterNormal = document.querySelectorAll('input[name="water_level"]');

  waterNormal.forEach(radio => {
    radio.onchange = () => {
      groundwater.style.transition = "transform 1s ease-in-out";
      groundwater.style.transform = waterRadio.checked ? "translateY(-50px)" : "translateY(0px)";
    };
  });

  // --- ② 実行ボタンの設定 ---
  document.getElementById("runB").onclick = () => {
    console.log("ボタンが押された");

    let score = 0;
    if (document.getElementById("q1_yes").checked) score += 2;
    if (document.getElementById("q2_yes").checked) score += 1;
    if (document.getElementById("q3_yes").checked) score += 2;
    if (document.getElementById("q4_yes").checked) score += 2;
    if (document.getElementById("q5_yes").checked) score += 1;

    console.log("計算スコア:", score);

    // 判定とスコアに応じたアクション
    if (score >= 6) {
      msgArea.innerHTML = `【判定：${score}点】液状化発生！<br>建物が沈下し、マンホールなどが浮き出てしまいます。`;
      msgArea.style.color = "red";
      startAnimation(svg, 20, true); // 深く沈む + 水が出る
    } else if (score >= 3) {
      msgArea.innerHTML = `【判定：${score}点】液状化発生の可能性あり。<br>少し地盤が弱くなり、建物が傾きます。`;
      msgArea.style.color = "orange";
      startAnimation(svg, 8, false); // 少し沈む
    } else {
      msgArea.innerHTML = `【判定：${score}点】地盤は安定しています。<br>液状化の心配はありません。`;
      msgArea.style.color = "blue";
      justShake(buildings); // 揺れるだけ
    }
  };
}

// --- ③ アニメーション関数（揺れ→沈下） ---
function startAnimation(svg, depth, showBubbles) {
  const building = svg.getElementById("buildings");
  building.style.transformBox = "fill-box";
  building.style.transformOrigin = "center";

  let shakeCount = 0;
  const shakeInterval = setInterval(() => {

    // 地震の揺れ
    const xMove = (shakeCount % 2 === 0) ? 3 : -3;
    building.style.transform = `translateX(${xMove}px)`;

    
    // 揺れの途中で泥水が出る演出（噴砂）
    if (showBubbles && shakeCount === 10) {
      showMudWater(svg); // 名前を showMudWater に変更
    }
    shakeCount++;

    if (shakeCount > 25) {
      clearInterval(shakeInterval);
      
      // 沈下開始
      let move = 0;
      const sinkInterval = setInterval(() => {
        if (move >= depth) {
          clearInterval(sinkInterval);
          return;
        }
        move += 0.2;
        // 深さに応じて少し傾ける(rotate)
        building.style.transform = `translateY(${move}px) rotate(${depth / 6}deg)`;
      }, 30);
    }
  }, 100);
}

// 泥水が地表に広がる演出（rectを使用）
function showMudWater(svg) {
  const svgRoot = svg.documentElement; 

  // 泥水の矩形(rect)を作成
  const mud = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  
  // 初期位置の設定（建物の足元付近）
  mud.setAttribute("x", "300"); 
  mud.setAttribute("y", "215"); // 地表(217)の少し上に重なる
  mud.setAttribute("width", "0"); // 最初は幅ゼロ
  mud.setAttribute("height", "4"); 
  mud.setAttribute("fill", "#8f7640"); // 泥の色（粘土層に近い茶色）
  mud.setAttribute("rx", "2"); // 角を丸くする
  
  svgRoot.appendChild(mud); 
  
  // アニメーション：2秒かけて横に広がり、少し不透明になる
  mud.style.transition = "all 2s ease-out";
  
  setTimeout(() => {
    mud.setAttribute("x", "240");   // 左側へ広がる
    mud.setAttribute("width", "280"); // 全体の横幅
    mud.style.opacity = "0.9";
  }, 100);
}
// --- ④ 泥水が不規則に広がる演出（波線・ぼかし） ---
function showMudWater(svg) {
  const svgRoot = svg.documentElement; 
  const mudPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  // 地表の座標 y=217 に合わせて、少し波打つ泥水の形を定義 (M:開始点, Q:ベジェ曲線)
  // 横幅いっぱいに広がるように数値を設定しています（x=50からx=750まで）
  const initialPath = "M 50,217 Q 200,217 400,217 Q 600,217 750,217 L 750,217 L 50,217 Z";
  const expandedPath = "M 50,217 Q 150,205 300,215 Q 450,200 600,212 Q 700,205 750,217 L 750,225 L 50,225 Z";

  mudPath.setAttribute("d", initialPath);
  mudPath.setAttribute("fill", "#8f7640"); // 泥の色
  mudPath.setAttribute("opacity", "0");
  
  // じわっとさせるための「ぼかし」フィルターをCSSで適用
  mudPath.style.filter = "blur(3px)";
  mudPath.style.transition = "all 2.5s ease-out";
  
  svgRoot.appendChild(mudPath); 
  
  // アニメーション：形が波打ちながら、じわっと浮き出る
  setTimeout(() => {
    mudPath.setAttribute("d", expandedPath);
    mudPath.setAttribute("opacity", "0.8");
  }, 100);
}
    
    

// 液状化なし（揺れるだけ）
function justShake(element) {
  let c = 0;
  const int = setInterval(() => {
    element.style.transform = `translateX(${c % 2 === 0 ? 2 : -2}px)`;
    if (c++ > 20) {
      clearInterval(int);
      element.style.transform = "none";
    }
  }, 100);
}

// 読み込み予約
if (svgObject.contentDocument && svgObject.contentDocument.readyState === "complete") {
  init();
} else {
  svgObject.onload = init;
}