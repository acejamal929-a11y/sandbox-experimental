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
    },
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

function createMazeLevel(levelData) {
    mazeLayer.innerHTML = '';
    levelData.mazeTrees.forEach((tree) => {
        const treeEl = document.createElement('div');
        treeEl.className = 'maze-tree';
        treeEl.style.left = `${tree.x}px`;
        treeEl.style.top = `${tree.y}px`;
        treeEl.style.width = `${tree.w}px`;
        treeEl.style.height = `${tree.h}px`;
        mazeLayer.appendChild(treeEl);
    });
}

function createSuns(levelData) {
    collectibleLayer.innerHTML = '';
    levelData.suns.forEach((sun, index) => {
        const sunEl = document.createElement('div');
        sunEl.className = 'sun';
        sunEl.style.left = `${sun.x}px`;
        sunEl.style.top = `${sun.y}px`;
        sunEl.dataset.index = index;
        collectibleLayer.appendChild(sunEl);
    });
}

function updateHUD() {
    coinCounter.textContent = coinCount;
    speechBubble.textContent = `Collect ${levels[currentLevelIndex].sunsNeeded ?? levels[currentLevelIndex].suns.length} suns to finish!`;
}

function endGame(message) {
    overlayTitle.textContent = 'Finished!';
    overlayText.textContent = message;
    overlay.classList.remove('hidden');
    overlayButton.textContent = 'Play Again';
}

function checkLevelCompletion(levelData) {
    const requiredSuns = levelData.sunsNeeded ?? levelData.suns.length;
    if (coinCount >= requiredSuns) {
        currentLevelIndex++;
        if (currentLevelIndex >= levels.length) {
            endGame('You completed all levels!');
            return;
        }
        setupLevel();
    }
}

function setupLevel() {
    isLevelComplete = false;
    coinCount = 0;
    const levelData = levels[currentLevelIndex];
    const sunsNeeded = levelData.sunsNeeded ?? levelData.suns.length;
    ensureAccessibleSuns(levelData, sunsNeeded);
    createMazeLevel(levelData);
    createSuns(levelData);
    updateHUD();
    dino.style.left = `${x}px`;
    dino.style.bottom = `${y}px`;
}

function onKeyDown(event) {
    activeKeys[event.key] = true;
}

function onKeyUp(event) {
    activeKeys[event.key] = false;
}

function moveDino() {
    if (activeKeys['ArrowUp'] || activeKeys['w']) {
        y += speed;
    }
    if (activeKeys['ArrowDown'] || activeKeys['s']) {
        y -= speed;
    }
    if (activeKeys['ArrowLeft'] || activeKeys['a']) {
        x -= speed;
    }
    if (activeKeys['ArrowRight'] || activeKeys['d']) {
        x += speed;
    }

    x = Math.max(0, Math.min(x, scene.clientWidth - dino.clientWidth));
    y = Math.max(0, Math.min(y, scene.clientHeight - dino.clientHeight));

    dino.style.left = `${x}px`;
    dino.style.bottom = `${y}px`;
}

function collectSuns() {
    const dinoRect = dino.getBoundingClientRect();
    document.querySelectorAll('.sun').forEach((sunEl) => {
        const sunRect = sunEl.getBoundingClientRect();
        if (rectsOverlap(dinoRect, sunRect)) {
            coinCount++;
            sunEl.remove();
            updateHUD();
            checkLevelCompletion(levels[currentLevelIndex]);
        }
    });
}

function gameLoop() {
    moveDino();
    collectSuns();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!animationFrameId) {
        speechBubble.textContent = 'Use arrow keys or WASD to move!';
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function handleOverlayButtonClick() {
    overlay.classList.add('hidden');
    currentLevelIndex = 0;
    setupLevel();
}

function initGame() {
    setupLevel();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    dino.addEventListener('click', startGame);
    overlayButton.addEventListener('click', handleOverlayButtonClick);
}

window.addEventListener('load', initGame);
