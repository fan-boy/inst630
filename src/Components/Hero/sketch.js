import React, { useEffect, useRef } from "react";
import p5 from 'p5';

class HeroSketch extends React.Component {
  constructor(props) {
      super(props)
      this.myRef = React.createRef()
  }

  Sketch = (p) => {
    let stars = [];
    let speed;
      // Native p5 functions work as they would normally but prefixed with 
      // a p5 object "p"
      p.setup = () => {
          //Everyhting that normally happens in setup works
          p.createCanvas(window.innerWidth,window.innerHeight);
          for (let i = 0; i < 800; i++) {
            stars[i] = new Star(p);
          }
      }

      class Star {
        constructor(p){
        this.x = p.random(-p.width, p.width);
        this.y = p.random(-p.height, p.height);
        this.z = p.random(p.width);
        this.pz = this.z;
        }
      
        update () {
          this.z = this.z - speed;
          if (this.z < 1) {
            this.z = p.width;
            this.x = p.random(-p.width, p.width);
            this.y = p.random(-p.height, p.height);
            this.pz = this.z;
          }
        };
      
        show() {
          p.fill(255);
          p.noStroke();
      
          var sx = p.map(this.x / this.z, 0, 1, 0, p.width);
          var sy = p.map(this.y / this.z, 0, 1, 0, p.height);
      
          var r = p.map(this.z, 0, p.width, 16, 0);
          p.ellipse(sx, sy, r, r);
      
          var px = p.map(this.x / this.pz, 0, 1, 0, p.width);
          var py = p.map(this.y / this.pz, 0, 1, 0, p.height);
      
          this.pz = this.z;
      
          p.stroke(255);
          p.line(px, py, sx, sy);
        };
      }
      p.draw = () => {
          speed = p.map(p.mouseX, 0, p.width, 0, 50);
          p.background(0)
          p.textSize(32);
          p.text('Move cursor across x axis',20,40)
          p.translate(p.width / 2, p.height / 2);
          for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].show();
          }
      }
  }

  componentDidMount() {
      //We create a new p5 object on component mount, feed it 
      this.myP5 = new p5(this.Sketch, this.myRef.current)
  }

  render() {
      return (
          //This div will contain our p5 sketch
          <div ref={this.myRef}>

          </div>
      )
  }
}

export default HeroSketch