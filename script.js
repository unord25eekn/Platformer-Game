const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Game variables
let currentLevel = 1;
let player, platforms, goal, enemies, coins;
let keys = {};
let cameraX = 0;
let score = 0;
let floatingTexts = [];
let bestScores = [0, 0, 0];

let gameState = "levelSelect"; // playing, paused, won, dead, finalWin
let unlockedLevels = [true, false, false];
let overlayButtons = [];

// Key handling
document.addEventListener("keydown", e => {
  if(e.key === "Escape") {
    if(gameState === "playing") gameState = "paused";
    else if(gameState === "paused") gameState = "playing";
  }
  keys[e.key] = true;
});
document.addEventListener("keyup", e => keys[e.key] = false);

// Start game
function startGame(level) {
  currentLevel = level;
  score = 0;
  floatingTexts = [];
  gameState = "playing";
  initLevel(level);
}

// Initialize level
function initLevel(level) {
  player = { x: 50, y: 300, w: 40, h: 40, dx: 0, dy: 0, onGround: false };
  cameraX = 0;

  if(level===1){
    platforms = [
      {x:0,y:canvas.height-50,w:400,h:50},
      {x:500,y:canvas.height-100,w:200,h:20},
      {x:800,y:canvas.height-150,w:150,h:20},
      {x:1100,y:canvas.height-80,w:250,h:20},
      {x:1500,y:canvas.height-50,w:400,h:50}
    ];
    goal = {x:1750,y:canvas.height-90,w:40,h:40};
    enemies = [{x:520,y:canvas.height-140,w:40,h:40,alive:true,left:500,right:650,speed:1.5}];
    coins = [
      {x:530,y:canvas.height-165,w:20,h:20,collected:false},
      {x:830,y:canvas.height-190,w:20,h:20,collected:false}
    ];
  } else if(level===2){
    platforms = [
      {x:0,y:canvas.height-50,w:300,h:50},
      {x:350,y:canvas.height-150,w:150,h:20},
      {x:550,y:canvas.height-250,w:150,h:20},
      {x:750,y:canvas.height-350,w:150,h:20},
      {x:950,y:canvas.height-300,w:150,h:20},
      {x:1200,y:canvas.height-200,w:200,h:20},
      {x:1500,y:canvas.height-50,w:400,h:50}
    ];
    goal = {x:1750,y:canvas.height-90,w:40,h:40};
    enemies = [
      {x:570,y:canvas.height-290,w:40,h:40,alive:true,left:540,right:650,speed:2},
      {x:970,y:canvas.height-340,w:40,h:40,alive:true,left:940,right:1040,speed:2},
      {x:1250,y:canvas.height-240,w:40,h:40,alive:true,left:1220,right:1320,speed:1.5}
    ];
    coins = [
      {x:380,y:canvas.height-190,w:20,h:20,collected:false},
      {x:580,y:canvas.height-320,w:20,h:20,collected:false},
      {x:780,y:canvas.height-390,w:20,h:20,collected:false},
      {x:1000,y:canvas.height-370,w:20,h:20,collected:false}
    ];
  } else if(level===3){
    platforms = [
      {x:0,y:canvas.height-50,w:250,h:50},
      {x:350,y:canvas.height-200,w:150,h:20},
      {x:600,y:canvas.height-150,w:150,h:20},
      {x:850,y:canvas.height-250,w:150,h:20},
      {x:1150,y:canvas.height-180,w:150,h:20},
      {x:1400,y:canvas.height-120,w:150,h:20},
      {x:1650,y:canvas.height-80,w:200,h:20},
      {x:1900,y:canvas.height-50,w:300,h:50}
    ];
    goal = {x:2100,y:canvas.height-90,w:40,h:40};
    enemies = [
      {x:360,y:canvas.height-240,w:40,h:40,alive:true,left:330,right:450,speed:1.8},
      {x:880,y:canvas.height-290,w:40,h:40,alive:true,left:840,right:960,speed:2.2},
      {x:1420,y:canvas.height-160,w:40,h:40,alive:true,left:1380,right:1490,speed:1.6}
    ];
    coins = [
      {x:370,y:canvas.height-230,w:20,h:20,collected:false},
      {x:630,y:canvas.height-180,w:20,h:20,collected:false},
      {x:900,y:canvas.height-280,w:20,h:20,collected:false},
      {x:1420,y:canvas.height-150,w:20,h:20,collected:false},
      {x:1670,y:canvas.height-110,w:20,h:20,collected:false}
    ];
  }
}

