// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

let backdrop;
let fish;

function preload() {
  backdrop = loadImage("resources/testriver.png");
}

function setup() {
  createCanvas(1080, 720);
  // angleMode(DEGREES);
  rectMode(CENTER);
  // createCanvas(1600, 900);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  // fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  fish = new Fish();
}

let bgx = 0;
let bgy = 0;

function draw() {
  background("lightblue");
  
  input();
  push();
  // scale(2);
  image(backdrop, bgx, bgy);
  // console.log(color(backdrop.get(mouseX, mouseY)));
  pop();
  
  // console.log(fishCurrentColColor)
  if (fish.checkColorCollisionGrass()) {
    console.log("Bonk");
    fish.stop();
    fish.backup();
  }

  fish.render();
  fish.turn();
  fish.update();
}

function input() {
  
  if (keyIsDown(LEFT_ARROW)) {
    bgx -= 5;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    bgx += 5;
  }
  if (keyIsDown(UP_ARROW)) {
    bgy -= 5;
  }
  if (keyIsDown(DOWN_ARROW)) {
    bgy += 5;
  }

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