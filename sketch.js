// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

const SWIMSPEED_SIDE = 0.25;
const SWIMSPEED_UP = 0.6;

class Fish extends Actor {
  constructor(xpos, ypos, 
              hitboxHeight, hitboxWidth, 
              fillColor, moveSpeed) {
    super(xpos, ypos, 
          hitboxHeight, hitboxWidth, 
          fillColor, moveSpeed);
    this.swimming = false;
    this.lastSwim = 0;
    this.swimCooldown = 250;
  }
  
  swimUpLeft() {
    if (this.canSwim()) {
      fish.moveX(fish.moveSpeed * SWIMSPEED_SIDE);
      fish.moveY(fish.moveSpeed * SWIMSPEED_UP);
      this.lastSwim = millis();
    }
  }
  
  swimUpRight() {
    if (this.canSwim()) {
      fish.moveX(-fish.moveSpeed * SWIMSPEED_SIDE);
      fish.moveY(fish.moveSpeed * SWIMSPEED_UP);
      this.lastSwim = millis();
    }
  }
  
  // prevent the fish from swimming until it rests
  canSwim() {
    return (millis() - this.lastSwim) > this.swimCooldown;
  }
}

let fish;

function setup() {
  createCanvas(1366, 768);
  fish = new Fish(width / 2, height / 2, 15, 20, "#FA8072", 4);
}

function draw() {
  background("lightblue");
  
  
  if (keyIsDown(LEFT_ARROW)) {
    fish.moveLeft();
  }
  if (keyIsDown(RIGHT_ARROW)) {
    fish.moveRight();
  }
  if (keyIsDown(UP_ARROW)) {
    fish.moveUp();
  }
  if (keyIsDown(DOWN_ARROW)) {
    fish.moveDown();
  }
  
  // "a"
  if (keyIsDown(65)) {
    fish.swimUpLeft();
  }
  // "d"
  if (keyIsDown(68)) {
    fish.swimUpRight();
  }
  
  
  fish.draw();
  console.log(fish.xvel);
}