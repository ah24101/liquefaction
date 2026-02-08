document.addEventListener("DOMContentLoaded", () => {
    // ------------------------------------------------------------
    // 1. 要素の取得
    // ------------------------------------------------------------
    const runButton = document.getElementById("runB");
    const nextStepBtn = document.getElementById("next-step");
    const groundwater = document.getElementById("groundwater");
    const buildings = document.getElementById("buildings");
    const groundAll = document.getElementById("ground-all"); // 地盤全体グループ
    const resultText = document.getElementById("resultText");
    const mainSvg = document.getElementById("mainSvg");

    // 土層の切り替え用
    const soilSand = document.getElementById("soil_sand");
    const soilCray = document.getElementById("soil_cray");
    const q1Yes = document.getElementById("q1_yes"); // 「砂質土」のラジオボタン

    // ------------------------------------------------------------
    // 2. インタラクティブな表示切り替え
    // ------------------------------------------------------------

    // ① 土の種類による地盤表示の切り替え（!importantで強制適用）
    const updateSoilDisplay = () => {
        if (q1Yes.checked) {
            // 砂質土を表示
            soilSand.style.setProperty("display", "block", "important");
            soilCray.style.setProperty("display", "none", "important");
        } else {
            // 粘土層を表示
            soilSand.style.setProperty("display", "none", "important");
            soilCray.style.setProperty("display", "block", "important");
        }
    };

    document.querySelectorAll('input[name="soil_type"]').forEach(radio => {
        radio.addEventListener("change", updateSoilDisplay);
    });

    // 地下水位のリアルタイム反映
    const waterHigh = document.getElementById("q4_yes");
    document.querySelectorAll('input[name="water_level"]').forEach(radio => {
        radio.addEventListener("change", () => {
            groundwater.style.transition = "transform 1s ease";
            groundwater.style.transform = waterHigh.checked ? "translateY(-50px)" : "translateY(0)";
        });
    });

    // ------------------------------------------------------------
    // 3. メインロジック（地震発生ボタン）
    // ------------------------------------------------------------
    runButton.onclick = () => {
        // 前回の泥水をリセット
        const oldMud = mainSvg.querySelectorAll(".mud-flow");
        oldMud.forEach(m => m.remove());
        nextStepBtn.style.display = "none";
        
        // スコア計算
        let score = 0;
        if (document.getElementById("q1_yes").checked) score += 2; // 砂質土
        if (document.getElementById("q2_yes").checked) score += 1; // 均一
        if (document.getElementById("q3_yes").checked) score += 2; // 緩い
        if (document.getElementById("q4_yes").checked) score += 2; // 地下水高い
        if (document.getElementById("q5_yes").checked) score += 1; // 埋立地

        // 判定とアニメーション分岐
        if (score >= 6) {
            resultText.innerHTML = `判定：${score}点【激しい液状化】<br>泥水が噴き出し、建物が沈みます。`;
            resultText.style.color = "red";
            startAnimation(30, 3); // 沈下深め、泥水多め
        } else if (score >= 3) {
            resultText.innerHTML = `判定：${score}点【液状化の可能性あり】<br>地面がぬかるみ、建物が傾きます。`;
            resultText.style.color = "orange";
            startAnimation(10, 1.5); // 沈下浅め、泥水少なめ
        } else {
            resultText.innerHTML = `判定：${score}点【安定しています】`;
            resultText.style.color = "blue";
            justShake(groundAll); // 地盤だけ揺れて終わり
        }
    };

    // ------------------------------------------------------------
    // 4. アニメーション関数
    // ------------------------------------------------------------

    // 揺れ＋泥水アニメーション
    function startAnimation(depth, mudLevel) {
        let count = 0;
        const shake = setInterval(() => {
            // 地盤(groundAll)と建物(buildings)を一緒に揺らす
            const offset = count % 2 === 0 ? 5 : -5;
            groundAll.style.transform = `translateX(${offset}px)`;
            buildings.style.transform = `translateX(${offset}px)`;
            
            // 揺れの途中で泥水が出現
            if (mudLevel > 0 && count === 5) {
                showMudWater(mudLevel);
            }
            
            count++;
            
            if (count > 25) {
                clearInterval(shake);
                // 位置をリセット
                groundAll.style.transform = "translateX(0)";
                
                // 少し置いてから沈下開始
                setTimeout(() => {
                    sink(depth);
                }, 500); 
            }
        }, 100);
    }

    // 沈下・傾斜アニメーション
    function sink(depth) {
        let y = 0;
        buildings.style.transformBox = "fill-box";
        buildings.style.transformOrigin = "center bottom";
        const interval = setInterval(() => {
            y += 0.2; // ゆっくり沈む
            // 沈下と同時に傾く
            buildings.style.transform = `translateY(${y}px) rotate(${depth/8}deg)`;
            
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
        mud.setAttribute("y", "297");  // 地表ライン
        mud.setAttribute("width", "766");
        
        const mudHeight = (level === 2) ? "40" : "15";
        mud.setAttribute("height", mudHeight);
        mud.setAttribute("fill", "#5d4037");
        mud.style.filter = "blur(5px)"; 
        mud.style.opacity = "0";
        mud.style.transition = "opacity 3.5s ease-in-out";
        
        // 建物の背後（地盤の上）に挿入
        mainSvg.insertBefore(mud, buildings);
        
        setTimeout(() => { 
            mud.style.opacity = "0.7";
        }, 50);
    }

    // 液状化しない場合の揺れ
    function justShake(el) {
        let c = 0;
        const int = setInterval(() => {
            const offset = c % 2 === 0 ? 2 : -2;
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
});