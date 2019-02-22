//other globals
let difficulty=""
let timeoutCheck;
let inGame=false;
let LEVEL=1;
// This sectin contains some game constants. It is not super interesting
let GAME_WIDTH = 1050
let GAME_HEIGHT = 600

let ENEMY_WIDTH = 75
let ENEMY_HEIGHT = 96
let MAX_ENEMIES = 5

let PLAYER_WIDTH = 75
let PLAYER_HEIGHT = 54

// These two constants keep us from using "magic numbers" in our code
let LEFT_ARROW_CODE = 37
let RIGHT_ARROW_CODE = 39
let UP_ARROW_CODE=38
let DOWN_ARROW_CODE=40

// These two constants allow us to DRY
let MOVE_LEFT = "left"
let MOVE_RIGHT = "right"
let MOVE_UP="up"
let MOVE_DOWN="down"

// Preload game images
let imageFilenames = ["enemy.png", "stars.png", "player.png"]
let images = {}

imageFilenames.forEach(function(imgName) {
  let img = document.createElement("img")
  img.src = "images/" + imgName
  images[imgName] = img
})

// This section is where you will be doing most of your coding
class Entity{
  render(ctx) {
    this.domElement.style.left = this.x + "px"
    this.domElement.style.top = this.y + "px"
  }
}

class Enemy extends Entity{
  constructor(root, xPos) {
    super();
    this.root = root
    this.x = xPos
    this.y = -ENEMY_HEIGHT
    let img = document.createElement("img")
    img.src = "images/enemy1.gif";
    img.width=ENEMY_WIDTH;
    img.style.position = "absolute"
    img.style.left = this.x + "px"
    img.style.top = this.y + "px"
    img.style.zIndex = 5
    root.appendChild(img)

    this.domElement = img
    // Each enemy should have a different speed
    this.speed = Math.random() / 2 + 0.25

    if(difficulty=="medium"){
      // if(this.score>=40000){
        
      // }else if(this.score>=40000){

      // }else if(this.score>=40000){

      // }else{
        this.speed = Math.random() / 3 + 0.20
      // }

    }else if(difficulty=="easy"){
      // if(gameEngine.score>=100000){
      //   this.speed = Math.random() / 3 + 0.3
      // }else if(gameEngine.score>=60000){
      //   this.speed = Math.random() / 3 + 0.25
      // }else if(gameEngine.score>=40000){
      //   this.speed = Math.random() / 3 + 0.15
      // }else{
        this.speed = Math.random() / 3 + 0.05
      // }
      
    }else if(difficulty=="hard"){
      // if(gameEngine.score>=40000){
      //   this.speed = Math.random() / 2 + 0.45
      // }else if(gameEngine.score>=40000){
      //   this.speed = Math.random() / 2 + 0.4
      // }else if(gameEngine.score>=40000){
      //   this.speed = Math.random() / 2 + 0.35
      // }else{
        this.speed = Math.random() / 2 + 0.3
      // }
    }
    
  }

  update(timeDiff) {
    this.y = this.y + timeDiff * this.speed
  }


  destroy() {
    // When an enemy reaches the end of the screen, the corresponding DOM element should be destroyed
    this.root.removeChild(this.domElement)
  }
}

//laser
class Laser{
  constructor(root,xPos,yPos){
    this.root=root
    this.x=xPos
    this.y=yPos
    
    this.update=this.update.bind(this);
    this.destroy=this.destroy.bind(this);

    let laserDOM=document.createElement("img");
    laserDOM.style.maxWidth="75px";
    laserDOM.style.maxHeight="70px";
    laserDOM.src="images/laser.png";
    laserDOM.style.position="absolute";
    laserDOM.style.left=this.x+"px";
    laserDOM.style.top=this.y+"px";
    laserDOM.style.zIndex="1000"
    laserDOM.classList.add("lasers");
    this.domElement=laserDOM;
    
    this.root.appendChild(this.domElement)

    this.speed=.4
    
  }
  update(timeDiff) {
    let positionYarray=this.domElement.style.top.split("");
    positionYarray.pop();
    positionYarray.pop();
    let positionYnum=Number(positionYarray.join(""));
    this.domElement.style.top = positionYnum - timeDiff * this.speed+"px"
  }
  destroy() {
    this.root.removeChild(this.domElement)
  }
}


