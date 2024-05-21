// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

const SWIMSPEED_SIDE = 0.25;
const SWIMSPEED_UP = 0.6;

class Fish extends Ship {

  constructor() {
    super(10);
    this._swimming = false;
    this._lastSwimTime = 0;
    this._swimCooldown = 1000;
  }
  
  swim() {
    this.boosting(true);
    this._lastSwimTime = millis();
  }
  
  stopSwim() {
    this.boosting(false);
  }
  
  // prevent the fish from swimming until it rests
  canSwim() {
    return (millis() - this._lastSwimTime) > this._swimCooldown;
  }
}

let fish;

function setup() {
  // createCanvas(1366, 768);
  // angleMode(DEGREES);
  rectMode(CENTER);
  createCanvas(400, 800);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  // fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  fish = new Fish();
}

function draw() {
  background("lightblue");
  
  input();

  fish.render();
  fish.turn();
  fish.update();
  
  // fish.draw();
  // console.log(fish.xvel);
}

function input() {
        
  // "d"
  if (keyIsDown(68)) {
    fish.setRotation(0.1)
    // "a"
  } else if (keyIsDown(65)) {
    fish.setRotation(-0.1)
  } else {
    fish.setRotation(0);
  }
  
  // "w"
  if (keyIsDown(87)) {
    if (fish.canSwim()) {
      fish.swim();
    } else {
      fish.stopSwim();
    }
  }
}