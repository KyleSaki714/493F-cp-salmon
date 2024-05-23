class FishLadder {
  constructor(image, pos, rot) {
    this.pos = pos;
    // this.pos = createVector(pos.x - (image.width / 2), pos.y - (image.height / 2));
    this.rotation = rot;
    console.log(degrees(this.rotation));
    this.image = image;
  }
  
  scrollX(val) {
    this.pos.x += val;
  }
  
  scrollY(val) {
    this.pos.y += val;
  }
  
  render() {
    push();
    // translate(this.pos.x - (this.image.width / 2), this.pos.y - (this.image.height / 2));
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    image(this.image, 0, 0);
    pop();
  }
}