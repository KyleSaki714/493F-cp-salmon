// this code is from Prof. Froehlich's Cookie Monster Game: https://editor.p5js.org/jonfroehlich/sketches/oUIeXC9sS

class Shape {
  constructor(xpos, ypos, width, height, fillColor) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.width = width;
    this.height = height;
    if (fillColor != undefined) {
      this.fillColor = color(fillColor);
    }
  }

  getLeft() {
    return this.xpos;
  }

  getRight() {
    return this.xpos + this.width;
  }

  getBottom() {
    return this.ypos + this.height;
  }

  getTop() {
    return this.ypos;
  }
  
  scale(fraction){
    this.width *= fraction;
    this.height *= fraction;
  }
  
  incrementHeight(yIncrement, lockAspectRatio){
    let yIncrementFraction = yIncrement / this.height;
    this.height += yIncrement;
    if(lockAspectRatio){
      let xIncrement = yIncrementFraction * this.width;
      this.width += xIncrement;
    }
  }
  
  incrementWidth(xIncrement, lockAspectRatio){
    let xIncrementFraction = xIncrement / this.width;
    this.width += xIncrement;
    if(lockAspectRatio){
      let yIncrement =  xIncrementFraction * this.height;
      this.height += yIncrement;
    }
  }
  
  overlaps(shape){
    // based on https://stackoverflow.com/a/4098512
    return !(this.getRight() < shape.x || 
             this.getBottom() < shape.y || 
             this.x > shape.getRight() || 
             this.y > shape.getBottom());
  }

  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }
}

class Circle extends Shape {
  constructor(x, y, diameter, fillColor) {
    super(x, y, diameter, diameter, fillColor);
  }

  containsCircle(otherCircle) {
    let distFromThisCircleToOtherCircle = dist(this.x, this.y, otherCircle.x, otherCircle.y);
    let otherCircleRadius = otherCircle.diameter / 2;
    let thisRadius = this.diameter / 2;
    if (distFromThisCircleToOtherCircle + otherCircleRadius <= thisRadius) {
      return true;
    }
    return false;
  }

  draw() {
    push();
    noStroke();
    fill(this.fillColor);
    ellipse(this.xpos, this.ypos, this.width);
    pop();
  }

  scrollX(val) {
    this.xpos += val;
  }
}