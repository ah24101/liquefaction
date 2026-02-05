document.addEventListener("DOMContentLoaded", () => {
    const runButton = document.getElementById("runB");
    const nextStepBtn = document.getElementById("next-step");
    const groundwater = document.getElementById("groundwater");
    const buildings = document.getElementById("buildings");
    const resultText = document.getElementById("resultText");
    const mainSvg = document.getElementById("mainSvg");

    // 地下水位のリアルタイム反映
    const waterHigh = document.getElementById("q4_yes");
    document.querySelectorAll('input[name="water_level"]').forEach(radio => {
        radio.addEventListener("change", () => {
            groundwater.style.transition = "transform 1s ease";
            groundwater.style.transform = waterHigh.checked ? "translateY(-50px)" : "translateY(0)";
        });
    });

    runButton.onclick = () => {
        // 前回の泥水をリセット
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
            justShake(buildings);
        }
    };

    function startAnimation(depth, mudLevel) {
        buildings.style.transformBox = "fill-box";
        buildings.style.transformOrigin = "center bottom";
        
        // 1. まず「揺れ」を開始
        let count = 0;
        const shake = setInterval(() => {
            buildings.style.transform = `translateX(${count % 2 === 0 ? 5 : -5}px)`;
            
            // 2. 揺れの途中で「泥水」がじわじわ出てくる
            if (mudLevel > 0 && count === 5) {
                showMudWater(mudLevel);
            }
            
            count++;
            
            // 3. 揺れが十分に続いたら（約2.5秒後）、揺れを止めて「沈下」へ
            if (count > 25) {
                clearInterval(shake);
                
                // 泥水が広がりきった頃を見計らって沈下開始（少し待機してリアリティを出す）
                setTimeout(() => {
                    sink(depth);
                }, 500); 
            }
        }, 100);
    }

    function sink(depth) {
        let y = 0;
        const interval = setInterval(() => {
            y += 0.2; // 沈むスピード（ゆっくり）
            buildings.style.transform = `translateY(${y}px) rotate(${depth/8}deg)`;
            
            if (y >= depth) {
                clearInterval(interval);
                // 全てのアニメーションが終わったらCanvaボタンを表示
                nextStepBtn.style.display = "block";
            }
        }, 40);
    }

    function showMudWater(level) {
        const mud = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        mud.setAttribute("class", "mud-flow");
        mud.setAttribute("x", "1.4");
        mud.setAttribute("y", "215");
        mud.setAttribute("width", "765");
        
        const mudHeight = (level === 2) ? "50" : "20";
        mud.setAttribute("height", mudHeight);
        mud.setAttribute("fill", "#5d4037");
        
        const targetOpacity = (level === 2) ? "1.0" : "0.8";
        mud.style.filter = "blur(7px)"; 
        mud.style.opacity = "0";
        // じわ〜っとゆっくり染み出す（3.5秒かけて不透明度を上げる）
        mud.style.transition = "opacity 3.5s ease-in-out, transform 4s ease-out";
        
        mainSvg.appendChild(mud);
        
        setTimeout(() => { 
            mud.style.opacity = targetOpacity;
            mud.style.transform = "translateY(-15px)";
        }, 50);
    }

    function justShake(el) {
        let c = 0;
        const int = setInterval(() => {
            el.style.transform = `translateX(${c % 2 === 0 ? 2 : -2}px)`;
            if (++c > 15) {
                clearInterval(int);
                el.style.transform = "none";
                nextStepBtn.style.display = "block";
            }
        }, 100);
    }
});