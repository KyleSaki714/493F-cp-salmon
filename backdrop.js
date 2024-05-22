class Backdrop {
  constructor(image) {
    this.backdrop = image;
    this.pos = createVector(0, 0);
    this.defaultScroll = 0.1;
  }
  
  scrollX(val) {
    this.pos.x += val;
  }
  
  scrollY(val) {
    this.pos.y += val;
  }
  
  render() {
    push();
    translate(this.pos);
    image(this.backdrop, 0, 0);
    pop();
  }
  
}