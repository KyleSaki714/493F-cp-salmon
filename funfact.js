class FunFact extends Shape {

    static fact;
   
    constructor(x, y, width, height, factText) {
        super(x, y, width, height);
        this.facts = [];
        this.fact = factText;
        //this.box = new rect(x, y, width);
        //push();
        // for (let i = 0; i < 4; i++) {
        //     this.facts.push()
        // }
    }

    draw() {
        //this.box.draw();
        fill('red');
        rect(this.xpos, this.ypos, this.width+20, this.height+20, 20);
    
        fill('white');
        rect(this.xpos, this.ypos, this.width, this. height, 20);
        fill('black');
        textStyle(BOLD);
        textSize(10);
        text(this.fact, this.xpos, this.ypos+10, this.width-30, this.height);
    }

    scrollX(val) {
        this.xpos += val;
    }
}