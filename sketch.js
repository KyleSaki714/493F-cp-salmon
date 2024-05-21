// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

const SWIMSPEED_SIDE = 0.25;
const SWIMSPEED_UP = 0.6;

class Fish extends Ship {
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
  constructor() {
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

let ship;

function setup() {
  // createCanvas(1366, 768);
  // angleMode(DEGREES);
  rectMode(CENTER);
  createCanvas(400, 800);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  // fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  ship = new Ship();
}

function draw() {
  background("lightblue");
  
  input();

  ship.render();
  ship.turn();
  ship.update();
  
  // fish.draw();
  // console.log(fish.xvel);
}

function input() {
        
  // "d"
  if (keyIsDown(68)) {
    ship.setRotation(0.1)
    // "a"
  } else if (keyIsDown(65)) {
    ship.setRotation(-0.1)
  } else {
    ship.setRotation(0);
  }
  
  // "w"
  if (keyIsDown(87)) {
    ship.boosting(true);
  } else {
    ship.boosting(false);
  }
}