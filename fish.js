const COLLISIONCOLOR_GRASS = [24, 62, 12, 255];
const COLLISIONCOLOR_DAM = [185, 180, 171, 255];
const COLLISIONCOLOR_POLLUTION = [255, 0, 0, 255];

class Fish extends Ship {

    constructor(size, color, startingPos, turnRate, boostRate, boostRateDebuff, sprite, spriteSick) {
      super(size, color, startingPos, boostRate, boostRateDebuff);
      this._id = 100 + Math.trunc(Math.random() * 900);
      this._swimming = false;
      this._lastSwimTime = 0;
      this._swimCooldown = 900;
      this._timeSinceEnteredGrass = 0;
      this._turnRate = turnRate;
      this._polluted = false;
      this._pollutedBoostRate = boostRate * boostRateDebuff; // reduction in boost
      this.sprite = sprite;  
      this.spriteSick = spriteSick;
      const imageSize = 0.75;
      this.sprite.resize(this.sprite.width * imageSize, this.sprite.height * imageSize)
      this.spriteSick.resize(this.spriteSick.width * imageSize, this.spriteSick.height * imageSize)
      
      this.currentSprite = this.sprite;
      // FUTURE: create collision box
      // define a collision box where we check all four corners for color collisions.
      this.snatched = false;
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
      return (millis() - this._lastSwimTime) > this._swimCooldown &&
            !this.isBoosting && !this.snatched;
    }

    getCurrentFishCollisionColor() {
      return get(this.pos.x, this.pos.y);
    }
    
    checkColorCollisionPollution(fishCurrentColColor) {
      // let fishCurrentColColor = this.getCurrentFishCollisionColor();
      // console.log(fishCurrentColColor);
      let pollu = fishCurrentColColor[0] === COLLISIONCOLOR_POLLUTION[0] && 
              fishCurrentColColor[1] === COLLISIONCOLOR_POLLUTION[1] && 
              fishCurrentColColor[2] === COLLISIONCOLOR_POLLUTION[2] &&
              fishCurrentColColor[3] === COLLISIONCOLOR_POLLUTION[3];
      return pollu;
    }
    
    checkColorCollisionGrass() {
      let fishCurrentColColor = this.getCurrentFishCollisionColor();
      // console.log(fishCurrentColColor);
      let grass = fishCurrentColColor[0] === COLLISIONCOLOR_GRASS[0] && 
              fishCurrentColColor[1] === COLLISIONCOLOR_GRASS[1] && 
              fishCurrentColColor[2] === COLLISIONCOLOR_GRASS[2] &&
              fishCurrentColColor[3] === COLLISIONCOLOR_GRASS[3];
              
      let dam = fishCurrentColColor[0] === COLLISIONCOLOR_DAM[0] && 
              fishCurrentColColor[1] === COLLISIONCOLOR_DAM[1] && 
              fishCurrentColColor[2] === COLLISIONCOLOR_DAM[2] &&
              fishCurrentColColor[3] === COLLISIONCOLOR_DAM[3]
      if (grass && this._timeSinceEnteredGrass === 0) {
        this._timeSinceEnteredGrass = millis();
      }
      return grass || dam;
    }

    checkColorCollisionHook(fishCurrentColColor) {
      let hook = fishCurrentColColor[0] === COLLISIONCOLOR_HOOK[0] && 
              fishCurrentColColor[1] === COLLISIONCOLOR_HOOK[1] && 
              fishCurrentColColor[2] === COLLISIONCOLOR_HOOK[2] &&
              fishCurrentColColor[3] === COLLISIONCOLOR_HOOK[3];
      return hook;
    }
    
    // Bruh!
    beenAwhileSinceEnteredGrassGetMeOut() {
      return (millis() - this._timeSinceEnteredGrass) > 1500;
    }
    
    /**
     * Singular method to check for game collision
     */
    checkGameCollision() {
      if (this.checkColorCollisionGrass()) {
        console.log("Salmon #" + this._id + " said: \"Bonk\"");
    
        // Stuck between edge and grass
       if (this.pos.x < 10) {
        this.pos.x = 50;
        this.pos.y = 200;
    
         // If spawned inside grass, move salmon outside of grass
         while (this.checkColorCollisionGrass()) {
          this.pos.y += 10;
         }
        }
        this.stop();
        this.backup();
      }
      let fishCurrentColor = this.getCurrentFishCollisionColor();
      if (this.checkColorCollisionPollution(fishCurrentColor)) {
        console.log("Salmon #" + this._id + " said: \"OUCH!!!\"");
        this._polluted = true;
        this.setBoostRate(this._pollutedBoostRate);
        this.changeSpriteSick();
      }

      if (this.checkColorCollisionHook(fishCurrentColor)) {
        console.log("Salmon #" + this._id + "said: \"IM FOOD!\"")
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.heading + PI/4);
        pop();
        this.vel = createVector(0, -4);
        this.snatched = true;
        this.boosting(false);
      }
    }
    
    turnRight() {
      if (!this.snatched) {
        this.setRotation(this._turnRate);
      }
    }
    
    turnLeft() {
      if (!this.snatched) {
        this.setRotation(-this._turnRate);
      }
    }
    
    stopTurning() {
      this.setRotation(0);
    }
    
    changeSpriteNormal() {
      this.currentSprite = this.sprite;
    }
    
    changeSpriteSick() {
      this.currentSprite = this.spriteSick;
    }
    
    drawSprite() {
      push()
      imageMode(CENTER)
      translate(this.pos.x, this.pos.y);
      rotate(this.heading);
      image(this.currentSprite, 0,0)
      pop()
    }
  }