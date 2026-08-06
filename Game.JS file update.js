const dino = document.getElementById('dino');
const scene = document.getElementById('scene');
const coinCounter = document.getElementById('coinCount');
const speechBubble = document.getElementById('speechBubble');
const mazeLayer = document.getElementById('mazeLayer');
const collectibleLayer = document.getElementById('collectibleLayer');
const overlay = document.getElementById('levelOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const overlayButton = document.getElementById('overlayButton');

let x = 100;
let y = 42;
let coinCount = 0;
let currentLevelIndex = 0;
let isLevelComplete = false;
const speed = 7;
const activeKeys = {};
let audioContext;
let animationFrameId = null;

const levels = [
    {
        title: 'Level 1',
        suns: [
            { x: 260, y: 340 }
        ],
        mazeTrees: [
            { x: 120, y: 80, w: 36, h: 200 },
            { x: 220, y: 80, w: 200, h: 36 },
            { x: 440, y: 120, w: 36, h: 160 },
            { x: 620, y: 80, w: 36, h: 200 },
            { x: 240, y: 300, w: 220, h: 36 },
            { x: 520, y: 310, w: 130, h: 36 },
            { x: 300, y: 200, w: 36, h: 80 },
            { x: 500, y: 200, w: 36, h: 80 },
            { x: 80, y: 140, w: 44, h: 36 },
            { x: 360, y: 150, w: 36, h: 80 },
            { x: 360, y: 360, w: 36, h: 80 },
            { x: 680, y: 300, w: 36, h: 80 }
        ]
    },
    {
        title: 'Level 2',
        // Total of five suns placed on the map; only two are required to finish
        suns: [
            { x: 220, y: 120 },
            { x: 560, y: 340 },
            { x: 100, y: 340 },
            { x: 420, y: 120 },
            { x: 700, y: 240 }
        ],
        sunsNeeded: 2,
        mazeTrees: [
            { x: 90, y: 60, w: 18, h: 220 },
            { x: 180, y: 60, w: 18, h: 220 },
            { x: 320, y: 60, w: 18, h: 220 },
            { x: 560, y: 60, w: 18, h: 220 },
            { x: 650, y: 60, w: 18, h: 220 },
            { x: 140, y: 280, w: 180, h: 18 },
            { x: 420, y: 280, w: 180, h: 18 },
            { x: 240, y: 180, w: 18, h: 100 },
            { x: 520, y: 180, w: 18, h: 100 },
            { x: 350, y: 350, w: 18, h: 120 },
            { x: 450, y: 350, w: 18, h: 120 },
            { x: 80, y: 360, w: 18, h: 90 },
            { x: 680, y: 360, w: 18, h: 90 }
        ]
    },
    {
        title: 'Level 3',
        suns: [
            { x: 180, y: 110 },
            { x: 700, y: 110 },
            { x: 180, y: 400 },
            { x: 700, y: 400 },
            { x: 430, y: 220 },
            { x: 600, y: 220 },
            { x: 330, y: 300 },
            { x: 520, y: 300 }
        ],
        mazeTrees: [
            { x: 110, y: 80, w: 36, h: 210 },
            { x: 200, y: 70, w: 220, h: 36 },
            { x: 420, y: 110, w: 36, h: 200 },
            { x: 610, y: 80, w: 36, h: 210 },
            { x: 210, y: 310, w: 220, h: 36 },
            { x: 490, y: 320, w: 150, h: 36 },
            { x: 290, y: 200, w: 36, h: 90 },
            { x: 370, y: 190, w: 36, h: 110 },
            { x: 460, y: 200, w: 36, h: 90 },
            { x: 310, y: 390, w: 36, h: 80 },
            { x: 80, y: 150, w: 44, h: 36 },
            { x: 360, y: 360, w: 36, h: 80 },
            { x: 680, y: 280, w: 36, h: 80 }
        ]
    }
    ,
    {
        title: 'Level 4',
        suns: [
            { x: 40, y: 140 },
            { x: 260, y: 120 },
            { x: 560, y: 220 },
            { x: 740, y: 340 }
        ],
        sunsNeeded: 4,
        mazeTrees: [
            { x: 80, y: 80, w: 24, h: 220 },
            { x: 220, y: 80, w: 220, h: 24 },
            { x: 480, y: 100, w: 24, h: 220 },
            { x: 640, y: 80, w: 24, h: 220 },
            { x: 200, y: 320, w: 320, h: 24 }
        ]
    },
    {
        title: 'Level 5',
        suns: [
            { x: 40, y: 110 },
            { x: 185, y: 110 },
            { x: 335, y: 110 },
            { x: 485, y: 110 },
            { x: 700, y: 110 }
        ],
        sunsNeeded: 5,
        mazeTrees: [
            { x: 110, y: 70, w: 36, h: 220 },
            { x: 260, y: 70, w: 36, h: 220 },
            { x: 410, y: 70, w: 36, h: 220 },
            { x: 560, y: 70, w: 36, h: 220 },
            { x: 330, y: 320, w: 240, h: 24 }
        ]
    }
];

function generateLevel(levelIndex) {
    const title = `Level ${levelIndex + 1}`;
    const maxSuns = Math.min(10, levelIndex + 1);
    const suns = [];
    const w = scene.clientWidth || 900;
    const h = scene.clientHeight || 560;
    const paddingX = 60;
    const paddingY = 60;

    for (let i = 0; i < maxSuns; i++) {
        const xPos = Math.round(paddingX + (i + 0.5) * (w - paddingX * 2) / maxSuns + ((i % 2) ? 20 : -20));
        const yPos = Math.round(paddingY + ((i * 73) % (h - paddingY * 2)));
        suns.push({ x: xPos, y: yPos });
    }

    const mazeTrees = [];
    const cols = 3 + (levelIndex % 4);
    for (let i = 0; i < cols; i++) {
        mazeTrees.push({ x: Math.round(60 + i * (w - 120) / cols), y: 60, w: 18, h: h - 120 });
    }

    return { title, suns, mazeTrees };
}

function rectsOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function isSunAccessible(sun, level) {
    const sunRect = { left: sun.x, right: sun.x + 30, top: sun.y, bottom: sun.y + 30 };
    return !level.mazeTrees.some((tree) => {
        const treeRect = { left: tree.x, right: tree.x + tree.w, top: tree.y, bottom: tree.y + tree.h };
        return rectsOverlap(sunRect, treeRect);
    });
}

function ensureAccessibleSuns(level, sunsNeeded) {
    const accessibleSuns = level.suns.filter((sun) => isSunAccessible(sun, level));
    if (accessibleSuns.length >= sunsNeeded) {
        level.suns = accessibleSuns;
        return level.suns;
    }

    const candidateSuns = [];
    const xSpacing = 120;
    const ySpacing = 100;
    const maxX = (scene.clientWidth || 900) - 40;
    const maxY = (scene.clientHeight || 560) - 40;

    for (let row = 0; row < 4 && accessibleSuns.length + candidateSuns.length < sunsNeeded; row++) {
        for (let col = 0; col < 7 && accessibleSuns.length + candidateSuns.length < sunsNeeded; col++) {
            const candidate = { x: 30 + col * xSpacing, y: 30 + row * ySpacing };
            if (candidate.x > maxX || candidate.y > maxY) {
                continue;
            }
            if ([...accessibleSuns, ...candidateSuns].some((sun) => Math.abs(sun.x - candidate.x) < 34 && Math.abs(sun.y - candidate.y) < 34)) {
                continue;
            }
            if (isSunAccessible(candidate, level)) {
                candidateSuns.push(candidate);
            }
        }
    }

    level.suns = accessibleSuns.concat(candidateSuns);
    return level.suns;
}

function moveDino() {
    dino.style.left = `${x}px`;
    dino.style.bottom = `${y}px`;
}

function updateCoinCount() {
    coinCounter.textContent = coinCount;
}

function playRoar() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(90, audioContext.currentTime + 0.35);

    gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
}

