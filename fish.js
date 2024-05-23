const COLLISIONCOLOR_GRASS = [24, 62, 12, 255];
const COLLISIONCOLOR_DAM = [185, 180, 171, 255];

class Fish extends Ship {

    constructor(size, color, startingPos, turnRate, boostRate) {
      super(size, color, startingPos, boostRate);
      this._id = 100 + Math.trunc(Math.random() * 900);
      this._swimming = false;
      this._lastSwimTime = 0;
      this._swimCooldown = 900;
      this._timeSinceEnteredGrass = 0;
      this._turnRate = turnRate;

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

    checkColorCollisionGrass() {
      let fishCurrentColColor = get(this.pos.x, this.pos.y);
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