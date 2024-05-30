const rodMin = 80;
const rodMax = 300;

class Fisherman extends Shape{
  
  constructor(x, y, sprite) {
    super(x, y, 50, 50);
    this.sprite = sprite;
    this.sprite.resize(150, 150);
    this.rodLength = 100;
    this.rodSpeed = 4;
  }

  draw() {
    if (this.rodLength <= rodMin || this.rodLength >= rodMax) {
      this.rodSpeed *= -1;
    }
    this.rodLength += this.rodSpeed;
    push();
    imageMode(CENTER);
    image(this.sprite, this.xpos, this.ypos);
    strokeWeight(3);
    line(this.xpos + this.sprite.width/2, this.ypos - this.sprite.height/4, this.xpos + this.sprite.width / 2, this.ypos - this.sprite.height / 4 + this.rodLength);
    fill('purple');
    circle(this.xpos + this.sprite.width / 2, this.ypos - this.sprite.height / 4 + this.rodLength, 10);
    pop();
  }

}