function showOverlay(title, message, buttonText, callback) {
    overlayTitle.textContent = title;
    overlayText.textContent = message;
    overlayButton.textContent = buttonText;
    overlayButton.onclick = callback;
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    overlay.classList.add('hidden');
}

function showCompletionScreen(callback) {
    overlay.innerHTML = `
        <div class="completion-screen">
            <div class="speech-bubble large">Congratulations!</div>
            <div class="continue-bubble" id="continueBubble">Continue</div>
        </div>
    `;
    const continueBubble = document.getElementById('continueBubble');
    continueBubble.addEventListener('click', callback);
    overlay.classList.remove('hidden');
}

function buildLevel(levelIndex) {
    const level = levels[levelIndex];
    const sunsNeededForLevel = (typeof level.sunsNeeded !== 'undefined') ? level.sunsNeeded : Math.min(level.suns.length, levelIndex + 1);
    level.suns = ensureAccessibleSuns(level, sunsNeededForLevel);

    mazeLayer.innerHTML = '';
    collectibleLayer.innerHTML = '';
    isLevelComplete = false;

    level.mazeTrees.forEach((tree) => {
        const treeNode = document.createElement('div');
        treeNode.className = 'maze-tree';
        treeNode.style.left = `${tree.x}px`;
        treeNode.style.top = `${tree.y}px`;
        treeNode.style.width = `${tree.w}px`;
        treeNode.style.height = `${tree.h}px`;
        mazeLayer.appendChild(treeNode);
    });

    level.suns.forEach((sun) => {
        const sunNode = document.createElement('div');
        sunNode.className = 'sun';
        sunNode.style.left = `${sun.x}px`;
        sunNode.style.top = `${sun.y}px`;
        collectibleLayer.appendChild(sunNode);
    });

    x = 90;
    y = 42;
    coinCount = 0;
    updateCoinCount();
    moveDino();
    hideOverlay();
}

function startLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    // If the requested level doesn't exist yet, generate it dynamically
    if (!levels[levelIndex]) {
        const generated = generateLevel(levelIndex);
        levels[levelIndex] = generated;
    }
    buildLevel(levelIndex);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(handleMovement);
}

function checkTreeCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const treeNodes = Array.from(mazeLayer.querySelectorAll('.maze-tree'));
    const sceneRect = scene.getBoundingClientRect();

    const insideBorder = dinoRect.left >= sceneRect.left + 4 && dinoRect.right <= sceneRect.right - 4 && dinoRect.top >= sceneRect.top + 4 && dinoRect.bottom <= sceneRect.bottom - 4;

    if (!insideBorder) {
        window.location.assign('index.html');
        return true;
    }

    for (const treeNode of treeNodes) {
        const treeRect = treeNode.getBoundingClientRect();
        const overlap = dinoRect.left < treeRect.right && dinoRect.right > treeRect.left && dinoRect.top < treeRect.bottom && dinoRect.bottom > treeRect.top;

        if (overlap) {
            const overlapArea = Math.max(0, Math.min(dinoRect.right, treeRect.right) - Math.max(dinoRect.left, treeRect.left)) * Math.max(0, Math.min(dinoRect.bottom, treeRect.bottom) - Math.max(dinoRect.top, treeRect.top));
            const dinoArea = (dinoRect.width * dinoRect.height) * 0.3;

            if (overlapArea >= dinoArea) {
                window.location.assign('index.html');
                return true;
            }
        }
    }
    return false;
}

function collectSuns() {
    if (isLevelComplete) {
        return;
    }

    const sunNodes = Array.from(collectibleLayer.querySelectorAll('.sun'));

    sunNodes.forEach((sun) => {
        const sunRect = sun.getBoundingClientRect();
        const dinoRect = dino.getBoundingClientRect();
        const isTouchingSun = sunRect.left < dinoRect.right && sunRect.right > dinoRect.left && sunRect.top < dinoRect.bottom && sunRect.bottom > dinoRect.top;
        const isBehindTree = Array.from(mazeLayer.querySelectorAll('.maze-tree')).some((tree) => {
            const treeRect = tree.getBoundingClientRect();
            return sunRect.left < treeRect.right && sunRect.right > treeRect.left && sunRect.top < treeRect.bottom && sunRect.bottom > treeRect.top;
        });

        if (isTouchingSun && !isBehindTree) {
            sun.remove();
            coinCount += 1;
            updateCoinCount();
            playRoar();
            dino.classList.remove('roaring');
            void dino.offsetWidth;
            dino.classList.add('roaring');
            window.setTimeout(() => dino.classList.remove('roaring'), 220);
        }
    });

    const level = levels[currentLevelIndex];
    const sunsNeededForLevel = (typeof level.sunsNeeded !== 'undefined') ? level.sunsNeeded : Math.min(level.suns.length, currentLevelIndex + 1);

    if (coinCount >= sunsNeededForLevel) {
        isLevelComplete = true;
        if (currentLevelIndex < levels.length - 1) {
            showCompletionScreen(() => startLevel(currentLevelIndex + 1));
        } else {
            showCompletionScreen(() => startLevel(0));
        }
    }
}

function handleMovement() {
    const maxY = Math.max(10, scene.clientHeight - dino.clientHeight - 10);
    const minY = 8;
    const maxX = Math.max(50, scene.clientWidth - dino.clientWidth - 10);
    const minX = 8;

    if (activeKeys['ArrowUp'] || activeKeys['w']) {
        y = Math.min(maxY, y + speed);
    }
    if (activeKeys['ArrowDown'] || activeKeys['s']) {
        y = Math.max(minY, y - speed);
    }
    if (activeKeys['ArrowLeft'] || activeKeys['a']) {
        x = Math.max(minX, x - speed);
    }
    if (activeKeys['ArrowRight'] || activeKeys['d']) {
        x = Math.min(maxX, x + speed);
    }

    moveDino();
    if (!checkTreeCollision()) {
        collectSuns();
    }
    animationFrameId = requestAnimationFrame(handleMovement);
}

window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
        activeKeys[event.key] = true;
        event.preventDefault();
    }
});

window.addEventListener('keyup', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
        activeKeys[event.key] = false;
    }
});

window.addEventListener('blur', () => {
    Object.keys(activeKeys).forEach((key) => {
        activeKeys[key] = false;
    });
});

dino.addEventListener('click', () => {
    speechBubble.classList.add('hidden');
});

startLevel(0);
