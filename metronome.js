document.addEventListener("DOMContentLoaded", function() {
    let isPlaying = false;
    let bpm = 60;
    let startTime;
    let lastPlayTime = 0;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const dot = document.getElementById("dot");
    const startStopButton = document.getElementById("startStopButton");
    const bpmInput = document.getElementById("bpmInput");
    const bpmButtons = document.querySelectorAll(".bpmButton");

    // ローカルストレージからBPMを読み込む
    const storedBpm = localStorage.getItem("metronomeBpm");
    if (storedBpm) {
        bpm = parseInt(storedBpm, 10);
        bpmInput.value = bpm;
    }

    // BPMボタンのイベントリスナーを設定
    bpmButtons.forEach(button => {
        button.addEventListener("click", function() {
            const selectedBpm = parseInt(this.getAttribute("data-bpm"), 10);
            setBpm(selectedBpm);
        });
    });

    // BPMの設定と保存を行う関数
    function setBpm(newBpm) {
        bpm = newBpm;
        bpmInput.value = newBpm;
        localStorage.setItem("metronomeBpm", newBpm);
        if (isPlaying) {
            stopMetronome();
            startTime = Date.now();
            lastPlayTime = 0;
            startMetronome();
        }
    }

    startStopButton.addEventListener("click", function() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            startTime = Date.now();
            lastPlayTime = 0;
            startMetronome();
        } else {
            stopMetronome();
        }
    });

    bpmInput.addEventListener("input", function() {
        bpm = this.value;
        // BPMをローカルストレージに保存
        localStorage.setItem("metronomeBpm", bpm);
        if (isPlaying) {
            stopMetronome();
            startTime = Date.now();
            lastPlayTime = 0;
            startMetronome();
        }
    });


    function startMetronome() {
        intervalId = setInterval(() => {
            updateDotPosition();
        }, 10); // 10ミリ秒ごとに点の位置を更新
    }

    function stopMetronome() {
        clearInterval(intervalId);
    }

    function playClick() {
        const currentTime = Date.now();
        if (currentTime - lastPlayTime > (60000 / bpm) / 2) { // 前回の音から半拍以上経過している場合のみ再生
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            gainNode.gain.value = 0.5;
            oscillator.frequency.value = 1000;

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);

            lastPlayTime = currentTime;
        }
    }

    function updateDotPosition() {
        const elapsedTime = Date.now() - startTime;
        const period = 120000 / bpm; // 周期を2倍にして点の速度を半分に
        const theta = 2 * Math.PI * elapsedTime / period;
        const cosTheta = Math.cos(theta);
        const lineLength = document.getElementById("line").offsetWidth;
        const dotSize = dot.offsetWidth;
        const maxPosition = lineLength - dotSize;

        dot.style.left = `${(cosTheta + 1) / 2 * maxPosition}px`;

        // クリック音を再生
        if (cosTheta > 0.99 || cosTheta < -0.99) {
            playClick();
        }
    }
});