// =========================================================
// GAME LOOP
// =========================================================

function gameLoop() {
  if(gameState === "playing") update();
  draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// =========================================================
// UPDATE FUNCTION
// =========================================================

function update(){
  player.dy += 0.8;
  player.x += player.dx;
  player.y += player.dy;

  player.dx = 0;
  if(keys["ArrowLeft"]) player.dx = -4;
  if(keys["ArrowRight"]) player.dx = 4;
  if(keys["ArrowUp"] && player.onGround){ player.dy=-15; player.onGround=false;}

  player.onGround=false;
  platforms.forEach(p=>{
    if(player.x< p.x+p.w && player.x+player.w>p.x && player.y< p.y+p.h && player.y+player.h>p.y){
      if(player.dy>0){ player.y=p.y-player.h; player.dy=0; player.onGround=true;}
    }
  });

  enemies.forEach(e=>{
    if(!e.alive) return;
    if(player.x<e.x+e.w && player.x+player.w>e.x && player.y<e.y+e.h && player.y+player.h>e.y){
      if(player.dy>0 && player.y+player.h-player.dy<=e.y){
        e.alive=false;
        player.dy=-10;
        score+=50;
        spawnFloatingText("+50",e.x,e.y);
      } else gameState="dead";
    }
    e.x+=e.speed;
    if(e.x<e.left || e.x+e.w>e.right) e.speed*=-1;
  });

  coins.forEach(c=>{
    if(!c.collected && player.x<c.x+c.w && player.x+player.w>c.x && player.y<c.y+c.h && player.y+player.h>c.y){
      c.collected=true;
      score+=10;
      spawnFloatingText("+10",c.x,c.y);
    }
  });

  floatingTexts.forEach(ft=>{ ft.y-=1; ft.alpha-=0.02; });
  floatingTexts = floatingTexts.filter(ft=>ft.alpha>0);

  cameraX = player.x - canvas.width/2;
  if(cameraX<0) cameraX=0;

  // WIN CONDITION
  if(player.x<goal.x+goal.w && player.x+player.w>goal.x && player.y<goal.y+goal.h && player.y+player.h>goal.y){
      if(currentLevel === unlockedLevels.length){ // last level
          gameState="finalWin";
          startConfetti();
          bestScores[currentLevel-1] = Math.max(score,bestScores[currentLevel-1]);
      } else {
          gameState="won";
          unlockedLevels[currentLevel] = true;
          bestScores[currentLevel-1] = Math.max(score,bestScores[currentLevel-1]);
      }
  }
}

// Floating text
function spawnFloatingText(text,x,y){ floatingTexts.push({text,x,y,alpha:1}); }

// =========================================================
// DRAW FUNCTION
// =========================================================

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(-cameraX,0);

  if(gameState==="playing"){
    ctx.fillStyle="blue"; ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.fillStyle="green"; platforms.forEach(p=>ctx.fillRect(p.x,p.y,p.w,p.h));
    drawFlag(goal);
    ctx.fillStyle="red"; enemies.forEach(e=>{if(e.alive) ctx.fillRect(e.x,e.y,e.w,e.h);});
    ctx.fillStyle="orange"; coins.forEach(c=>{if(!c.collected) ctx.fillRect(c.x,c.y,c.w,c.h);});

    floatingTexts.forEach(ft=>{
      ctx.globalAlpha=ft.alpha;
      ctx.fillStyle="black";
      ctx.font="20px Arial";
      ctx.fillText(ft.text,ft.x,ft.y);
      ctx.globalAlpha=1;
    });

    // HUD (score top-left) LEFT-ALIGNED
    ctx.fillStyle="rgba(0,0,0,0.6)";
    ctx.fillRect(10,10,150,34);
    ctx.fillStyle="white";
    ctx.font="18px Arial";
    ctx.textAlign="start";
    ctx.fillText("Score:"+score,20,35);
  }

  ctx.restore();

  // HUD outside camera
  ctx.fillStyle="rgba(0,0,0,0.6)";
  ctx.fillRect(10,10,150,34);
  ctx.fillStyle="white";
  ctx.font="18px Arial";
  ctx.textAlign="start";
  ctx.fillText("Score:"+score,20,35);

  // Overlays
  if(gameState==="paused") drawOverlay("Paused",["Resume","Restart level","Exit to level select"]);
  if(gameState==="dead") drawOverlay("You died",["Restart level","Exit to level select"]);
  if(gameState==="won") drawOverlay("Level complete",["Next level","Restart level","Exit to level select"]);
  if(gameState==="levelSelect") drawLevelSelectOverlay();
  if(gameState==="finalWin"){ updateConfetti(); drawConfetti(); drawFinalWinScreen(); }
}

