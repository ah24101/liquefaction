document.addEventListener("DOMContentLoaded", () => {
    const runButton = document.getElementById("runB");
    const nextStepBtn = document.getElementById("next-step");
    const groundwater = document.getElementById("groundwater");
    const buildings = document.getElementById("buildings");
    const groundAll = document.getElementById("ground-all"); 
    const resultText = document.getElementById("resultText");
    const mainSvg = document.getElementById("mainSvg");

    const soilSand = document.getElementById("soil_sand");
    const soilCray = document.getElementById("soil_cray");
    const soilLiq = document.getElementById("soil_liquefaction"); // 液状化層パーツ
    const q1Yes = document.getElementById("q1_yes"); // 砂質土ラジオボタン
    const waterHigh = document.getElementById("q4_yes"); // 地下水高いラジオボタン

    // ① 土層と液状化層の表示切り替え
    const updateSoilDisplay = () => {
        if (q1Yes.checked) {
            soilSand.style.setProperty("display", "block", "important");
            soilLiq.style.setProperty("display", "block", "important"); // 砂なら液状化層を出す
            soilCray.style.setProperty("display", "none", "important");
        } else {
            soilSand.style.setProperty("display", "none", "important");
            soilLiq.style.setProperty("display", "none", "important"); // 粘土なら隠す
            soilCray.style.setProperty("display", "block", "important");
        }
        updateWaterEffect(); // 水位の状態も再計算
    };

    // ② 地下水と液状化層の伸縮（質問④連動）
    const updateWaterEffect = () => {
        groundwater.style.transition = "transform 1s ease";
        soilLiq.style.transition = "transform 1s ease";
        
        if (waterHigh.checked) {
            // 水位が高いとき：水を上げ、液状化層を縦に2倍に伸ばす
            groundwater.style.transform = "translateY(-50px)";
            soilLiq.style.transform = "scaleY(2.0)"; 
        } else {
            // 水位が低いとき：元の位置、液状化層は標準サイズ
            groundwater.style.transform = "translateY(0)";
            soilLiq.style.transform = "scaleY(1.0)";
        }
    };

    // イベント登録
    document.querySelectorAll('input[name="soil_type"]').forEach(radio => {
        radio.addEventListener("change", updateSoilDisplay);
    });
    document.querySelectorAll('input[name="water_level"]').forEach(radio => {
        radio.addEventListener("change", updateWaterEffect);
    });

    // ③ 地震発生
    runButton.onclick = () => {
        const oldMud = mainSvg.querySelectorAll(".mud-flow");
        oldMud.forEach(m => m.remove());
        nextStepBtn.style.display = "none";
        
        let score = 0;
        if (document.getElementById("q1_yes").checked) score += 2;
        if (document.getElementById("q2_yes").checked) score += 1;
        if (document.getElementById("q3_yes").checked) score += 2;
        if (document.getElementById("q4_yes").checked) score += 2;
        if (document.getElementById("q5_yes").checked) score += 1;

        if (score >= 6) {
            resultText.innerHTML = `判定：${score}点【激しい液状化】<br>泥水が噴き出し、建物が沈みます。`;
            resultText.style.color = "red";
            startAnimation(60, 2); // ズームに合わせて沈下量を深めに(60)
        } else if (score >= 3) {
            resultText.innerHTML = `判定：${score}点【液状化の可能性あり】<br>地面がぬかるみ、建物が傾きます。`;
            resultText.style.color = "orange";
            startAnimation(25, 1); 
        } else {
            resultText.innerHTML = `判定：${score}点【安定しています】`;
            resultText.style.color = "blue";
            justShake(groundAll); 
        }
    };

    function startAnimation(depth, mudLevel) {
        let count = 0;
        const shake = setInterval(() => {
            const offset = count % 2 === 0 ? 8 : -8;
            groundAll.style.transform = `translateX(${offset}px)`;
            buildings.style.transform = `translateX(${offset}px)`;
            
            if (mudLevel > 0 && count === 5) {
                showMudWater(mudLevel);
            }
            
            count++;
            if (count > 25) {
                clearInterval(shake);
                groundAll.style.transform = "translateX(0)"; 
                setTimeout(() => { sink(depth); }, 500); 
            }
        }, 80);
    }

    function sink(depth) {
        let y = 0;
        const interval = setInterval(() => {
            y += 0.5;
            // 建物が横に長いため、回転角度をマイルド(depth/12)に調整
            buildings.style.transform = `translateY(${y}px) rotate(${depth/12}deg)`;
            
            if (y >= depth) {
                clearInterval(interval);
                nextStepBtn.style.display = "block";
            }
        }, 40);
    }

    // 泥水要素の生成
function showMudWater(level) {
    const mud = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    mud.setAttribute("class", "mud-flow");
    mud.setAttribute("x", "41.91"); // 地盤の横幅に合わせる
    
    
    // 巨大建物に合わせて、以前よりさらに大きく(100)設定
    const mudHeight = (level === 2) ? "75" : "50"; // 激しい：100、可能性あり：50
    mud.setAttribute("height", mudHeight);
    
   
    // 地表(297)から、高さ分だけ「上」にずらすことで、地表より上に溜まるようにする
    const groundLineY = 297; 
    const startY = groundLineY - mudHeight; 
    mud.setAttribute("y", startY.toString()); // 例：激しい時は 297 - 100 = 197 からスタート

    mud.setAttribute("width", "766");
    mud.setAttribute("fill", "#795548"); // 泥っぽい茶色
    mud.style.filter = "blur(6px)"; // ドロドロ感を強調
    mud.style.opacity = "0";
    mud.style.transition = "opacity 2s ease-in-out";
    
    // 重ね順は「一番手前」
    mainSvg.appendChild(mud); 
    
    setTimeout(() => { 
        mud.style.opacity = "0.85"; 
    }, 50);
}

    function justShake(el) {
        let c = 0;
        const int = setInterval(() => {
            const offset = c % 2 === 0 ? 3 : -3;
            el.style.transform = `translateX(${offset}px)`;
            buildings.style.transform = `translateX(${offset}px)`;
            if (++c > 15) {
                clearInterval(int);
                el.style.transform = "none";
                buildings.style.transform = "none";
                nextStepBtn.style.display = "block";
            }
        }, 100);
    }

    // 初回実行
    updateSoilDisplay();
});