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
let SERIAL_CONNECTED = false; // true when onSerialConnectionOpened is called.
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
let marker2;
let _lastPosHammer = 0; // marker 0 position
let _lastRotHammer = 0; // marker 0 rotation. THIS IS IN RADIANS
let _lastPosBrush = 0; // marker 1

// fishladder
const FISHLADDER_COOOLDOWNTIME = 500; // default 2500?
let _fishLadders = [];
let _lastFishLadderPlacedTime = -FISHLADDER_COOOLDOWNTIME;

// other globals
let _river;
const AMT_FISH = 6;
let SALMON_SPAWNPOINT_X;
let SALMON_SPAWNPOINT_Y;
const SALMON_TURNRATE = 0.1;
const SALMON_BOOSTRATE = 2;
const SALMON_SLOWDOWN_DEBUFF = 0.5; // 70% boost reduction when polluted
let fish;
let _fishes = [];
let fishAlive = 7;

// pollution
let pollution = [];
let fishermen = [];

let factsArr = [];
let fact;
let factSound;

// images for preload 
let backdropIm;
let fishLadderIm;
let salmonSprite_normal;
let salmonSprite_sick;
let salmonSprite_dead;
let scrub_sound;
let fishermanIm;

let gameStarted;

function preload() {
  // backdropIm = loadImage("resources/testriver_3012_480_scrolling_dam.png");
  backdropIm = loadImage("resources/testriver_3012_480_scrolling_balllardlocks.png");
  fishLadderIm = loadImage("resources/fishladder.png");
  salmonSprite_normal = loadImage("resources/salmon.png");
  salmonSprite_sick = loadImage("resources/salmon_sick.png");
  salmonSprite_dead = loadImage("resources/salmon_dead.png");
  fishermanIm = loadImage("resources/fisherman.png");
}

function spawnSalmon() {
  const SPAWNINGRADIUS = 25;
  for (let i = 0; i < AMT_FISH; i++) {

    // randomize spawn position
    const THETA = (2 * PI / AMT_FISH) * i;
    let x = SALMON_SPAWNPOINT_X + SPAWNINGRADIUS * Math.cos(THETA);
    let y = SALMON_SPAWNPOINT_Y + SPAWNINGRADIUS * Math.sin(THETA);
    let spawnPos = createVector(x, y);
    
    let curFish = new Fish(10, color("salmon"), spawnPos, SALMON_TURNRATE, SALMON_BOOSTRATE, SALMON_SLOWDOWN_DEBUFF, salmonSprite_normal, salmonSprite_sick, salmonSprite_dead);
    _fishes.push(curFish);
  }
}

