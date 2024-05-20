// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

const STANDSTILL_VALUE = 0.1;

class Actor extends Shape {
  constructor(xpos, ypos, 
              hitboxHeight, hitboxWidth, 
              fillColor, moveSpeed, rotateSpeed) {
    super(xpos, ypos, hitboxHeight, hitboxWidth, fillColor);
    this.x = xpos;
    this.y = ypos;
    this.xvel = 0;
    this.yvel = 0;
    this.moveSpeed = moveSpeed;
    this.rotateSpeed = rotateSpeed;
    this.currentRotation = 0;
  }

  resetPosition() {
    this.x = 50;
    this.y = 50;
  }

  moveLeft() {
    this.moveX(-this.moveSpeed);
  }
  
  moveRight() {
    this.moveX(this.moveSpeed);
  }

  moveUp() {
    this.moveY(-this.moveSpeed);
  }

  moveDown() {
    this.moveY(this.moveSpeed);
  }

  moveX(val) {
    this.x += val;
  }
  
  moveY(val) {
    this.y += val;
  }
  
  addForceX(vel) {
    this.xvel += vel;
  }
  
  addForceY(vel) {
    this.yvel += vel;
  }
  
  rotateCw() {
    this.currentRotation += this.rotateSpeed;
  }
  
  rotateCcw() {
    this.currentRotation -= this.rotateSpeed;
  }
  
  draw() {
    push();
    fill(this.fillColor);
    translate(this.x, this.y)
    rect(0, 0, 10, 10);
    // rotate(this.currentRotation);
    
    this.xvel += this.xvel / -10;
    this.yvel += this.yvel / -10;
    // console.log("xvel:"+this.xvel+" yvel:"+this.yvel);
    if (Math.abs(this.xvel) < STANDSTILL_VALUE && Math.abs(this.yvel) < STANDSTILL_VALUE) {
      this.xvel = 0.0;
      this.yvel = 0.0;
    }
    this.x += this.xvel;
    this.y += this.yvel;
    rotate(this.currentRotation);
    translate(this.x, this.y);
    // translate(this.x, this.y);
    
    rect(0, 0, this.width, this.height);

    pop();
  }
}