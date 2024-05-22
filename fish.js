const COLLISIONCOLOR_GRASS = [24, 62, 12, 255];
const COLLISIONCOLOR_DAM = [185, 180, 171, 255];

class Fish extends Ship {

    constructor(size, color, startingPos) {
      super(size, color, startingPos);
      this._swimming = false;
      this._lastSwimTime = 0;
      this._swimCooldown = 900;
      this._timeSinceEnteredGrass = 0;

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
      let fishCurrentColColor = get(fish.pos.x, fish.pos.y);
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
    
    beenAwhileSinceEnteredGrassGetMeOut() {
      return (millis() - this._timeSinceEnteredGrass) > 1500;
    }
  }