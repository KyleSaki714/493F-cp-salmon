/**
 * Thank you Coding Train!! https://youtu.be/hacZU523FyM?si=swUgGpqK4PGniizM
 * Adapted fromCoding Challenge #46.1: Asteroids with p5.js - Part 1
 */

class Ship {
    constructor() {
      this.pos = createVector(width / 2, height /2);
      this.r = 10;
      this.heading = 0; // angle
      this.rotation = 0;
      this.vel = createVector(0,0);
      this.isBoosting = false;
    }
    
    update() {
      if (this.isBoosting) {
        this.boost();
      }
      this.pos.add(this.vel);
      
      // reduces the magnitude of velocity (speed) by
      // 5 percent every frame (to get it to look smooth!)
      this.vel.mult(0.95);
    }
    
    boosting(b) {
      this.isBoosting = b;
    }
    
    // adds to the velocity.
    boost() {
      // fromAngle() creates a vector from an angle
      // this gets us vector in the direction of that heading
      let force = p5.Vector.fromAngle(this.heading);
      force.mult(0.99);
      this.vel.add(force);
    }
    
    render() {
      push()
      translate(this.pos.x, this.pos.y);
      rotate(this.heading + PI / 2);
      // noFill();
      // stroke(255);
      triangle(-this.r, this.r, this.r, this.r, 0, -this.r);
      pop()
    }
    
    setRotation(angle) {
      this.rotation = angle;
    }
    
    // angle: amoutn to turn by
    turn() {
      this.heading += this.rotation;
    }
  }