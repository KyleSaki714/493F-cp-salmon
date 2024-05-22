// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

let backdropIm;
let _backdrop;
let fish;

function preload() {
  backdropIm = loadImage("resources/testriver_3012_480_scrolling.png");
}

function setup() {
  
  // createCanvas(1080, 720);
  createCanvas(640, 480);
  rectMode(CENTER);
  // createCanvas(1600, 900);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  // fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  fish = new Fish(10, color("salmon"), createVector(27, 92));
  _backdrop = new Backdrop(backdropIm);
}



function draw() {
  clear();
  background("lightblue");
  
  input();

  const scrollval = -0.5;
  
  _backdrop.scrollX(scrollval);
  
  // draw background before fish for collision colors
  _backdrop.render();

  // scale(2);
  // image(backdrop, bgx, bgy);
  // console.log(fish.pos.x);
  fish.scrollX(scrollval);
  // if (fish.pos.x > width * 0.70) {
  //   // bgx = bgx - ;
  // }
  // if (fish.pos.y > height * 0.70) {
  //   bgy--;
  // }
  // console.log(color(backdrop.get(mouseX, mouseY)));

  
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