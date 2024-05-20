// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

const SWIMSPEED_SIDE = 0.25;
const SWIMSPEED_UP = 0.6;

class Fish extends Actor {
  /**
   * 
   * @param {Number} xpos 
   * @param {Number} ypos 
   * @param {Number} hitboxHeight 
   * @param {Number} hitboxWidth 
   * @param {String} fillColor 
   * @param {Number} moveSpeed 
   * @param {Number} rotateSpeed 
   */
  constructor(xpos, ypos, 
              hitboxHeight, hitboxWidth, 
              fillColor, moveSpeed, rotateSpeed) {
    super(xpos, ypos, 
          hitboxHeight, hitboxWidth, 
          fillColor, moveSpeed, rotateSpeed);
    this._swimming = false;
    this._lastSwimTime = 0;
    this._swimCooldown = 250;
    this._lastSwimDirectionWasLeft = false;
  }
  
  swim() {
    if (this._lastSwimDirectionWasLeft) {
      this.swimUpRight();
    } else {
      this.swimUpLeft();
    }
    console.log(this._lastSwimDirectionWasLeft);
    this._lastSwimDirectionWasLeft = !this._lastSwimDirectionWasLeft;
  }
  
  swimUpLeft() {
    fish.addForceX(-fish.moveSpeed * SWIMSPEED_SIDE);
    fish.addForceY(-fish.moveSpeed * SWIMSPEED_UP);
    this._lastSwimTime = millis();
  }
  
  swimUpRight() {
    fish.addForceX(fish.moveSpeed * SWIMSPEED_SIDE);
    fish.addForceY(-fish.moveSpeed * SWIMSPEED_UP);
    this._lastSwimTime = millis();
  }
  
  // prevent the fish from swimming until it rests
  canSwim() {
    // return true;
    return (millis() - this._lastSwimTime) > this._swimCooldown;
  }
}

let fish;

function setup() {
  // createCanvas(1366, 768);
  angleMode(DEGREES);
  rectMode(CENTER);
  createCanvas(400, 800);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
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
    fish.rotateCcw();
  }
  // "d"
  if (keyIsDown(68)) {
    fish.rotateCw()
  }
  // "w"
  if (keyIsDown(87) && fish.canSwim()) {
    fish.swim();
  }
  
  
  fish.draw();
  // console.log(fish.xvel);
}