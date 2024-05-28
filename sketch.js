/**
 * Salmon Run!
 * CSE 493F: Prototyping Interactive Systems with AI
 * A prototype interactive "walk up and play" game where you use tools to clean different
 * environmental issues to help salmon migrate to their spawn.
 * 
 * Brought to you by:
 * - Noah Tablit
 * - Stephanie Osorio-Tristan
 * - Richard Le
 * - Kyle Santos
 */

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
let _lastPosHammer = 0; // marker 0 position
let _lastRotHammer = 0; // marker 0 rotation. THIS IS IN RADIANS
let _lastPosBrush = 0; // marker 1

// fishladder
const FISHLADDER_COOOLDOWNTIME = 500; // default 2500?
let _fishLadders = [];
let _lastFishLadderPlacedTime = -FISHLADDER_COOOLDOWNTIME;

// other globals
let _river;
const MIN_FISH = 6;
const SPAWNBOX_X = 38;
const SPAWNBOX_Y = 166;
const SPAWNBOX_SIZE = 200;
const SALMON_TURNRATE_MIN = 0.05;
const SALMON_TURNRATE_MAX = 0.15;
const SALMON_BOOSTRATE_MIN = 1.5;
const SALMON_BOOSTRATE_MAX = 2.5;
let fish;
let _fishes = [];

// pollution
let pollution = [];
let polluteNum = 3;

// images for preload 
let backdropIm;
let fishLadderIm;

function preload() {
  backdropIm = loadImage("resources/testriver_3012_480_scrolling_dam.png");
  fishLadderIm = loadImage("resources/fishladder.png");
}

function spawnSalmon() {
  let amt = MIN_FISH + Math.floor(Math.random() * 3);
  for (let i = 0; i < amt; i++) {
    
    // randomize spawn position
    let x = int(random(SPAWNBOX_X, SPAWNBOX_X + SPAWNBOX_SIZE));
    let y = int(random(SPAWNBOX_Y, SPAWNBOX_Y + SPAWNBOX_SIZE));
    let spawnPos = createVector(x, y);
    
    // randomize turn rate
    let turnRate = getRandomBetween(SALMON_TURNRATE_MIN, SALMON_TURNRATE_MAX);
    
    // randomize boost rate
    let boostRate = getRandomBetween(SALMON_BOOSTRATE_MIN, SALMON_BOOSTRATE_MAX);
    
    let curFish = new Fish(10, color("salmon"), spawnPos, turnRate, boostRate);
    _fishes.push(curFish);
  }
}

