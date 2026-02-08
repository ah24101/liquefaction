document.addEventListener("DOMContentLoaded", () => {
    const runButton = document.getElementById("runB");
    const nextStepBtn = document.getElementById("next-step");
    const groundwater = document.getElementById("groundwater");
    const buildings = document.getElementById("buildings");
    const groundAll = document.getElementById("ground-all"); // 地盤グループ
    const resultText = document.getElementById("resultText");
    const mainSvg = document.getElementById("mainSvg");

    // 土層の切り替え要素
    const soilSand = document.getElementById("soil_sand");
    const soilCray = document.getElementById("soil_cray");
    const q1Yes = document.getElementById("q1_yes");

    // ① 土の種類による地盤表示の切り替え
    document.querySelectorAll('input[name="soil_type"]').forEach(radio => {
        radio.addEventListener("change", () => {
            if (q1Yes.checked) {
                soilSand.style.display = "block";
                soilCray.style.display = "none";
            } else {
                soilSand.style.display = "none";
                soilCray.style.display = "block";
            }
        });
    });

    // 地下水位のリアルタイム反映
    const waterHigh = document.getElementById("q4_yes");
    document.querySelectorAll('input[name="water_level"]').forEach(radio => {
        radio.addEventListener("change", () => {
            groundwater.style.transition = "transform 1s ease";
            groundwater.style.transform = waterHigh.checked ? "translateY(-50px)" : "translateY(0)";
        });
    });

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
            startAnimation(30, 3); 
        } else if (score >= 3) {
            resultText.innerHTML = `判定：${score}点【液状化の可能性あり】<br>地面がぬかるみ、建物が傾きます。`;
            resultText.style.color = "orange";
            startAnimation(10, 1.5); 
        } else {
            resultText.innerHTML = `判定：${score}点【安定しています】`;
            resultText.style.color = "blue";
            justShake(groundAll); // 地盤を揺らす
        }
    };

    function startAnimation(depth, mudLevel) {
        // ③ 地盤を揺らす設定
        let count = 0;
        const shake = setInterval(() => {
            // 地盤(groundAll)を揺らす
            groundAll.style.transform = `translateX(${count % 2 === 0 ? 5 : -5}px)`;
            // 建物も一緒に揺らす（地盤の上に乗っているため）
            buildings.style.transform = `translateX(${count % 2 === 0 ? 5 : -5}px)`;
            
            if (mudLevel > 0 && count === 5) {
                showMudWater(mudLevel);
            }
            
            count++;
            
            if (count > 25) {
                clearInterval(shake);
                groundAll.style.transform = "translateX(0)"; // 地盤の揺れを戻す
                
                setTimeout(() => {
                    sink(depth); // 沈下は建物のみ
                }, 500); 
            }
        }, 100);
    }

    function sink(depth) {
        let y = 0;
        buildings.style.transformBox = "fill-box";
        buildings.style.transformOrigin = "center bottom";
        const interval = setInterval(() => {
            y += 0.2;
            buildings.style.transform = `translateY(${y}px) rotate(${depth/8}deg)`;
            
            if (y >= depth) {
                clearInterval(interval);
                nextStepBtn.style.display = "block";
            }
        }, 40);
    }

    function showMudWater(level) {
        const mud = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        mud.setAttribute("class", "mud-flow");
        mud.setAttribute("x", "41.91");
        mud.setAttribute("y", "297");
        mud.setAttribute("width", "766");
        
        const mudHeight = (level === 2) ? "40" : "15";
        mud.setAttribute("height", mudHeight);
        mud.setAttribute("fill", "#5d4037");
        mud.style.filter = "blur(5px)"; 
        mud.style.opacity = "0";
        mud.style.transition = "opacity 3.5s ease-in-out";
        
        mainSvg.insertBefore(mud, buildings); // 建物の背後に表示
        
        setTimeout(() => { 
            mud.style.opacity = "0.7";
        }, 50);
    }

    function justShake(el) {
        let c = 0;
        const int = setInterval(() => {
            el.style.transform = `translateX(${c % 2 === 0 ? 2 : -2}px)`;
            buildings.style.transform = `translateX(${c % 2 === 0 ? 2 : -2}px)`;
            if (++c > 15) {
                clearInterval(int);
                el.style.transform = "none";
                buildings.style.transform = "none";
                nextStepBtn.style.display = "block";
            }
        }, 100);
    }
});