//type should be a string of "red","star", or "green"
class Bonus extends Entity{
  constructor(root,xPos,type){
    super();
    this.root=root;
    this.x=xPos
    this.y=-ENEMY_HEIGHT;
    this.type=type;
    let img=document.createElement("img");
    if(type=="red"){
      img.src="images/redGem.png";
    }else if(type=="green"){
      img.src="images/greenGem.png";
    }else if(type=="star"){
      img.src="images/purpleStar.gif";
    }

    img.width=ENEMY_WIDTH;
    img.style.position="absolute";
    img.style.left=this.x+"px";
    img.style.top=this.y+"px";
    img.style.zIndex=5;

    root.appendChild(img);
    this.domElement=img;

    this.speed = .2
  }
  update(timeDiff) {
    this.y = this.y + timeDiff * this.speed
  }
  destroy() {
    // When an enemy reaches the end of the screen, the corresponding DOM element should be destroyed
    this.root.removeChild(this.domElement)
  }
}

class Player extends Entity{
  constructor(root) {
    super();
    this.root = root
    this.x = 2 * PLAYER_WIDTH
    this.y = GAME_HEIGHT - PLAYER_HEIGHT - 100
    this.level=1;

    //poweredUp phase
    this.poweredUp=false;
    this.activatePoweredUp=this.activatePoweredUp.bind(this);
    this.deactivatePoweredUp=this.deactivatePoweredUp.bind(this);

    //player health
    this.health=3;
    this.maxHealth=3;
    
    let heartRoot=document.createElement("div");
    heartRoot.innerText="Health"
    heartRoot.style.textShadow="0px 5px 50px yellow, 0px -1px 0px white "
    heartRoot.style.fontSize="40px"
    heartRoot.style.color="teal"
    heartRoot.style.position="absolute"
    heartRoot.style.zIndex="10";
    heartRoot.style.left=GAME_WIDTH+20+"px"
    heartRoot.style.maxWidth="380px"
    this.heartRoot=heartRoot;
    root.appendChild(heartRoot)

    let heartDOMElementsArray=[]
    this.heartDOMElementsArray=heartDOMElementsArray;
    
    for(let i=1;i<=this.maxHealth;i++){
      let heart=document.createElement("img");
      heart.classList="hearts";
      heart.src="images/heart.gif";
      heart.style.width="80px"
      this.heartDOMElementsArray.push(heart);
      this.heartRoot.appendChild(this.heartDOMElementsArray[this.heartDOMElementsArray.length-1]);
    }

    this.giveHearts=this.giveHearts.bind(this);
    this.takeHearts=this.takeHearts.bind(this);

    //player mana
    this.mana=15;
    this.maxMana=15;
    
    let manaRoot=document.createElement("span")
    manaRoot.innerText="Mana"
    manaRoot.style.textShadow="0px 5px 50px yellow, 0px -1px 0px white "
    manaRoot.style.color="teal"
    manaRoot.style.fontSize="40px"
    manaRoot.style.position="absolute";
    manaRoot.style.zIndex="10";
    manaRoot.style.left=GAME_WIDTH+20+"px"
    manaRoot.style.top="120px"
    manaRoot.style.maxWidth="380px"
    this.manaRoot=manaRoot;
    root.appendChild(manaRoot)

    let manaDOMElementsArray=[];
    this.manaDOMElementsArray=manaDOMElementsArray;

    for(let i=1;i<=this.maxMana;i++){
      let manaUnit=document.createElement("img");
      manaUnit.classList="manaUnit";
      manaUnit.src="images/greenManaUnit.gif"
      manaUnit.style.width="60px"
      this.manaDOMElementsArray.push(manaUnit);
      this.manaRoot.appendChild(this.manaDOMElementsArray[this.manaDOMElementsArray.length-1]);
    }

    //player image
    let img = document.createElement("img")
    img.src = "images/normal1.gif"
    img.style.position = "absolute"
    img.style.left = this.x + "px"
    img.style.top = this.y + "px"
    img.style.zIndex = "10"
    img.style.maxHeight="88px";
    img.width=PLAYER_WIDTH;

    root.appendChild(img)

    this.domElement = img

    
  }