function setup() {
  p5beholder.prepare();
  createCanvas(640, 480); // small canvas so it doesnt lag
  rectMode(CENTER);
  // createCanvas(1600, 900);
  // fish = new Fish(width / 2, height * 0.90, 15, 20, "#FA8072", 10, 5);
  // fish = new Fish(0, 0, 15, 20, "#FA8072", 5, 5);
  fish = new Fish(10, color("salmon"), createVector(27, 92), 0.1, 2);
  spawnSalmon();
  console.log(_fishes);
  pollution[0] = new Pollution(500, 200, 80); // array of pollution blobs 
  pollution[1] = new Pollution(1000, 180, 50);
  pollution[2] = new Pollution(2000, 120, 50);

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

  let scrollval = -0.4; // default -0.5?
  // stop scrolling river
  if (_river.pos.x < (-_river.image.width + width)) {
    // this.pos = (-this.backdrop.width + width);
    scrollval = 0;
  }
  
  // scroll and draw river
  _river.scrollX(scrollval);  
  // console.log(_river.pos.x)
  // draw background before fish, for collision colors
  _river.render();
  
  // scroll and draw any fishladders
  if (_fishLadders.length > 0) {
    for (let i = 0; i < _fishLadders.length; i++) {
      let fl = _fishLadders[i];
      // console.log(_fishLadders)
      if (fl != undefined) {
        // delete if goes past canvas
        if (fl.pos.x < 0 - fl.image.width) {
          _fishLadders[i] = undefined;
          // console.log("fishladder " + i + " deleted");
        }
        fl.scrollX(scrollval);
        fl.render();
      }
    }
  }

  // scroll fish and pollution
  fish.scrollX(scrollval);
  for (let i = 0; i < _fishes.length; i++) {
    let salmon = _fishes[i];
    salmon.scrollX(scrollval);
  }
  for (let p = 0; p < polluteNum; p++) {
    pollution[p].scrollX(scrollval);
  }


  // update marker positions
  if (marker0.present) {
    let pos = p5beholder.cameraToCanvasVector(marker0.center);
    _lastPosHammer = pos;
    let rot = marker0.rotation;
    _lastRotHammer = rot;
    // _lastPosHammer.x = width - pos.x;
  }
  if (marker1.present) {
    let pos = p5beholder.cameraToCanvasVector(marker1.center);
    _lastPosBrush = pos;
    // _lastPosBrush.x = width - pos.x;
  }

  // draw marker cursors with the marker positions
  push()
  stroke("gray")
  fill("lightblue")
  translate(_lastPosHammer.x, _lastPosHammer.y); 
  rotate(_lastRotHammer);
  rect(0, 0, 30, 10);
  pop()

  push();
  fill("white");
  rect(_lastPosBrush.x, _lastPosBrush.y, 20, 20);
  pop();

  for (let p = 0; p < polluteNum; p++) {
    pollution[p].draw();
  }

  // console.log(fishCurrentColColor)
  fish.checkGameCollision();
  for (let i = 0; i < _fishes.length; i++) {
    let salmon = _fishes[i];
    salmon.checkGameCollision();
  }
  // FISH LADDER PLACEMENT
  // if L is pressed and cooldown ok

  if (keyIsDown(76) && (millis() - _lastFishLadderPlacedTime) > FISHLADDER_COOOLDOWNTIME) {
    _lastFishLadderPlacedTime = millis()
    _fishLadders.push(new FishLadder(fishLadderIm, _lastPosHammer, _lastRotHammer));
    
  }
  
  for (let i = 0; i < _fishes.length; i++) {
    let salmon = _fishes[i];
    salmon.checkOOB();
    salmon.render();
    salmon.turn();
    salmon.update();
  }  
  
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
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      salmon.pos = createVector(width * 0.2, height / 2);
    }
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
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      salmon.turnRight();
    }
    // "a"
  } else if (keyIsDown(65)) {
    _isTurningKeys = true;
    fish.setRotation(-0.1)
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      salmon.turnLeft();
    }
  } else {
    _isTurningKeys = false;
  }
  
  if (!_isTurningMotion && !_isTurningKeys) {
    fish.setRotation(0);
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      salmon.stopTurning();
    }
  }
  
  // "w"
  if (keyIsDown(87)) {
    if (fish.canSwim()) {
      fish.swim();
    } else {
      fish.stopSwim();
    }
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      if (salmon.canSwim()) {
        salmon.swim();
      } else {
        salmon.stopSwim();
      }
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

/**
 * 
 * @param {String[]} valuesString 
 */
function handleInputSalmon(valuesString) {
  // console.log(values);
  const values = valuesString.split(',');

  // Parse each value as a float
  const yaw = parseFloat(values[0]);
  const pitch = parseFloat(values[1]);
  const roll = parseFloat(values[2]);
  const accelerationX = parseFloat(values[3]);
  const accelerationY = parseFloat(values[4]);
  const accelerationZ = parseFloat(values[5]);

  console.log(yaw);

}

function onSerialDataReceived(eventSender, newData) {
  let controllers = newData.split("|");
  for (let ctrl of controllers) {
    let nameSplit = ctrl.split(":");
    let name = nameSplit[0];
    if (name === "salmon") {
      handleInputSalmon(nameSplit[1]);
    } else if (name === "scrub") {
      
    } else if (name === "hammer") {

    }
  }


  // TODO: first check location of aruco...
  if (newData.startsWith("Shake")) {
    // separate out the shake value
    let shakeVal = parseFloat(newData.split(":")[1]); // separate out the actual shake val
    for (let p = 0; p < polluteNum; p++) {
      if (pollution[p].brush_collide(_lastPosBrush)) {
        console.log("should attempt to clean!")
        pollution[p].clean_particle(shakeVal);
        break;
      } 
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
        for (let i = 0; i < _fishes.length; i++) {
          let salmon = _fishes[i];
          if (salmon.canSwim()) {
            salmon.swim();
          }
        }
        _lastSwimAngle = yFraction;
      } else {
        fish.stopSwim();
        for (let i = 0; i < _fishes.length; i++) {
          let salmon = _fishes[i];
          salmon.stopSwim();
        }
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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}