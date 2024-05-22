/**
 * Defines a polluted area containing particles for player to scrub away
 */
class Pollution {
  /**
   * 
   * @param {x-coordinate} x 
   * @param {y-coordinate} y 
   * @param {polluted area diameter} d 
   */
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    // random num of particles within radius
    this.num_particles = int(random(5, 15));
    this.particles = [];
    print(this.num_particles);
    colorMode(HSB);
    for (let i = 0; i < this.num_particles; i++) {
      this.particles.push(new Circle(this.x - r + int(random(0, 2 * r)), this.y - r + int(random(0, 2 * r)), int(random(3, 20)), color(0,100, 100)));
    } 
  }

  draw() {
    noFill();
    strokeWeight(4);
    stroke(51);
    
    square(this.x, this.y, this.r * 2);
    for (let i = 0; i < this.num_particles; i++) {
      this.particles[i].draw();
    }
  }

  clean_particle(threshold) {
    // if threshold increases, likelihood of deleting particle higher since math.random generates with equal prob
    if (Math.random() < threshold) {
      this.num_particles--; // erase a particle
    }
  }
}