  //heart mechanics TODO
  giveHearts(amount){
    while(amount>0 && this.health<this.maxHealth){
      this.heartDOMElementsArray[this.health].src="images/heart.gif"
      this.health++
      amount--;
    }
  }

  takeHearts(amount){
    while(amount>0){
      this.heartDOMElementsArray[this.health-1].src="images/deadHeart.png";
      this.health--;
      amount--;
    }
  }
  giveMana(amount){
    while(amount>0 && this.mana<this.maxMana){
      this.manaDOMElementsArray[this.mana].src="images/greenManaUnit.gif";
      this.mana++
      amount--;
    }
  }
  takeMana(amount){
    while(amount>0){
      this.manaDOMElementsArray[this.mana-1].src="";
      this.mana--;
      amount--;
    }
  }
  activatePoweredUp(){
      this.domElement.src="images/poweredUp.gif"
      this.poweredUp=true;
      timeoutCheck=setTimeout(this.deactivatePoweredUp,8000)
  }
  deactivatePoweredUp(){
    this.poweredUp=false;
    let randNum=Math.random();
    if(randNum<.5){
      this.domElement.src="images/normal1.gif"
    }else{
      this.domElement.src="images/normal2.gif"
    }
  }

  // This method is called by the game engine when left/right arrows are pressed
  move(direction) {
    if (direction === MOVE_LEFT && this.x > 0) {
      this.x = this.x - PLAYER_WIDTH
    } else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
      this.x = this.x + PLAYER_WIDTH
    } else if (direction===MOVE_UP && this.y>0) {
      this.y= this.y-PLAYER_HEIGHT;
    }else if (direction===MOVE_DOWN && this.y<GAME_HEIGHT-PLAYER_HEIGHT-100){
      this.y=this.y+PLAYER_HEIGHT;
    }
  }

  render(ctx) {
    this.domElement.style.left = this.x + "px"
    this.domElement.style.top = this.y + "px"
  }
}

class Text {
  constructor(root, xPos, yPos) {
    this.root = root

    let span = document.createElement("div")
    span.style.position = "absolute"
    span.style.left = xPos
    span.style.top = yPos
    // span.style.font = "bold 30px Impact"
    span.style.fontSize="40px"
    span.style.zIndex="10"
    span.style.color="teal";
    span.style.textShadow="0px 5px 50px yellow, 0px -1px 0px white "

    root.appendChild(span)
    this.domElement = span
  }

  // This method is called by the game engine when left/right arrows are pressed
  update(txt) {
    this.domElement.innerText = txt
  }
}

class Button{
  constructor(root,name,xPos,yPos){
    this.root=root;
    this.innerText=name
    let btn=document.createElement("button");
    btn.style.position="absolute";
    btn.style.left=xPos;
    btn.style.top=yPos;
    btn.style.height="10vh"
    btn.style.width="8vw"
    btn.style.fontSize="4vh"
    btn.style.textShadow="0px 5px 50px yellow, 0px -1px 0px white "
    btn.style.color="#48bede";
    btn.style.borderColor="#bf312b";
    btn.style.borderTopColor="white";
    btn.style.borderStyle="outset"
    btn.style.borderWidth="thick"
    btn.style.fontFamily="fantasy"
    btn.style.background="#bf312b";
    btn.style.filter="drop-shadow(5px 5px 1px #d1aa5d)"
    btn.innerText=name;
    root.appendChild(btn);
    this.domElement=btn;
  }
}

class SoundMusic{
  constructor(root,source){
    this.root=root;
    let sound=document.createElement("audio");
    this.sound=sound;
    sound.src=source+""
    root.appendChild(sound)
    
  }
  playMusic(){
    this.sound.play();
    this.sound.loop=true;
  }
  stopMusic(){
    this.sound.loop=false;
    this.sound.pause();
  }
}

