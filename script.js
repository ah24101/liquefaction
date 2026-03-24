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
    const soilLiq = document.getElementById("soil_liquefaction"); 
    const q1Yes = document.getElementById("q1_yes"); 
    const waterHigh = document.getElementById("q4_yes"); 

    // 重要：基準点を「地表（上端）」に固定する
    // これにより scaleY をかけた時に「下に向かって」伸びるようになります
    if (soilLiq) {
        soilLiq.style.transformOrigin = "center top"; 
        soilLiq.style.transformBox = "fill-box";
    }

    // ① 土層と液状化層の表示切り替え
    const updateSoilDisplay = () => {
        if (q1Yes.checked) {
            soilSand.style.setProperty("display", "block", "important");
            soilLiq.style.setProperty("display", "block", "important");
            soilCray.style.setProperty("display", "none", "important");
        } else {
            soilSand.style.setProperty("display", "none", "important");
            soilLiq.style.setProperty("display", "none", "important");
            soilCray.style.setProperty("display", "block", "important");
        }
        updateWaterEffect(); 
    };

    // ② 地下水と液状化層の伸縮（質問④連動）
    const updateWaterEffect = () => {
        groundwater.style.transition = "transform 1s ease";
        soilLiq.style.transition = "transform 1s ease";
        
        if (waterHigh.checked) {
            // 水位が高いとき
            groundwater.style.transform = "translateY(-50px)";
            // 基準点が top なので、上にはみ出さず下へ伸びる（倍率は適宜調整してください）
            soilLiq.style.transform = "scaleY(3.0)"; 
        } else {
            // 水位が低いとき
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
            startAnimation(60, 2); 
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
            buildings.style.transform = `translateY(${y}px) rotate(${depth/12}deg)`;
            
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
        
        const mudHeight = (level === 2) ? "75" : "50"; 
        mud.setAttribute("height", mudHeight);
        
        const groundLineY = 297; 
        const startY = groundLineY - mudHeight; 
        mud.setAttribute("y", startY.toString());

        mud.setAttribute("width", "766");
        mud.setAttribute("fill", "#795548"); 
        mud.style.filter = "blur(6px)"; 
        mud.style.opacity = "0";
        mud.style.transition = "opacity 2s ease-in-out";
        
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

    updateSoilDisplay();
});