// Flag
function drawFlag(g){
  const poleHeight = g.h + 60;
  const poleWidth = 8;
  ctx.fillStyle="#555"; ctx.fillRect(g.x + g.w/2 - poleWidth/2, g.y - poleHeight + g.h, poleWidth, poleHeight);
  ctx.fillStyle="red"; ctx.beginPath();
  ctx.moveTo(g.x + g.w/2, g.y - poleHeight + g.h);
  ctx.lineTo(g.x + g.w/2 + 50, g.y - poleHeight + g.h + 15);
  ctx.lineTo(g.x + g.w/2, g.y - poleHeight + g.h + 30);
  ctx.closePath(); ctx.fill();
}

// Generic overlay
function drawOverlay(title, buttonLabels, unlocked){
  const w = Math.min(500,canvas.width*0.8);
  const h = 220+buttonLabels.length*60;
  const x = (canvas.width-w)/2;
  const y = (canvas.height-h)/2;

  ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#1e1e1e"; ctx.fillRect(x,y,w,h);
  ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.strokeRect(x,y,w,h);

  ctx.fillStyle="white"; ctx.font="28px Arial";
  ctx.textAlign="start";
  ctx.fillText(title,x+20,y+50);

  overlayButtons=[];
  const btnW = w-40; const btnH=44;
  let by = y+90;

  buttonLabels.forEach((label,i)=>{
    let enabled = true;
    if(unlocked) enabled = unlocked[i];
    ctx.fillStyle = enabled ? "#2e6fe6" : "#555";
    ctx.fillRect(x+20,by,btnW,btnH);
    ctx.fillStyle="white"; ctx.font="20px Arial";
    ctx.fillText(label,x+30,by+29);
    overlayButtons.push({label,x:x+20,y:by,w:btnW,h:btnH,enabled});
    by+=btnH+16;
  });
}

// Level Select Overlay with scores
function drawLevelSelectOverlay(){
  const w = Math.min(500,canvas.width*0.8);
  const h = 300;
  const x = (canvas.width-w)/2;
  const y = (canvas.height-h)/2;

  ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#1e1e1e"; ctx.fillRect(x,y,w,h);
  ctx.strokeStyle="#fff"; ctx.strokeRect(x,y,w,h);

  ctx.fillStyle="white"; ctx.font="32px Arial";
  ctx.textAlign="start";
  ctx.fillText("Select Level", x+20, y+50);

  overlayButtons=[];
  const btnW = w-40; const btnH=44;
  let by = y+90;

  for(let i=0;i<3;i++){
    const unlocked = unlockedLevels[i];
    ctx.fillStyle = unlocked ? "#2e6fe6" : "#555";
    ctx.fillRect(x+20, by, btnW, btnH);
    ctx.fillStyle="white"; ctx.font="20px Arial";
    ctx.fillText("Level "+(i+1), x+30, by+28);

    if(bestScores[i]>0){
      ctx.font="12px Arial";
      ctx.fillText("Best Score: "+bestScores[i], x+30, by+btnH-4);
    }

    overlayButtons.push({label:"Level "+(i+1), x:x+20,y:by,w:btnW,h:btnH,enabled:unlocked});
    by+=btnH+16;
  }
}