class SoundEffects{
  constructor(){
    this.pressButton=document.createElement("audio");
    this.pressButton.src="sounds/pressButtonSword.mp3";

    this.explosion=document.createElement("audio");
    this.explosion.src="sounds/explosion.wav";
    this.explosion.volume=.1;
    
    this.shade=document.createElement("audio");
    this.shade.src="sounds/poweredUpShade.mp3"

    this.laser=document.createElement("audio");
    this.laser.src="sounds/laser.wav"
    this.laser.volume=.1

    this.giveDamage=document.createElement("audio");
    this.giveDamage.src="sounds/damageGiven.mp3";

    this.takeDamage=document.createElement("audio");
    this.takeDamage.src="sounds/damageTaken.mp3"

    this.collectRedGem=document.createElement("audio");
    this.collectRedGem.src="sounds/redGem.mp3"

    this.collectGreenGem=document.createElement("audio");
    this.collectGreenGem.src="sounds/greenGem.mp3"

    this.collectStar=document.createElement("audio");
    this.collectStar.src="sounds/star.mp3"

    this.gameOver=document.createElement("audio");
    this.gameOver.src="sounds/gameOverFinal.mp3"


    this.stopAll=this.stopAll.bind(this);
  }
  playSound(sound){
    this.sound.load();
  }
  pauseSound(sound){
    this.sound.pause();
  }
  stopAll(){
    let soundDomsArray=Object.values(this);
    soundDomsArray.forEach(function(elem){elem.pause()})
  }
}

/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
*/

class MainMenu{
  constructor(){
    this.root=document.querySelector("body");
    let background=document.createElement("img")
    background.style.position="absolute";
    background.src="images/mainMenuPhoto1.jpg";
    background.style.width="50vw";
    background.style.filter;
    this.root.appendChild(background);
    this.background=background;
    this.easyBtn=new Button(this.root,"Easy","10vw","30vh")
    this.mediumBtn=new Button(this.root,"Medium","20vw","30vh")
    this.hardBtn=new Button(this.root,"Hard","30vw","30vh")
    
    this.startGame=this.startGame.bind(this);
    this.mediumBtn.domElement.addEventListener("click",this.startGame);
    this.easyBtn.domElement.addEventListener("click",this.startGame);
    this.hardBtn.domElement.addEventListener("click",this.startGame);
    }
    
  
  startGame(e){
    inGame=true;
    this.root.removeChild(this.background);
    this.root.removeChild(this.easyBtn.domElement);
    this.root.removeChild(this.mediumBtn.domElement);
    this.root.removeChild(this.hardBtn.domElement);
    
    if(e.currentTarget==this.mediumBtn.domElement){
      MAX_ENEMIES=7;
      difficulty="medium";
      let gameEngine = new Engine(document.getElementById("app"),"medium")
      gameEngine.SoundEffects.pressButton.play();
      gameEngine.start()
    }else if(e.currentTarget==this.easyBtn.domElement){
      MAX_ENEMIES=6;
      difficulty="easy";
      let gameEngine = new Engine(document.getElementById("app"),"easy")
      gameEngine.SoundEffects.pressButton.play();
      gameEngine.start()
    }else if(e.currentTarget==this.hardBtn.domElement){
      MAX_ENEMIES=8
      difficulty="hard";
      let gameEngine = new Engine(document.getElementById("app"),"hard")
      gameEngine.SoundEffects.pressButton.play();
      gameEngine.start()
    }
  }
}



class Engine {
  constructor(element,difficulty) {
    this.root = element
    
    //setup lasers array
    this.lasers=[];

    //soundEffects object added which contains an array and methods of for each sound
    this.SoundEffects=new SoundEffects();

    //hud instructions
    let instructions=document.createElement("div");
    instructions.innerText="Press Space to shoot lasers which cost mana\n\nRed Gems recharge health\n\nGreen Gems recharge mana\n\nPurple stars make you invincible and kill enemies\nyou touch for 8 seconds\n\nKill enemies in a row to generate combo points \nand multiply your score"
    instructions.style.position="absolute";
    instructions.style.top="380px"
    instructions.style.left=GAME_WIDTH+10+"px"
    instructions.style.fontSize="15px"
    instructions.style.zIndex="10"
    instructions.style.color="teal";
    instructions.style.textShadow="0px 5px 50px yellow, 0px -1px 0px white "
    this.root.appendChild(instructions)
    //make combo mechanic 
    this.combo=0;
    //set up difficulty
    this.difficulty=difficulty

    // Setup the player
    this.player = new Player(this.root)
    this.info = new Text(this.root, 5, 30)

    //Start background music
    this.music=new SoundMusic(this.root,"sounds/mainTheme.mp3");
    this.music.playMusic();
    this.music.volume=.9
    // Setup enemies, making sure there are always three
    this.setupEnemies()

    // Put a white div at the bottom so that enemies seem like they dissappear
    let whiteBox = document.createElement("div")
    whiteBox.style.zIndex = 100
    whiteBox.style.position = "absolute"
    whiteBox.style.top = GAME_HEIGHT + "px"
    whiteBox.style.height = ENEMY_HEIGHT-20 + "px"
    whiteBox.style.width = GAME_WIDTH + "px"
    whiteBox.style.background = "#fff"
    this.root.append(whiteBox)

    let bg = document.createElement("img")
    bg.src = "images/rainbowBG.gif"
    bg.style.position = "absolute"
    bg.style.height = GAME_HEIGHT + "px"
    bg.style.width = GAME_WIDTH + "px"
    this.root.append(bg)

    let hudBg=document.createElement("img")
    hudBg.src="images/hudBg.jpg"
    hudBg.style.position="absolute";
    hudBg.style.height=GAME_HEIGHT+"px";
    hudBg.style.left=GAME_WIDTH+"px";
    hudBg.style.width="380px"
    this.root.append(hudBg);

    // Since gameLoop will be called out of context, bind it once here.
    this.gameLoop = this.gameLoop.bind(this)
  }

  

