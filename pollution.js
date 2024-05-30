/**
 * Defines a polluted area containing particles for player to scrub away
 */
class Pollution extends Shape {
  /**
   * 
   * @param {x-coordinate} x 
   * @param {y-coordinate} y 
   * @param {polluted area diameter} w
   */
  constructor(x, y, w) {
    super(x, y, w, w);
    // random num of particles within radius
    this.num_particles = int(random(this.width/10, this.width/5));
    this.particles = [];
    this.br
    print(this.num_particles);
    colorMode(HSB);
    for (let i = 0; i < this.num_particles; i++) {
      this.particles.push(new Circle(this.xpos + int(random(0, this.width)), this.ypos + int(random(0,this.width)), int(random(8, 15)), color(0,100, 100)));
    }
    this.scrub_sound = loadSound('sound/brush-scrubbing.mp3');
  }

  draw() {
    for (let i = 0; i < this.num_particles; i++) {
      this.particles[i].draw();
    }
  }

  scrollX(val) {
    this.xpos += val;
     for (let p = 0; p < this.num_particles; p++) {
      this.particles[p].scrollX(val);
     }
  }

  brush_collide(brush_pos) {
    console.log(brush_pos + " " + this.xpos + " " + this.ypos + " " + this.width + this.getRight());
    let collision = this.xpos <= brush_pos.x && brush_pos.x <= this.getRight() && this.ypos <= brush_pos.y && brush_pos.y <= this.getBottom();
    if (collision) {
      push()
      rectMode(CORNER);
      stroke(46, 100, 85);
      noFill();
      strokeWeight(4);
      square(this.xpos, this.ypos, this.width);
      pop()
    }
    return collision
  }

  clean_particle(threshold) {
    // if threshold increases, likelihood of deleting particle higher since math.random generates with equal prob
    console.log(threshold);
    if (this.num_particles > 0) {
      if (Math.random() < threshold) {
        this.num_particles--; // erase a particle
        if (!this.scrub_sound.isPlaying()) {
          this.scrub_sound.play();
        }
      }
      if (this.num_particles == 0) {
        this.scrub_sound.stop();
      }
    }
  }
}