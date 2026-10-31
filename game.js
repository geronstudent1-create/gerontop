const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let score = 0;
let lives = 3;
let isGameOver = false;

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 45,
    width: 40,
    height: 40,
    speed: 6
};

let bullets = [];
let enemies = [];
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        shoot();
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

canvas.addEventListener('click', () => {
    if (!isGameOver) shoot();
});

function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 14,
        speed: 8
    });
}

function spawnEnemy() {
    if (isGameOver) return;
    const size = 30;
    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: 2 + Math.random() * 2
    });
}
setInterval(spawnEnemy, 1300);

function updateGame() {
    if (isGameOver) return;

    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Пули
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }

    // Враги
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;

        // Столкновение с игроком
        if (
            enemies[i].x < player.x + player.width &&
            enemies[i].x + enemies[i].width > player.x &&
            enemies[i].y < player.y + player.height &&
            enemies[i].y + enemies[i].height > player.y
        ) {
            enemies.splice(i, 1);
            lives--;
            updateLivesDisplay();
            if (lives <= 0) isGameOver = true;
            continue;
        }

        if (enemies[i].y > canvas.height) enemies.splice(i, 1);
    }

    // Попадания пуль во врагов
    for (let b = bullets.length - 1; b >= 0; b--) {
        for (let e = enemies.length - 1; e >= 0; e--) {
            if (
                bullets[b] && enemies[e] &&
                bullets[b].x < enemies[e].x + enemies[e].width &&
                bullets[b].x + bullets[b].width > enemies[e].x &&
                bullets[b].y < enemies[e].y + enemies[e].height &&
                bullets[b].y + bullets[b].height > enemies[e].y
            ) {
                bullets.splice(b, 1);
                enemies.splice(e, 1);
                score += 100;
                scoreEl.textContent = score;
                break;
            }
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка корабля-ножа
    ctx.fillStyle = '#8b3dff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#8b3dff';
    
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height - 10);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f3f0ff';
    ctx.fillRect(player.x + player.width / 2 - 4, player.y + player.height - 15, 8, 12);
    ctx.shadowBlur = 0;

    // Пули
    ctx.fillStyle = '#00ffcc';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Враги
    ctx.fillStyle = '#ff4757';
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.width, e.height);
    });

    // Конец игры
    if (isGameOver) {
        ctx.fillStyle = 'rgba(12, 9, 20, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f3f0ff';
        ctx.font = 'bold 30px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 15);

        ctx.fillStyle = '#9b8ebc';
        ctx.font = '15px Segoe UI';
        ctx.fillText('Кликните, чтобы начать заново', canvas.width / 2, canvas.height / 2 + 20);
    }
}

function updateLivesDisplay() {
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '♥';
    livesEl.textContent = hearts;
}

canvas.addEventListener('click', () => {
    if (isGameOver) {
        score = 0;
        lives = 3;
        scoreEl.textContent = score;
        updateLivesDisplay();
        enemies = [];
        bullets = [];
        player.x = canvas.width / 2 - 20;
        isGameOver = false;
    }
});

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();