  /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
  setupEnemies() {
    if (!this.enemies) {
      this.enemies = []
    }

    while (
      this.enemies.filter(function() {
        return true
      }).length < MAX_ENEMIES
    ) {
      this.addEnemy()
    }
  }

  // This method finds a random spot where there is no enemy, and puts one in there
  addEnemy() {
    let enemySpots = GAME_WIDTH / ENEMY_WIDTH

    let enemySpot = undefined
    // Keep looping until we find a free enemy spot at random
    while ((enemySpot!==0 && !enemySpot) || this.enemies[enemySpot]) {
      enemySpot = Math.floor(Math.random() * enemySpots)
    }

    let bonusChance=Math.random();

    if(bonusChance<=.85){
      this.enemies[enemySpot] = new Enemy(this.root, enemySpot * ENEMY_WIDTH)
    }else{
      let bonusTypeChance=Math.random();
      if(bonusTypeChance<=.35){
        this.enemies[enemySpot] = new Bonus(this.root, enemySpot * ENEMY_WIDTH,"red")
      }else if(bonusTypeChance<=.85){
        this.enemies[enemySpot] = new Bonus(this.root, enemySpot * ENEMY_WIDTH,"green")
      }else{
        this.enemies[enemySpot] = new Bonus(this.root, enemySpot * ENEMY_WIDTH,"star")
      }
    }

    
  }

  // This method kicks off the game
  start() {
    this.score = 0
    this.lastFrame = Date.now()
    let keydownHandler = function(e) {
      if (e.keyCode === LEFT_ARROW_CODE) {
        this.player.move(MOVE_LEFT)
      } else if (e.keyCode === RIGHT_ARROW_CODE) {
        this.player.move(MOVE_RIGHT)
      }else if(e.keyCode===UP_ARROW_CODE){
        this.player.move(MOVE_UP);
      }else if(e.keyCode===DOWN_ARROW_CODE){
        this.player.move(MOVE_DOWN);
      }else if(e.keyCode==32 && inGame && this.player.mana>0){
        this.SoundEffects.laser.load();
        this.SoundEffects.laser.play();
        this.lasers.push(new Laser(this.root,this.player.x,this.player.y-30))
        this.player.takeMana(1);
      }
    }
    keydownHandler = keydownHandler.bind(this)
    // Listen for keyboard left/right and update the player
    document.addEventListener("keydown", keydownHandler)

    this.gameLoop()
  }

