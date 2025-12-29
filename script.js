const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ===== RESIZE ===== */
function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* ===== PLAYER MOUSE ===== */
const mouse = { x: innerWidth/2, y: innerHeight/2 };
addEventListener("mousemove", e=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/* ===== PARTICLES ===== */
const particles = [];
const MAX_PARTICLES = 60;

function createParticle(x,y){
  particles.push({
    x, y,
    vx:(Math.random()-0.5)*2,
    vy:(Math.random()-0.5)*2,
    life:20 + Math.random()*30,
    color:`hsl(${Math.random()*360},100%,50%)`,
    size:2 + Math.random()*3
  });
}

/* ===== SNAKE SETUP ===== */
const COUNT = 90;
const DIST = 8;
let SPEED = 0.02;
let ENEMY_SPEED = 0.015;
let time = 0;
let gameOver = false;
let gameOverAnim = 0;

let playerSnake = [];
let enemySnake = [];

const colors = ["#ff0000","#00ff00","#ffff00","#00ffff","#ff00ff","#ffa500"];
let currentColor = "#ffff00";

const ENEMY_BODY_COLOR = "#ff5555";
const ENEMY_HEAD_COLOR = "#aa0000";

/* ===== INIT GAME ===== */
function initGame(){
  playerSnake = [];
  for(let i=0;i<COUNT;i++){
    playerSnake.push({x: mouse.x - i*DIST, y: mouse.y, a:0});
  }

  enemySnake = [];
  for(let i=0;i<COUNT;i++){
    enemySnake.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      a:0
    });
  }

  gameOver = false;
  gameOverAnim = 0;
}

initGame();

/* ===== MAIN LOOP ===== */
function animate(){
  ctx.fillStyle="rgba(0,0,0,0.1)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  time += 0.07;
  createParticle(mouse.x, mouse.y);

  if(gameOver){
    if(gameOverAnim < 1) gameOverAnim += 0.02;
    ctx.fillStyle = `rgba(255,0,0,${gameOverAnim})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", canvas.width/2, canvas.height/2);

    if(gameOverAnim >= 1){
      setTimeout(()=>{ initGame(); }, 2000);
    }

  } else {

    /* ===== PLAYER MOVE ===== */
    playerSnake[0].x += (mouse.x - playerSnake[0].x) * SPEED;
    playerSnake[0].y += (mouse.y - playerSnake[0].y) * SPEED;

    const dx = mouse.x - playerSnake[0].x;
    const dy = mouse.y - playerSnake[0].y;
    let mouthOpen = false;

    if(Math.hypot(dx,dy) < 20){
      currentColor = colors[Math.floor(Math.random()*colors.length)];
      SPEED = 0.04;
      mouthOpen = true;
    } else SPEED = 0.02;

    for(let i=1;i<playerSnake.length;i++){
      const dx = playerSnake[i-1].x - playerSnake[i].x;
      const dy = playerSnake[i-1].y - playerSnake[i].y;
      const a = Math.atan2(dy,dx);
      playerSnake[i].x = playerSnake[i-1].x - Math.cos(a)*DIST;
      playerSnake[i].y = playerSnake[i-1].y - Math.sin(a)*DIST;
      playerSnake[i].a = a;
    }

    /* ===== ENEMY CHASE ===== */
    let ex = playerSnake[0].x - enemySnake[0].x;
    let ey = playerSnake[0].y - enemySnake[0].y;
    enemySnake[0].x += ex * ENEMY_SPEED;
    enemySnake[0].y += ey * ENEMY_SPEED;

    for(let i=1;i<enemySnake.length;i++){
      const dx = enemySnake[i-1].x - enemySnake[i].x;
      const dy = enemySnake[i-1].y - enemySnake[i].y;
      const a = Math.atan2(dy,dx);
      enemySnake[i].x = enemySnake[i-1].x - Math.cos(a)*DIST;
      enemySnake[i].y = enemySnake[i-1].y - Math.sin(a)*DIST;
      enemySnake[i].a = a;
    }

    /* ===== COLLISION ===== */
    if(Math.hypot(
      playerSnake[0].x - enemySnake[0].x,
      playerSnake[0].y - enemySnake[0].y
    ) < 20){
      gameOver = true;
    }

    drawPlayer(playerSnake, mouthOpen);
    drawEnemy(enemySnake);
  }

  drawParticles();
  requestAnimationFrame(animate);
}

/* ===== DRAW PLAYER ===== */
function drawPlayer(spine, mouthOpen){
  for(const p of spine){
    const glow = Math.sin(time)*0.5+0.5;
    const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,18);
    grad.addColorStop(0,`rgba(255,255,0,${0.25*glow})`);
    grad.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x,p.y,18,0,Math.PI*2);
    ctx.fill();
  }
}

/* ===== DRAW ENEMY ===== */
function drawEnemy(spine){
  ctx.fillStyle = ENEMY_BODY_COLOR;
  for(const p of spine){
    ctx.beginPath();
    ctx.arc(p.x,p.y,18,0,Math.PI*2);
    ctx.fill();
  }
}

/* ===== PARTICLES ===== */
function drawParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    ctx.globalAlpha = p.life/50;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if(p.life <= 0) particles.splice(i,1);
  }
  if(particles.length > MAX_PARTICLES){
    particles.splice(0, particles.length - MAX_PARTICLES);
  }
}

animate();
