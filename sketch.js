// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

// beholder.js
let marker0;
let marker1;
let _lastPosHammer; // marker 0
let _lastPosBrush; // marker 1

let backdropIm;
let _backdrop;
let fish;

function preload() {
  backdropIm = loadImage("resources/testriver_3012_480_scrolling.png");
}

function setup() {
  p5beholder.prepare();
  createCanvas(640, 480); // small canvas so it doesnt lag
  rectMode(CENTER);
  // createCanvas(1600, 900);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  // fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  fish = new Fish(10, color("salmon"), createVector(27, 92));
  _backdrop = new Backdrop(backdropIm);
  _lastPosBrush = createVector(-100, -100);
  _lastPosHammer = createVector(-100, -100);
}



function draw() {
  // beholder updates before all code in draw()
  marker0 = p5beholder.getMarker(0);
  marker1 = p5beholder.getMarker(1);

  clear();
  background("lightblue");
  
  input();

  const scrollval = -0.5;
  
  _backdrop.scrollX(scrollval);  
  // draw background before fish, for collision colors
  _backdrop.render();

  fish.scrollX(scrollval);

  // update marker positions
  if (marker0.present) {
    let pos = p5beholder.cameraToCanvasVector(marker0.center);
    _lastPosHammer = pos;
  }
  if (marker1.present) {
    let pos = p5beholder.cameraToCanvasVector(marker1.center);
    _lastPosBrush = pos;
  }

  // draw sttuff with the marker positions
  push()
  fill("brown")
  rect(_lastPosHammer.x, _lastPosHammer.y, 10, 10);
  pop()

  push()
  fill("white")
  rect(_lastPosBrush.x, _lastPosBrush.y, 20, 20);
  pop()


  // console.log(fishCurrentColColor)
  if (fish.checkColorCollisionGrass()) {
    // console.log("Bonk");
    fish.stop();
    fish.backup();
  }
  
  fish.checkOOB();
  fish.render();
  fish.turn();
  fish.update();
}

function input() {
  
  if (keyIsDown(LEFT_ARROW)) {
    _backdrop.scrollX(-5);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    _backdrop.scrollX(5);
  }
  if (keyIsDown(UP_ARROW)) {
    _backdrop.scrollY(-5);
  }
  if (keyIsDown(DOWN_ARROW)) {
    _backdrop.scrollY(5);
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