  /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
  gameLoop() {
  
    // Check how long it's been since last frame
    let currentFrame = Date.now()
    let timeDiff = currentFrame - this.lastFrame

    // Increase the score!
    this.score += timeDiff

    //adjust difficulty based on score
    if(this.score>=10000000 && LEVEL==1){
      MAX_ENEMIES++
      LEVEL++;
    }else if(this.score>=20000000 && LEVEL==2){
      MAX_ENEMIES++;
      LEVEL++;
    }else if(this.score>=30000000 && LEVEL==3){
      MAX_ENEMIES;
      LEVEL=="FINAL LEVEL";
    }

    //adjust stats based on combo
    if(this.combo>=100 && this.player.level==1){
      this.player.maxHealth++;
      this.player.maxMana+=2;
      this.player.level++;

      let heart=document.createElement("img");
      heart.classList="hearts";
      heart.src="images/heart.gif";
      heart.style.width="80px"
      this.player.heartDOMElementsArray.push(heart);
      this.player.heartRoot.appendChild(heart);

      for(let i=1;i<=3;i++){
        let manaUnit=document.createElement("img");
        manaUnit.classList="manaUnit";
        manaUnit.src="images/greenManaUnit.gif"
        manaUnit.style.width="60px"
        this.player.manaDOMElementsArray.push(manaUnit);
        this.player.manaRoot.appendChild(manaUnit);
      }
    }else if(this.combo>=250 && this.player.level==2){
      this.player.maxHealth++;
      this.player.maxMana+=3;
      this.player.level++;

      let heart=document.createElement("img");
      heart.classList="hearts";
      heart.src="images/heart.gif";
      heart.style.width="80px"
      this.player.heartDOMElementsArray.push(heart);
      this.player.heartRoot.appendChild(heart);

      for(let i=1;i<=3;i++){
        let manaUnit=document.createElement("img");
        manaUnit.classList="manaUnit";
        manaUnit.src="images/greenManaUnit.gif"
        manaUnit.style.width="60px"
        this.player.manaDOMElementsArray.push(manaUnit);
        this.player.manaRoot.appendChild(manaUnit);
      }
      
    }

    // Call update on all enemies
    this.enemies.forEach(function(enemy) {
      enemy.update(timeDiff)
    })

    //lasers movement
    this.lasers.forEach(function(laser){
      laser.update(timeDiff);
    })

    //laser destroy if it reaches end.

    for(let i=0;i<this.lasers.length;i++){
      let positionYarray=this.lasers[i].domElement.style.top.split("");
      positionYarray.pop();
      positionYarray.pop();
      let positionYnum=Number(positionYarray.join(""));
      if(positionYnum<=0){
            try{
              this.lasers[i].destroy();
              this.lasers.splice(i,1);
              i--;
            }catch{};
          }
    }

    //laser destroy if it hits enemy.
    

    // Draw everything!
    //this.ctx.drawImage(images["stars.png"], 0, 0); // draw the star bg
    let renderEnemy = function(enemy) {
      enemy.render(this.ctx)
    }
    
    renderEnemy = renderEnemy.bind(this)
    this.enemies.forEach(renderEnemy) // draw the enemies
    this.player.render(this.ctx) // draw the player

    // Check if any enemies should die
    this.enemies.forEach((enemy, enemyIdx) => {
      if (enemy.y > GAME_HEIGHT) {
        try{
          this.enemies[enemyIdx].destroy()
          // delete this.enemies[enemyIdx]
        }catch{}
        // this.enemies[enemyIdx].destroy()
        delete this.enemies[enemyIdx]
      }
    })
    this.setupEnemies()

    // Check if player is dead
    if (this.isPlayerDead()) {
      // If they are dead, then it's game over!
      this.info.update(this.score + " GAME OVER. Thanks for playing!\nRefresh the page to start again.")
      this.music.stopMusic();
      inGame=false;
      this.SoundEffects.gameOver.play();
      // this.resetButton=new Button(this.root,"Reset","300px","400px")
      // this.resetButton.addEventListener("click")
      // this.root.appendChild(this.resetButton)
      
    } else {
      // If player is not dead, then draw the score
      if(this.player.poweredUp==false){this.info.update(this.score+" Level: "+LEVEL+"\nCombo: "+Math.floor(this.combo))
      }else{this.info.update(this.score+" Level: "+LEVEL+" You are powered up! \nUse the powers of gems and dance to destroy your enemies.\nCombo: "+Math.floor(this.combo))}

      // Set the time marker and redraw
      this.lastFrame = Date.now()
      setTimeout(this.gameLoop, 20)
    }
  }

