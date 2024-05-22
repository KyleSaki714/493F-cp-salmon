// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

// salmon controller serial
let serialOptions = { baudRate: 115200  };
let serial;
let turnAngle;
let prevXNegative = false;

// beholder.js
let marker0;
let marker1;
let _lastPosHammer; // marker 0
let _lastPosBrush; // marker 1

let backdropIm;
let _backdrop;
let fish;
let pollution;

<<<<<<< HEAD
function setup() {
  // createCanvas(1366, 768);
  angleMode(DEGREES);
  rectMode(CENTER);
  createCanvas(400, 800);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  pollution = new Pollution(100, 100, 80); // array of circles
=======
function preload() {
  backdropIm = loadImage("resources/testriver_3012_480_scrolling.png");
>>>>>>> 78ba174b502f09841399f9f0d60bfd5291602d92
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

  const scrollval = -0.5;
  
  _backdrop.scrollX(scrollval);  
  // console.log(_backdrop.pos.x)
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
  pollution.draw();
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
  //console.log("onSerialDataReceived", newData);

  if(!newData.startsWith("#")){
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
    
      // Parse y location (normalized between 0 and 1)
      startIndex = endIndex + 1;
      endIndex = newData.length;
      let strBrushYFraction = newData.substring(startIndex, endIndex).trim();
      let yFraction = parseFloat(strBrushYFraction);
      // if (yFraction > 0) {
      //   bgy += 5;
      // }
      //console.log(yFraction);
      turnAngle = newData.substring(startIndex, endIndex).trim();
      const angleArr = turnAngle.split(",");
      const angle = parseFloat(angleArr[1]);
      // console.log(angle);

      //turns
      if (angle > 2.0) {
        fish.setRotation(0.01)
      } else if (angle < -2.0) {
        fish.setRotation(-0.01)
      }
      // make rotation a bool instead
      // } else {
      //   fish.setRotation(0);
      // }
      if (prevXNegative && xFraction > 0) {
        //bgy += 5;
        if (fish.canSwim()) {
          console.log("swimming");
          fish.swim();
        } else {
          console.log("not swimming");
          fish.stopSwim();
        }
        //prevXNegative = false;
      }
      else if(!prevXNegative && xFraction < 0) {
        //bgy += 5;
        if (fish.canSwim()) {
          fish.swim();
        } else {
          fish.stopSwim();
        }
        //prevXNegative = true;
      }
      
      if (xFraction > 0) {
        prevXNegative = false;
      } else if (xFraction < 0) {
        prevXNegative = true;
      }

    }
  }
}


function openConnectSerialDialog() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
>>>>>>> 78ba174b502f09841399f9f0d60bfd5291602d92
}