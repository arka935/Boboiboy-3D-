// ==================== TUNGGU SAMPAI HTML SIAP ====================
document.addEventListener('DOMContentLoaded', function() {
    
// ==================== AMBIL ELEMEN ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elemen UI
const menuScreen = document.getElementById('menuScreen');
const gameContainer = document.getElementById('gameContainer');
const currentModeSpan = document.getElementById('currentMode');
const skillIndicator = document.getElementById('skillIndicator');

// Tombol
const btnStart = document.getElementById('btnStart');
const btnSettings = document.getElementById('btnSettings');
const btnExit = document.getElementById('btnExit');
const closeSettings = document.getElementById('closeSettings');
const brightnessSlider = document.getElementById('brightness');
const uiScaleSlider = document.getElementById('uiScale');
const attackBtn = document.getElementById('attackBtn');
const jumpBtn = document.getElementById('jumpBtn');
const skillBtn = document.getElementById('skillBtn');
const resetBtn = document.getElementById('resetBtn');

// ==================== DATA ELEMENTAL ====================
const elements = [
    { name: "BoBoiBoy", color: "#FFD700", skill: "Elemental Punch" },
    { name: "Api", color: "#FF4500", skill: "Fire Ball" },
    { name: "Air", color: "#00BFFF", skill: "Water Slash" },
    { name: "Tanah", color: "#8B4513", skill: "Rock Smash" },
    { name: "Petir", color: "#FFD700", skill: "Thunder Strike" },
    { name: "Angin", color: "#90EE90", skill: "Wind Cutter" },
    { name: "Daun", color: "#32CD32", skill: "Leaf Blade" }
];
let currentIndex = 0;
let currentElement = elements[currentIndex];

// Status game
let score = 0;
let health = 100;
let isJumping = false;
let playerY = 0;
let jumpVelocity = 0;
let gravity = 0.8;
let onGround = true;

// Musuh & partikel
let enemies = [];
let particles = [];

// Variabel untuk animasi
let animationId = null;
let lastTimestamp = 0;

// ==================== FUNGSI SETTING ====================
function applySettings() {
    let brightness = brightnessSlider.value;
    let uiScale = uiScaleSlider.value;
    document.body.style.filter = `brightness(${brightness})`;
    const buttons = document.querySelectorAll('.controls button, .mode-status');
    buttons.forEach(el => {
        el.style.transform = `scale(${uiScale})`;
    });
}

if (brightnessSlider) brightnessSlider.addEventListener('input', applySettings);
if (uiScaleSlider) uiScaleSlider.addEventListener('input', applySettings);
if (closeSettings) {
    closeSettings.addEventListener('click', () => {
        const panel = document.getElementById('settingsPanel');
        if (panel) panel.classList.add('hidden');
    });
}

// ==================== FUNGSI GAME ====================
function resetGameState() {
    health = 100;
    score = 0;
    enemies = [];
    particles = [];
    currentIndex = 0;
    currentElement = elements[0];
    if (currentModeSpan) currentModeSpan.innerText = currentElement.name;
    if (skillIndicator) skillIndicator.innerText = `Skill: ${currentElement.skill}`;
    playerY = 0;
    jumpVelocity = 0;
    isJumping = false;
    onGround = true;
    
    // Spawn musuh pertama
    for(let i = 0; i < 2; i++) {
        generateEnemy();
    }
}

function generateEnemy() {
    enemies.push({
        x: canvas.width + 50 + Math.random() * 200,
        y: 0,
        width: 45,
        height: 55,
        health: 30,
        maxHealth: 30,
        color: "#8B0000",
        speed: 1.5 + Math.random()
    });
    
    // Spawn musuh baru setiap 3 detik
    setTimeout(generateEnemy, 3000 + Math.random() * 2000);
}

function getClosestEnemy() {
    if (enemies.length === 0) return null;
    let closest = enemies[0];
    let minDist = Math.abs(closest.x - 100);
    for (let e of enemies) {
        let dist = Math.abs(e.x - 100);
        if (dist < minDist) {
            minDist = dist;
            closest = e;
        }
    }
    return closest;
}

function attack() {
    let closest = getClosestEnemy();
    if (closest) {
        closest.health -= 20;
        spawnParticle(closest.x + 25, canvas.height - 120 + closest.y, "white", 8);
        if (closest.health <= 0) {
            enemies = enemies.filter(e => e !== closest);
            score += 10;
        }
    }
}

function skillAttack() {
    let closest = getClosestEnemy();
    if (closest) {
        let damage = 50;
        closest.health -= damage;
        spawnParticle(closest.x + 25, canvas.height - 120 + closest.y, currentElement.color, 20);
        if (closest.health <= 0) {
            enemies = enemies.filter(e => e !== closest);
            score += 20;
        }
        if (skillIndicator) {
            skillIndicator.innerText = `${currentElement.skill}! 💥`;
            setTimeout(() => {
                skillIndicator.innerText = `Skill: ${currentElement.skill}`;
            }, 800);
        }
    }
}

function changeElement() {
    currentIndex = (currentIndex + 1) % elements.length;
    currentElement = elements[currentIndex];
    if (currentModeSpan) currentModeSpan.innerText = currentElement.name;
    if (skillIndicator) skillIndicator.innerText = `Skill: ${currentElement.skill}`;
    spawnParticle(canvas.width/2, canvas.height/2, currentElement.color, 15);
}

function jump() {
    if (onGround) {
        jumpVelocity = -10;
        onGround = false;
        isJumping = true;
    }
}

function spawnParticle(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y, 
            vx: (Math.random() - 0.5) * 5, 
            vy: (Math.random() - 0.5) * 5 - 2,
            life: 30, 
            color: color, 
            size: 4 + Math.random() * 3
        });
    }
}