  checkLaserCollision() {
    let that=this
    for(let i=0;i<that.lasers.length;i++){
      for(let j=0;j<that.enemies.length;j++){
        if(that.enemies[j]==undefined || that.lasers[i]==undefined){
          continue;
        }
      let positionYarray=that.lasers[i].domElement.style.top.split("");
      positionYarray.pop();
      positionYarray.pop();
      let positionYNum1=Number(positionYarray.join(""));
      let positionYNum2=positionYNum1+70;

      let positionXarray=that.lasers[i].domElement.style.left.split("");
      positionXarray.pop();
      positionXarray.pop();
      let positionXNum1=Number(positionXarray.join(""));
      let positionXNum2=positionXNum1+40;
      
      let enemyY1=that.enemies[j].y;
      let enemyY2=enemyY1+ENEMY_HEIGHT;
      let enemyX1=that.enemies[j].x;
      let enemyX2=enemyX1+ENEMY_WIDTH;
      
      if((enemyY2>positionYNum1 && enemyY1<positionYNum2) && (enemyX2>positionXNum1 && enemyX1<positionXNum2)){
        
        //console.log("laser hit enemy")
        try{
          that.lasers[i].destroy();
          that.lasers.splice(i,1);
          i--;
          that.enemies[j].destroy();
          this.score+=1000*this.combo;
          this.combo++;
          this.SoundEffects.giveDamage.play();
          
        }catch{}
      }

      }
    }
  }
  
  

  
  isPlayerDead() {

    this.checkLaserCollision();
    
    let isNotCollidingX = (enem) => {
      let enemyX1=enem.x;
      let enemyX2=enem.x+ENEMY_WIDTH;
      let playerX1=this.player.x;
      let playerX2=this.player.x+PLAYER_WIDTH;
      if(enemyX2==playerX2 && enemyX1==playerX1){
        return false;
      }else{
        return true
      }
    }
    let isNotCollidingY = (enem) => {
      let enemyY1=enem.y;
      let enemyY2=enem.y+ENEMY_HEIGHT;
      let playerY1=this.player.y;
      let playerY2=this.player.y+PLAYER_HEIGHT;
      if(enemyY2>playerY1 && enemyY1<playerY2){
        return false;
      }else{
        return true
      }
    }
    //objects that dont collide return true
    let isColliding = (enem) => {
      return !(isNotCollidingX(enem) || isNotCollidingY(enem));
    }
    
    let collidingArr=this.enemies.filter(isColliding)
    

    if(collidingArr.length!=0){
    
      if(Enemy.prototype.isPrototypeOf(collidingArr[0])){
        if(collidingArr[0].domElement.src.includes("explosion")){
          return false;
        }
        try{
          collidingArr[0].destroy();
          if(this.player.poweredUp){
            this.SoundEffects.giveDamage.play();
            this.score+=this.combo*1000
            this.combo++;
          }else{
            this.SoundEffects.takeDamage.play();
            this.player.takeHearts(1);
            this.combo=0;
          }
          
        }catch{}
        if(this.player.health==0){

          return true
        }
      }else if(collidingArr[0].type=="red"){
        try{
          collidingArr[0].destroy();
          this.player.giveHearts(1);
          if(player.health==player.maxHealth){
            this.score+=20000
          }
          this.SoundEffects.collectRedGem.play();
        }catch{}
        // console.log("red gem hit");
      }else if(collidingArr[0].type=="green"){
        try{
          collidingArr[0].destroy();
          this.player.giveMana(5);
          this.SoundEffects.collectGreenGem.play();
        }catch{}
        // console.log("green gem hit");
      }else if(collidingArr[0].type=="star"){
        try{
          collidingArr[0].destroy();
          clearTimeout(timeoutCheck);
          this.combo+=20;
          this.score+=40000
          this.player.giveHearts(this.player.maxHealth);
          this.player.giveMana(this.player.maxMana);
          this.player.activatePoweredUp();
          let filteredEnemies=this.enemies.filter(function(){
          return true;
        })
        this.SoundEffects.collectStar.play();
        this.SoundEffects.explosion.play();
        this.SoundEffects.shade.play();
        for(let i=0;i<filteredEnemies.length;i++){
          
          filteredEnemies[i].domElement.src="images/explosion.gif"
        }
        }catch{}
        
        // console.log("star gem hit")
      }
    }
    return false;
    
  }
}

// This section will start the game
// let gameEngine = new Engine(document.getElementById("app"))
// gameEngine.start()
let mainMenu=new MainMenu();