// Final Win Screen (ONLY CENTERED)
function drawFinalWinScreen(){
  const totalScore = bestScores.reduce((sum, s) => sum + s, 0);

  const w = 600, h = 300;
  const x = (canvas.width - w)/2;
  const y = (canvas.height - h)/2;

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(x,y,w,h);
  ctx.strokeStyle="#fff";
  ctx.strokeRect(x,y,w,h);

  ctx.textAlign = "center";
  ctx.fillStyle="white";
  ctx.font="40px Arial";
  ctx.fillText("You Beat All Levels!", x+w/2, y+100);

  ctx.font="24px Arial";
  ctx.fillText("Congratulations! You won the entire game!", x+w/2, y+150);
  ctx.fillText("Final Score: " + totalScore, x+w/2, y+190);


  // Button
  ctx.fillStyle="#2e6fe6";
  ctx.fillRect(x+150, y+230, 300, 50);
  ctx.fillStyle="white";
  ctx.font="26px Arial";
  ctx.fillText("Return to Level Select", x+w/2, y+265);

  overlayButtons = [{ label: "ExitFinal", x:x+150, y:y+230, w:300, h:50, enabled:true }];

  ctx.textAlign = "start"; // RESET ALIGN BACK
}

// Handle clicks
canvas.addEventListener("click",ev=>{
  const rect=canvas.getBoundingClientRect();
  const mx = ev.clientX - rect.left;
  const my = ev.clientY - rect.top;

  for(const b of overlayButtons){
    if(mx>=b.x && mx<=b.x+b.w && my>=b.y && my<=b.y+b.h && b.enabled){
      handleOverlayAction(b.label);
      break;
    }
  }
});

// Overlay actions
function handleOverlayAction(action){
  if(gameState==="levelSelect"){
    if(action==="Level 1") startGame(1);
    if(action==="Level 2") startGame(2);
    if(action==="Level 3") startGame(3);
  }
  else if(gameState==="paused"){
    if(action==="Resume") gameState="playing";
    else if(action==="Restart level") restartLevel();
    else if(action==="Exit to level select") gameState="levelSelect";
  }
  else if(gameState==="dead"){
    if(action==="Restart level") restartLevel();
    else if(action==="Exit to level select") gameState="levelSelect";
  }
  else if(gameState==="won"){
    if(action==="Next level"){ const next=currentLevel+1; if(next<=unlockedLevels.length) startGame(next); else gameState="levelSelect"; }
    else if(action==="Restart level") restartLevel();
    else if(action==="Exit to level select") gameState="levelSelect";
  }
  else if(gameState==="finalWin"){
    if(action==="ExitFinal") gameState="levelSelect";
  }
}

// Restart level
function restartLevel(){ score=0; floatingTexts=[]; keys={}; gameState="playing"; initLevel(currentLevel); }

// =========================================================
// CONFETTI SYSTEM
// =========================================================
let confetti = [];
function startConfetti() {
  confetti = [];
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      size: Math.random()*6+4,
      color: `hsl(${Math.random()*360}, 100%, 50%)`,
      speedX: (Math.random()-0.5)*5,
      speedY: Math.random()*3+2
    });
  }
}
function updateConfetti(){
  confetti.forEach(c=>{
    c.x += c.speedX;
    c.y += c.speedY;
    if(c.y>canvas.height) c.y=-10;
  });
}
function drawConfetti(){
  confetti.forEach(c=>{
    ctx.fillStyle = c.color;
    ctx.fillRect(c.x,c.y,c.size,c.size);
  });
}