function setup() {
  p5beholder.prepare();
  createCanvas(640, 480); // small canvas so it doesnt lag
  rectMode(CENTER);

  // spawnpoint declarations are init in setup because height and width of canvas is variable.
  SALMON_SPAWNPOINT_X = width * 0.2;
  SALMON_SPAWNPOINT_Y = height / 2;

  // fact = new FunFact(700, 100, 150, 150, "Metals and pesticides are toxic to" +
  // "the salmon nervous system, so if a body of " + 
  // "water is contaminated with them, it disrupts " +
  // "feeding and predator avoidance of salmon.");
  factsArr.push(new FunFact(700, 100, 150, 150, "Metals and pesticides are toxic to " +
  "the salmon nervous system, so if a body of " + 
  "water is contaminated with them, it disrupts " +
  "feeding and predator avoidance of salmon."));

  factsArr.push(new FunFact(2200, 250, 150, 150, "Copper, a stormwater contaminant, impairs salmon's ability to detect odors, which salmon use to return back to spawn as well as prey detection."))
  
  factsArr.push(new FunFact(3000, 250, 180, 180, "Since salmon are high on the food chain in rivers, will have higher concentrations of toxic substances due to taking in more contaminated food, water, and air than organisms lower on the the food chain."))

  factsArr.push(new FunFact(6000, 250, 160, 180, "Salmon rely on snow on mountains to melt and bring cool, clean water into the rivers during summer. Rising temperatures mean less snow, which result in less cool water, threatening salmon life."))
  factSound = createAudio('Quiz-Buzzer01-1.mp3');

  // one middle fish
  fish = new Fish(10, color("salmon"), createVector(SALMON_SPAWNPOINT_X, SALMON_SPAWNPOINT_Y), SALMON_TURNRATE, SALMON_BOOSTRATE, SALMON_SLOWDOWN_DEBUFF, salmonSprite_normal, salmonSprite_sick, salmonSprite_dead);
  spawnSalmon();
  console.log(_fishes);
  pollution.push(new Pollution(500, 180, 70)); // array of pollution blobs 
  pollution.push(new Pollution(1100, 170, 90));
  pollution.push(new Pollution(1500, 75, 85));
  pollution.push(new Pollution(1800, 330, 60));
  pollution.push(new Pollution(2300, 180, 60));
  pollution.push(new Pollution(2500, 130, 60));
  pollution.push(new Pollution(2600, 200, 60));

  // fishermen
  fishermen.push(new Fisherman(400, 50, fishermanIm));

  gameStarted = false;

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
  // Start menu
  if (!gameStarted) {
    fill(color("#00b4d8"));
    rect(0, 0, 1600, 1000);
    fill('white');
    textFont('Verdana');
    textStyle(BOLD);
    textSize(80);
    textAlign(CENTER);
    text("SALMON SAVIOR", 300, 200, 500, 300);
    rect(300, 260, 300, 50, 20);
    fill(color("#00b4d8"));
    rect(300, 260, 270, 30, 20);
    fill('white');
    textSize(20);
    text("Press 'a' to start", 300, 400, 300, 300);
    image(salmonSprite_normal, 50, 50);
    image(salmonSprite_normal, 300, 300);
    image(salmonSprite_normal, 90, 250);
    image(salmonSprite_normal, 75, 400);
    image(salmonSprite_normal, 500, 150);
    image(salmonSprite_sick, 480, 403);
    image(salmonSprite_dead, 530, 50);



    if (keyIsDown(65)) { // press a to start
      gameStarted = true;
    }
  }
  else {
  
  rect(0, 0, 100, 50);
  // beholder updates before all code in draw()
  marker0 = p5beholder.getMarker(0);
  marker1 = p5beholder.getMarker(1);
  marker2 = p5beholder.getMarker(2);
  
  clear();
  background("lightblue");
    
  input();
  output();

  let scrollval = -0.5; // default -0.5?
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
  for (let p = 0; p < pollution.length; p++) {
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
  if (marker2.present) {
    let pos = p5beholder.cameraToCanvasVector(marker2.center);
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

  // draw obstacles
  for (let p = 0; p < pollution.length; p++) {
    pollution[p].draw();
  }

  for (let f = 0; f < fishermen.length; f++) {
    fishermen[f].checkColorCollisionGrass(scrollval);
    fishermen[f].scrollX(fishermen[f].getSpeed());
    fishermen[f].draw();
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
    salmon.checkDead();
    salmon.render();
    salmon.drawSprite();
    salmon.turn();
    salmon.update();
    if (salmon._isDead && salmon._firstDeath) {
      fishAlive -= 1;
      salmon.deathTrackLED();
    }
  }  
  
  fish.checkOOB();
  fish.checkDead();
  if (fish._isDead && fish._firstDeath) {
    fishAlive -= 1;
    fish.deathTrackLED();
  }
  
  fish.render();
  fish.drawSprite();
  fish.turn();
  fish.update();

  if (-300 > _river.pos.x) {
   factsArr[0].draw();
   if (-310 <_river.pos.x) {
    factSound.play();
   }
  }
  if (-1500 > _river.pos.x) {
    factsArr[1].draw();
    if (-1510 <_river.pos.x) {
      factSound.play();
     }
  }
  if (-2500 > _river.pos.x) {
    factsArr[2].draw();
    if (-2510 <_river.pos.x) {
      factSound.play();
     }
  }
  if (-5000 > _river.pos.x) {
    factsArr[3].draw();
    if (-5010 <_river.pos.x) {
      factSound.play();
     }
  }
  factsArr[0].scrollX(scrollval);
  factsArr[1].scrollX(scrollval);
  factsArr[2].scrollX(scrollval);
  factsArr[3].scrollX(scrollval);


  
  // text(10, 10, frameRate());
  // console.log(Math.floor(frameRate()));
  }
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
    fish.turnRight();
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      salmon.turnRight();
    }
    // "a"
  } else if (keyIsDown(65)) {
    _isTurningKeys = true;
    fish.turnLeft();
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
  
  // 'spacebar'
  if (keyIsDown(32)){
    handleSerialScrub("0.9");
  }
}

function output() {
  if (serial.isOpen()) {
    serial.writeLine(fishAlive);
  }
}

function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  SERIAL_CONNECTED = true;
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
}

