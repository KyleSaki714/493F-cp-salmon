const ROD_MAX = 300;
const ROD_MIN = 80;
const COLLISIONCOLOR_FISHERMAN = [153, 97, 72, 255];
const X_COLLISION_OFFSET_FISHERMAN = 16;
const Y_COLLISION_OFFSET_FISHERMAN = 50;
const COLLISIONCOLOR_HOOK = [128, 0, 128, 255];
const START_ROD_LENGTH = 100;

class Fisherman extends Shape{
  
  constructor(x, y, sprite, deadFishSprite) {
    super(x, y, 50, 50);
    this.sprite = sprite;
    this.deadFishSprite = deadFishSprite;
    this.sprite.resize(110, 110);
    const deadResize = 0.1;
    this.deadFishSprite.resize(this.deadFishSprite.width * deadResize, this.deadFishSprite.height * deadResize);
    this.rodSpeed = 4;
    this.speed = 0;
    this.hookPos = createVector(this.xpos + this.sprite.width / 2, this.ypos - this.sprite.height / 4 + START_ROD_LENGTH);
    this.rodLength = START_ROD_LENGTH;
    this.stopped = false;
    this.fishBox = 2; // count how many fishes caught
  }

  draw() {
    if (!this.stopped) {
      let hookHitGrass = this.checkHookCollisionGrass();
      if (this.rodLength <= ROD_MIN || this.rodLength >= ROD_MAX || hookHitGrass) {
        this.rodSpeed *= -1;
      }
      this.rodLength += this.rodSpeed;
      this.hookPos.y += this.rodSpeed;
      if (hookHitGrass) {
        this.rodLength -= 10;
        this.hookPos.y -= 10;
        
      }
    } else {
      this.hookPos.x = this.xpos + this.sprite.width / 2;
    }
    
    push();
    imageMode(CENTER);
    image(this.sprite, this.xpos, this.ypos);
    strokeWeight(3);
    line(this.xpos + this.sprite.width/2, this.ypos - this.sprite.height/4, this.hookPos.x, this.hookPos.y);
    fill('purple');
    noStroke();
    circle(this.hookPos.x, this.hookPos.y, 10);
    // NOTE: change 15 based on where we want the fish placed
    // 3 is for stacking 
    for (let f = 0; f < this.fishBox; f++) {
      image(this.deadFishSprite, this.xpos - 40, this.ypos + 30 - 5* f);
    }
    pop();
  }

  getCurrentFisherManCollisionColor() {
    return get(this.xpos + X_COLLISION_OFFSET_FISHERMAN, this.ypos + Y_COLLISION_OFFSET_FISHERMAN);
  }

  getHookCollisionColor() {
    return get(this.hookPos.x, this.hookPos.y);
  }

  checkColorCollisionGrass(scrollval) {
    let fisherCurrColor = this.getCurrentFisherManCollisionColor();
    // console.log(fishCurrentColColor);
    let grassHit = fisherCurrColor[0] === COLLISIONCOLOR_GRASS[0] && 
                fisherCurrColor[1] === COLLISIONCOLOR_GRASS[1] && 
                fisherCurrColor[2] === COLLISIONCOLOR_GRASS[2] &&
                fisherCurrColor[3] === COLLISIONCOLOR_GRASS[3];
    if (grassHit) {
      this.speed = scrollval;
      this.stopped = true;
    }
  }

  checkHookCollisionGrass() {
    let getHookCollisionColor = this.getHookCollisionColor();
    let hookHitGrass = getHookCollisionColor[0] === COLLISIONCOLOR_GRASS[0] && 
                    getHookCollisionColor[1] === COLLISIONCOLOR_GRASS[1] && 
                    getHookCollisionColor[2] === COLLISIONCOLOR_GRASS[2] &&
                    getHookCollisionColor[3] === COLLISIONCOLOR_GRASS[3];
    return hookHitGrass;
  }

  getSpeed() {
    return this.speed;
  }

  // used for debugging, gets boat pos offset from center
  getBoatPos() {
    let xOff = mouseX - this.xpos;
    let yOff = mouseY - this.ypos;
    console.log(xOff + " " + yOff + ": " + get(mouseX, mouseY));
  }

  overlapsFish(fish) {
    // based on https://stackoverflow.com/a/4098512
    let reel_in = !(this.getRight() < fish.getLeft() || 
             this.getBottom() < fish.getTop() || 
             this.getLeft() > fish.getRight() ||
             this.getTop() > fish.getBottom());
    //console.log(this.getRight() + " " + this.getBottom() + " " + fish.pos.x + " " + fish.pos.y);
    console.log(reel_in);

    if (reel_in) {
      this.fishBox++
    }
    return reel_in;
  }
}