const COLLISIONCOLOR_GRASS = [24, 62, 12, 255];
const COLLISIONCOLOR_DAM = [185, 180, 171, 255];
const COLLISIONCOLOR_POLLUTION = [255, 0, 0, 255];

class Fish extends Ship {

    constructor(size, color, startingPos, turnRate, boostRate, boostRateDebuff) {
      super(size, color, startingPos, boostRate, boostRateDebuff);
      this._id = 100 + Math.trunc(Math.random() * 900);
      this._swimming = false;
      this._lastSwimTime = 0;
      this._swimCooldown = 900;
      this._timeSinceEnteredGrass = 0;
      this._turnRate = turnRate;
      this._polluted = false;
      this._pollutedBoostRate = boostRate * boostRateDebuff; // reduction in boost

      // FUTURE: create collision box
      // define a collision box where we check all four corners for color collisions.
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
            !this.isBoosting;
    }

    getCurrentFishCollisionColor() {
      return get(this.pos.x, this.pos.y);
    }
    
    checkColorCollisionPollution() {
      let fishCurrentColColor = this.getCurrentFishCollisionColor();
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
      
      if (this.checkColorCollisionPollution()) {
        console.log("Salmon #" + this._id + " said: \"OUCH!!!\"");
        this._polluted = true;
        this.setBoostRate(this._pollutedBoostRate);
      }
    }
    
    turnRight() {
      this.setRotation(this._turnRate);
    }
    
    turnLeft() {
      this.setRotation(-this._turnRate);
    }
    
    stopTurning() {
      this.setRotation(0);
    }
  }