/**
 * Using a given string of comma separated values,
 * parses it into gyro and accelerometer data for the salmon controller.
 * @param {String[]} valuesString 
 */
function handleSerialSalmon(valuesString) {
  // console.log(values);
  const values = valuesString.split(',');

  // Parse each value as a float
  const yaw = parseFloat(values[0]);
  const pitch = parseFloat(values[1]);
  const roll = parseFloat(values[2]);
  const accelerationX = parseFloat(values[3]);
  const accelerationY = parseFloat(values[4]);
  const accelerationZ = parseFloat(values[5]);
  const joystickY = parseFloat(values[6]);
  const joystickX = parseFloat(values[7]);
  const joystickBtn = parseInt(values[8]);

  // console.log(yaw);
  let joyx_normneg = (joystickX * 2.0) - 1.0;
  let joyy_normneg = (joystickY * 2.0) - 1.0;
  
  // NOT USING THE X AXIS? JUST TESTING IT FOR NOW 
  if (SERIAL_CONNECTED && abs(joyx_normneg) > 0.1) {
    console.log("joyx_normneg " + joyx_normneg);
    
    let force = p5.Vector.fromAngle(fish.heading);
    force.mult(joyx_normneg * 0.1);
    fish.joystickAddForce(force);
    
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      let forceSalmon = p5.Vector.fromAngle(salmon.heading);
      forceSalmon.mult(joyx_normneg * 0.1);
      salmon.joystickAddForce(forceSalmon);
    }
  }
  
  // JOYSTICK Y AXIS: SALMON ROTATE
  if (SERIAL_CONNECTED && joyy_normneg && abs(joyy_normneg) > 0.1) { // drift
    console.log("joyy_normneg " + joyy_normneg);
    _isTurningMotion = true;
    let rotValue = joyy_normneg * SALMON_TURNRATE;
    fish.joystickSetRotation(rotValue)

    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      salmon.joystickSetRotation(rotValue);
      
    }
  }
  // both joysticks are in 0 position
  if (SERIAL_CONNECTED && abs(joyy_normneg) < 0.1 && abs(joyx_normneg) < 0.1) {
    _isTurningMotion = false;
  }
  if (SERIAL_CONNECTED && joystickBtn) {
    console.log("joystickBtn " + joystickBtn);
  }

  // swimming
  // let distFromLastSwim = Math.abs(yFraction - _lastSwimAngle);
  let distFromLastSwim = Math.abs(yaw - _lastSwimAngle);
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
    _lastSwimAngle = yaw;
  } else {
    fish.stopSwim();
    for (let i = 0; i < _fishes.length; i++) {
      let salmon = _fishes[i];
      salmon.stopSwim();
    }
  }
}

/**
 *
 * @param {String[]} valuesString 
 */
function handleSerialScrub(valuesString) {
 let shakeVal = parseFloat(valuesString);
  for (let p = 0; p < pollution.length; p++) {
    if (pollution[p].brush_collide(_lastPosBrush)) {
      console.log("should attempt to clean!")
      pollution[p].clean_particle(shakeVal);
      break;
    } 
  }
}

/**
 * TODO most likely just a button press
 * @param {String[]} valuesString 
 */
function handleSerialHammer(valuesString) {
  // console.log(values);
  const values = valuesString.split(',');

}

function onSerialDataReceived(eventSender, newData) {
  let controllers = newData.split("|");
  for (let ctrl of controllers) {
    let nameSplit = ctrl.split(":");
    const name = nameSplit[0];
    const values = nameSplit[1];
    if (name === "salmon") {
      handleSerialSalmon(values);
    } else if (name === "scrub") {
      handleSerialScrub(values)
    } else if (name === "hammer") {
      handleSerialHammer(values);
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