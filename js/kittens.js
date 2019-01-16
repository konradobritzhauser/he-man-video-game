// This sectin contains some game constants. It is not super interesting
let GAME_WIDTH = 375
let GAME_HEIGHT = 500

let ENEMY_WIDTH = 75
let ENEMY_HEIGHT = 156
let MAX_ENEMIES = 3

let PLAYER_WIDTH = 75
let PLAYER_HEIGHT = 54

// These two constants keep us from using "magic numbers" in our code
let LEFT_ARROW_CODE = 37
let RIGHT_ARROW_CODE = 39

// These two constants allow us to DRY
let MOVE_LEFT = "left"
let MOVE_RIGHT = "right"

// Preload game images
let imageFilenames = ["enemy.png", "stars.png", "player.png"]
let images = {}

imageFilenames.forEach(function(imgName) {
  let img = document.createElement("img")
  img.src = "images/" + imgName
  images[imgName] = img
})

// This section is where you will be doing most of your coding
class Enemy {
  constructor(root, xPos) {
    this.root = root
    this.x = xPos
    this.y = -ENEMY_HEIGHT
    let img = document.createElement("img")
    img.src = "images/enemy.png"
    img.style.position = "absolute"
    img.style.left = this.x + "px"
    img.style.top = this.y + "px"
    img.style.zIndex = 5
    root.appendChild(img)

    this.domElement = img
    // Each enemy should have a different speed
    this.speed = Math.random() / 2 + 0.25
  }

  update(timeDiff) {
    this.y = this.y + timeDiff * this.speed
  }

  render(ctx) {
    this.domElement.style.left = this.x + "px"
    this.domElement.style.top = this.y + "px"
  }

  destroy() {
    // When an enemy reaches the end of the screen, the corresponding DOM element should be destroyed
    this.root.removeChild(this.domElement)
  }
}

class Player {
  constructor(root) {
    this.root = root
    this.x = 2 * PLAYER_WIDTH
    this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10

    let img = document.createElement("img")
    img.src = "images/player.png"
    img.style.position = "absolute"
    img.style.left = this.x + "px"
    img.style.top = this.y + "px"
    img.style.zIndex = "10"

    root.appendChild(img)

    this.domElement = img
  }

  // This method is called by the game engine when left/right arrows are pressed
  move(direction) {
    if (direction === MOVE_LEFT && this.x > 0) {
      this.x = this.x - PLAYER_WIDTH
    } else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
      this.x = this.x + PLAYER_WIDTH
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

    let span = document.createElement("span")
    span.style.position = "absolute"
    span.style.left = xPos
    span.style.top = yPos
    span.style.font = "bold 30px Impact"

    root.appendChild(span)
    this.domElement = span
  }

  // This method is called by the game engine when left/right arrows are pressed
  update(txt) {
    this.domElement.innerText = txt
  }
}

/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
*/
class Engine {
  constructor(element) {
    this.root = element
    // Setup the player
    this.player = new Player(this.root)
    this.info = new Text(this.root, 5, 30)

    // Setup enemies, making sure there are always three
    this.setupEnemies()

    // Put a white div at the bottom so that enemies seem like they dissappear
    let whiteBox = document.createElement("div")
    whiteBox.style.zIndex = 100
    whiteBox.style.position = "absolute"
    whiteBox.style.top = GAME_HEIGHT + "px"
    whiteBox.style.height = ENEMY_HEIGHT + "px"
    whiteBox.style.width = GAME_WIDTH + "px"
    whiteBox.style.background = "#fff"
    this.root.append(whiteBox)

    let bg = document.createElement("img")
    bg.src = "images/stars.png"
    bg.style.position = "absolute"
    bg.style.height = GAME_HEIGHT + "px"
    bg.style.width = GAME_WIDTH + "px"
    this.root.append(bg)

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
    while (!enemySpot || this.enemies[enemySpot]) {
      enemySpot = Math.floor(Math.random() * enemySpots)
    }

    this.enemies[enemySpot] = new Enemy(this.root, enemySpot * ENEMY_WIDTH)
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

    // Call update on all enemies
    this.enemies.forEach(function(enemy) {
      enemy.update(timeDiff)
    })

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
        this.enemies[enemyIdx].destroy()
        delete this.enemies[enemyIdx]
      }
    })
    this.setupEnemies()

    // Check if player is dead
    if (this.isPlayerDead()) {
      // If they are dead, then it's game over!
      this.info.update(this.score + " GAME OVER")
    } else {
      // If player is not dead, then draw the score
      this.info.update(this.score)

      // Set the time marker and redraw
      this.lastFrame = Date.now()
      setTimeout(this.gameLoop, 20)
    }
  }

  isPlayerDead() {
    // TODO: fix this function!
    return false
  }
}

// This section will start the game
let gameEngine = new Engine(document.getElementById("app"))
gameEngine.start()