// ==================== UPDATE GAME ====================
function updateGame() {
    if (!canvas) return;
    
    // Update posisi player (jump physics)
    if (!onGround) {
        playerY += jumpVelocity;
        jumpVelocity += gravity;
        if (playerY >= 0) {
            playerY = 0;
            onGround = true;
            isJumping = false;
            jumpVelocity = 0;
        }
    }
    
    // Update musuh
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].x -= enemies[i].speed;
        if (enemies[i].x < 60) {
            health -= 15;
            enemies.splice(i,1);
            i--;
            if (health <= 0) {
                alert("Game Over! Score: " + score);
                resetGameState();
                health = 100;
            }
        }
    }
    
    // Update partikel
    for (let i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life--;
        if (particles[i].life <= 0) {
            particles.splice(i,1);
            i--;
        }
    }
}

// ==================== RENDER ====================
function draw() {
    if (!canvas || !ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    // Langit gradien
    let grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0a2f6c");
    grad.addColorStop(1, "#3a8fd0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    
    // Tanah
    const groundY = h - 100;
    ctx.fillStyle = "#5c3e1f";
    ctx.fillRect(0, groundY, w, 100);
    ctx.fillStyle = "#8b5a2b";
    for(let i = 0; i < 20; i++) {
        ctx.fillRect(0, groundY - 5 + i*2, w, 2);
    }
    
    // Karakter BoBoiBoy
    const playerX = 100;
    const playerBaseY = groundY - 65 + playerY;
    
    // Badan
    ctx.fillStyle = currentElement.color;
    ctx.fillRect(playerX - 25, playerBaseY, 50, 65);
    
    // Kepala
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(playerX, playerBaseY - 5, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Mata
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(playerX - 12, playerBaseY - 12, 7, 0, Math.PI * 2);
    ctx.arc(playerX + 12, playerBaseY - 12, 7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(playerX - 12, playerBaseY - 14, 3, 0, Math.PI * 2);
    ctx.arc(playerX + 12, playerBaseY - 14, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Senyum
    ctx.beginPath();
    ctx.arc(playerX, playerBaseY - 3, 12, 0.1, Math.PI - 0.1);
    ctx.stroke();
    
    // Topi
    ctx.fillStyle = "#FF6600";
    ctx.fillRect(playerX - 30, playerBaseY - 25, 60, 12);
    ctx.fillRect(playerX - 15, playerBaseY - 38, 30, 15);
    
    // Musuh
    for (let e of enemies) {
        const enemyY = groundY - e.height;
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, enemyY, e.width, e.height);
        
        // Mata musuh
        ctx.fillStyle = "white";
        ctx.fillRect(e.x + 8, enemyY + 12, 10, 10);
        ctx.fillRect(e.x + 28, enemyY + 12, 10, 10);
        ctx.fillStyle = "black";
        ctx.fillRect(e.x + 10, enemyY + 14, 6, 6);
        ctx.fillRect(e.x + 30, enemyY + 14, 6, 6);
        
        // Health bar
        const healthPercent = e.health / e.maxHealth;
        ctx.fillStyle = "red";
        ctx.fillRect(e.x, enemyY - 12, e.width, 6);
        ctx.fillStyle = "lime";
        ctx.fillRect(e.x, enemyY - 12, e.width * healthPercent, 6);
    }
    
    // Partikel
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    
    // UI Text
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 2;
    ctx.fillText(`❤ Health: ${health}`, 20, 50);
    ctx.fillText(`⭐ Score: ${score}`, 20, 85);
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`Mode: ${currentElement.name}`, w - 150, 50);
    ctx.shadowBlur = 0;
}

// ==================== GAME LOOP ====================
function gameLoop() {
    if (!gameContainer || gameContainer.classList.contains('hidden')) {
        return;
    }
    updateGame();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// ==================== RESIZE CANVAS ====================
function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

// ==================== START GAME ====================
function startGame() {
    resetGameState();
    resizeCanvas();
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    gameLoop();
}

// ==================== EVENT LISTENER ====================
if (btnStart) {
    btnStart.addEventListener('click', () => {
        menuScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        startGame();
    });
}

if (btnSettings) {
    btnSettings.addEventListener('click', () => {
        const panel = document.getElementById('settingsPanel');
        if (panel) panel.classList.remove('hidden');
    });
}

if (btnExit) {
    btnExit.addEventListener('click', () => {
        alert("Keluar dari game. Tutup tab browser untuk keluar sepenuhnya.");
    });
}

if (attackBtn) {
    attackBtn.addEventListener('click', () => attack());
}

if (jumpBtn) {
    jumpBtn.addEventListener('click', () => jump());
}

if (skillBtn) {
    skillBtn.addEventListener('click', () => {
        skillAttack();
        changeElement();
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => resetGameState());
}

// Keyboard support
window.addEventListener('keydown', (e) => {
    if (gameContainer && gameContainer.classList.contains('hidden')) return;
    const key = e.key.toLowerCase();
    if (key === ' ' || key === 'arrowup') {
        e.preventDefault();
        jump();
    }
    if (key === 'a') {
        e.preventDefault();
        attack();
    }
    if (key === 's') {
        e.preventDefault();
        skillAttack();
        changeElement();
    }
    if (key === 'r') {
        e.preventDefault();
        resetGameState();
    }
});

// Resize event
window.addEventListener('resize', () => {
    resizeCanvas();
});

// Inisialisasi ukuran canvas awal
resizeCanvas();

// Cek error
window.addEventListener('error', function(e) {
    console.error('Error:', e.message);
    const errorDiv = document.getElementById('errorMsg');
    if(errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.innerText = 'Error: ' + e.message;
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
});

}); // Akhir DOMContentLoaded
