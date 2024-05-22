// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

// salmon controller serial
let serialOptions = { baudRate: 115200  };
let serial;
let turnAngle;
let _prevYPolarity = false; // if true, last X axis value was positive. otherwise negative 
let _lastSwimAngle = 0; // previous angle a swim was triggered. initially set to half distance to get that semi circle motion.
const SWIM_DIST_THRESH = 2; // how much salmon controller needs to turn to execute a swim. 
let _isTurningMotion = false; // if the salmon controller is being used to turn.
let _isTurningKeys = false; // if the a and d keys are being used to turn.

// beholder.js
let marker0;
let marker1;
let _lastPosHammer; // marker 0
let _lastPosBrush; // marker 1

let backdropIm;
let _river;
let fish;
let pollution = [];
let polluteNum = 0;

function preload() {
  backdropIm = loadImage("resources/testriver_3012_480_scrolling_dam.png");
}

function setup() {
  p5beholder.prepare();
  createCanvas(640, 480); // small canvas so it doesnt lag
  rectMode(CENTER);
  // createCanvas(1600, 900);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  // fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  fish = new Fish(10, color("salmon"), createVector(27, 92));
  pollution[polluteNum] = new Pollution(500, 100, 80); // array of pollution blobs 

  _river = new Backdrop(backdropIm);
  _lastPosBrush = createVector(-100, -100);
  _lastPosHammer = createVector(-100, -100);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
  document.getElementById("connect-serial").addEventListener("click", openConnectSerialDialog);
}



function draw() {
  // beholder updates before all code in draw()
  marker0 = p5beholder.getMarker(0);
  marker1 = p5beholder.getMarker(1);
  
  clear();
  background("lightblue");
    
  input();

  let scrollval = -0.5; // default -0.5?
  
  // stop scrolling river
  if (_river.pos.x < (-_river.backdrop.width + width)) {
    // this.pos = (-this.backdrop.width + width);
    scrollval = 0;
  }
  
  _river.scrollX(scrollval);  
  // console.log(_river.pos.x)
  // draw background before fish, for collision colors
  _river.render();

  fish.scrollX(scrollval);
  pollution[0].scrollX(scrollval);

  // update marker positions
  if (marker0.present) {
    let pos = p5beholder.cameraToCanvasVector(marker0.center);
    _lastPosHammer = pos;
    _lastPosHammer.x = width - pos.x;
  }
  if (marker1.present) {
    let pos = p5beholder.cameraToCanvasVector(marker1.center);
    _lastPosBrush = pos;
    _lastPosBrush.x = width - pos.x;
  }

  // draw sttuff with the marker positions
  push();
  fill("brown");
  rect(_lastPosHammer.x, _lastPosHammer.y, 10, 10);
  pop();

  push();
  fill("white");
  rect(_lastPosBrush.x, _lastPosBrush.y, 20, 20);
  pop();

  pollution[polluteNum].draw();
  // console.log(fishCurrentColColor)
  if (fish.checkColorCollisionGrass()) {
    console.log("Bonk");

    // Stuck between edge and grass
   if (fish.pos.x < 10) {
     fish.pos.x = 50;
     fish.pos.y = 200;

     // If spawned inside grass, move salmon outside of grass
     while (fish.checkColorCollisionGrass()) {
       fish.pos.y += 10;
     }
   }
   fish.stop();
   fish.backup();
 }
 
  push()
  noFill()
  if (mouseIsPressed) {
    stroke("orange")
  } else {
    stroke("white")
  }
  circle(mouseX, mouseY, 50);
  pop()
  
  fish.checkOOB();
  fish.render();
  fish.turn();
  fish.update();
  
  // text(10, 10, frameRate());
  // console.log(Math.floor(frameRate()));
}

