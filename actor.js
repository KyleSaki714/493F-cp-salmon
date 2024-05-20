// this code adapted from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

const STANDSTILL_VALUE = 0.00000000000000001;

class Actor extends Shape {
  constructor(xpos, ypos, 
              hitboxHeight, hitboxWidth, 
              fillColor, moveSpeed) {
    super(xpos, ypos, hitboxHeight, hitboxWidth, fillColor);
    this.x = xpos;
    this.y = ypos;
    this.xvel = 0;
    this.yvel = 0;
    this.moveSpeed = moveSpeed;
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
  
  draw() {
    push();
    
    // if (this.xvel < STANDSTILL_VALUE && this.yvel < STANDSTILL_VALUE) {
    //   this.xvel = 0;
    //   this.yvel = 0;
    // } else {
      // let yProgress = this.yvel / -10;
      // let xProgress = this.xvel / -10;

      // this.x += xProgress;
      // this.y += yProgress;

      // this.xvel += xProgress;
      // this.yvel += yProgress;
    // }
    
    fill(this.fillColor);
    rect(this.x, this.y, this.width, this.height);
    // translate(this.xvel, this.yvel);

    pop();
  }
}