function input() {
  
  // "r"
  if (keyIsDown(82)) {
    fish.pos = createVector(width * 0.2, height / 2);
  }
  
  if (keyIsDown(LEFT_ARROW)) {
    _river.scrollX(-5);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    _river.scrollX(5);
  }
  if (keyIsDown(UP_ARROW)) {
    _river.scrollY(-5);
  }
  if (keyIsDown(DOWN_ARROW)) {
    _river.scrollY(5);
  }

  // "d"
  if (keyIsDown(68)) {
    _isTurningKeys = true;
    fish.setRotation(0.1)
    // "a"
  } else if (keyIsDown(65)) {
    _isTurningKeys = true;
    fish.setRotation(-0.1)
  } else {
    _isTurningKeys = false;
  }
  
  if (!_isTurningMotion && !_isTurningKeys) {
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

function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
}

function onSerialDataReceived(eventSender, newData) {
  // TODO: first check location of aruco...
  if (newData.startsWith("Shake")) {
    // separate out the shake value
    let shakeVal = parseFloat(newData.split(":")[1]); // separate out the actual shake val
    if (pollution[polluteNum].brush_collide(_lastPosBrush)) {
      console.log("should attempt to clean!")
      pollution[polluteNum].clean_particle(shakeVal);
    } else {
      console.log("fail");
    }
  }
  //console.log("onSerialDataReceived", newData);
   else if(!newData.startsWith("#")){
    // Clear screen
//     if(newData.toLowerCase().startsWith("clear")) {
//       background(127);
//     }
    
//     if (newData.toLowerCase().startsWith("color")) {
//       isRainbow = !isRainbow;
//     }
    
    let startIndex = 0;
    let endIndex = newData.indexOf(",");
    if(endIndex != -1){
      // Parse x location (normalized between 0 and 1)
      let strBrushXFraction = newData.substring(startIndex, endIndex).trim();
      let xFraction = parseFloat(strBrushXFraction);
      // console.log("x: " + xFraction);
      
      // Parse y location (normalized between 0 and 1)
      startIndex = endIndex + 1;
      endIndex = newData.length;
      let strBrushYFraction = newData.substring(startIndex, endIndex).trim();
      let yFraction = parseFloat(strBrushYFraction);

      // console.log("y: " + yFraction);
      turnAngle = newData.substring(startIndex, endIndex).trim();
      const angleArr = turnAngle.split(",");
      const zFraction = parseFloat(angleArr[1]);
      // console.log("z: " + zFraction);
      // console.log(zFraction);

      //turns
      let rotValue = (xFraction / 9.8) * 0.1;
      if (xFraction > 5.0) {
        _isTurningMotion = true;
        fish.setRotation(rotValue)
      } else if (xFraction < -5.0) {
        _isTurningMotion = true;
        fish.setRotation(rotValue)
      } else {
        _isTurningMotion = false;
      }
      
      // if (_prevYPolarity && xFraction > 0) {
      //   //bgy += 5;
      //   if (fish.canSwim()) {
      //     // console.log("swimming");
      //     fish.swim();
      //   } else {
      //     // console.log("not swimming");
      //     fish.stopSwim();
      //   }
      //   //_prevYPolarity = false;
      // }
      // else if(!_prevYPolarity && xFraction < 0) {
      //   //bgy += 5;
      //   if (fish.canSwim()) {
      //     fish.swim();
      //   } else {
      //     fish.stopSwim();
      //   }
      //   //_prevYPolarity = true;
      // }
      
      // swimming
      let distFromLastSwim = Math.abs(yFraction - _lastSwimAngle);
      if (distFromLastSwim > SWIM_DIST_THRESH) {
        if (fish.canSwim()) {
          fish.swim();
          console.log("Swim");
        }
        _lastSwimAngle = yFraction;
      } else {
        fish.stopSwim();  
      }
      
      // let curYpolarity = yFraction > 0;
      // if (curYpolarity != _prevYPolarity) {
      //   if (fish.canSwim()) {
      //     fish.swim();
      //     // console.log("Swim" + fish.pos);
      //   }
      // } else {
      //   fish.stopSwim();
      // }
      
      
      // toggle polarity 
      // if (yFraction > 0) {
      //   _prevYPolarity = true;
      //   // console.log(_prevYPolarity);
      // } else if (yFraction <= 0) {
      //   _prevYPolarity = false;
      //   // console.log(_prevYPolarity);
      // }
      


    }
  }
}

function openConnectSerialDialog() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}