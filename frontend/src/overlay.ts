import type p5 from "p5";

import { SliderClient } from "./sliderClient";

const { PI, cos, sin } = Math;

export class Overlay {
  private p: p5;
  private steering: number;
  private l2: number;
  private l1: number;
  private r1: number;
  private r2: number;
  private width: number;
  private height: number;

  public canvas: p5.Renderer;
  private sketch: p5.Graphics;
  private camera: p5.Camera;
  private frame = 0;

  private alphaCanvas: HTMLCanvasElement;

  constructor(p: p5, width: number, height: number, alphaCanvas: HTMLCanvasElement) {
    this.p = p;
    this.l2 = 0;
    this.l1 = 0;
    this.r1 = 0;
    this.r2 = 0;
    this.steering = 127;
    this.width = width;
    this.height = height;
    this.alphaCanvas = alphaCanvas;

    this.canvas = this.p.createCanvas(this.width, this.height, this.p.WEBGL);
    this.sketch = this.p.createGraphics(width, height);
    this.camera = this.p.createCamera();
    this.camera.setPosition(0, height / 2 + 100, 200);
    this.camera.lookAt(0, -600, 0);
    this.p.perspective((2 * PI) / 3, width / height, 0.1, 2000);

    this.sketch.rectMode(this.p.CENTER).noFill();
    this.p.frameRate(10);

    new SliderClient("http://localhost:3000", ([s1, s2, s3, s4, s5]) => {
      this.steering = s1;
      this.l1 = s2;
      this.l2 = s3;
      this.r1 = s4;
      this.r2 = s5;
      console.log("Received slider values:", s1, s2, s3, s4, s5);
    });

  }

  renderSketch() {
    const sketch = this.sketch;
    sketch.clear();
    sketch.push();
    sketch.stroke("red");
    sketch.strokeCap(this.p.SQUARE);
    sketch.strokeWeight(4);
    sketch.translate(this.width / 2, this.height - 10);
    sketch.scale(1, -1);

    let angle = this.p.map(this.steering, 0, 255, PI / 2, -PI / 2);
    const sign = angle > 0 ? 1 : -1;
    const length = 300;
    const vertical = 400;
    const horizontalShiftMultiplier = 0.6;

    const start1 = this.p.createVector(-length / 2, 0);
    this.straight(start1, length, 0);

    sketch.stroke("#00aa00");
    sketch.strokeWeight(8);
    const line: p5.Vector[] = [];

    const myColor = sketch.color(0, 170, 0, 255);
    for (let i = 1; i < vertical; i++) {
      const percent = i / vertical;
      const start = this.p.createVector(
        (-length / 2) * sign - angle * percent * i * horizontalShiftMultiplier,
        i
      );
      myColor.setAlpha(255 * (1 - percent));
      sketch.stroke(myColor);
      sketch.point(start.x, start.y);
      const end = this.straight(
        start,
        length * sign,
        angle * percent,
        i === vertical - 1
      );
      sketch.point(end.x, end.y);
      line.push(end);
    }
    sketch.pop();
  }

  glassWall(
    c: p5.Color,
    position: p5.Vector,
    rotation: p5.Vector
  ) {
    const p = this.p;
    p.push();
    
    //@ts-ignore
    const strokeColor = p.color(...c.levels);
    strokeColor.setAlpha(75);
    p.stroke(strokeColor);

    
    p.strokeWeight(0.5);
    p.translate(position);
    p.rotateX(rotation.x);
    p.rotateY(rotation.y);
    p.rotateZ(rotation.z);
    
    {
      p.push();
      p.translate(0, 0, 2.5);
      p.noStroke();
      p.emissiveMaterial(c);
      p.drawingContext.shadowBlur = 320;
      p.drawingContext.shadowColor = c;
      p.box(100, 5, 5);
      p.pop();
    }
    {
      p.push();
      p.translate(0, 0, 55);
      p.fill(150, 75);
      
      const x = position.x * 2// + this.p.mouseX - this.p.width/2
      let lightPos = p.createVector(x, 600, -100);
      p.pointLight(c, lightPos);
      p.specularMaterial(50,1);
      p.shininess(5);
      
      p.drawingContext.shadowBlur = 320;
      p.drawingContext.shadowColor = c;
      p.box(100, 5, 100);
      p.pop();
    }
    p.pop();
  }

  renderWalls() {
    const green = this.p.color(70, 255, 70);
    const yellow = this.p.color(255, 255, 70);
    const red = this.p.color(255, 70, 70);

    const { l2, l1, r1, r2, p } = this;

    //3d stuff
    // L2
    if (l2 < 100) {
      this.glassWall(
        red,
        p.createVector(-250, 250, 0),
        p.createVector(0, 0, -PI / 12)
      );
    } else if (l2 < 150) {
      this.glassWall(
        yellow,
        p.createVector(-300, 150, 0),
        p.createVector(0, 0, -PI / 12)
      );
    } else if (l2 < 200) {
      this.glassWall(
        green,
        p.createVector(-300, 50, 0),
        p.createVector(0, 0, -PI / 12)
      );
    }


    // L1
    if (l1 < 100) {
      this.glassWall(
        red,
        p.createVector(-100, 225, 0),
        p.createVector(0, 0, -PI / 64)
      );
    } else if (l1 < 150) {
      this.glassWall(
        yellow,
        p.createVector(-100, 120, 0),
        p.createVector(0, 0, -PI / 128)
      );
    } else if (l1 < 200) {
      this.glassWall(
        green,
        p.createVector(-100, 0, 0),
        p.createVector(0, 0, 0)
      );
    }


    // R1
    if (r1 < 100) {
      this.glassWall(
        red,
        p.createVector(100, 225, 0),
        p.createVector(0, 0, PI / 64)
      );
    } else if (r1 < 150) {
      this.glassWall(
        yellow,
        p.createVector(100, 120, 0),
        p.createVector(0, 0, PI / 128)
      );
    } else if (r1 < 200) {
      this.glassWall(green, p.createVector(100, 0, 0), p.createVector(0, 0, 0));
    }

    // R2
    if (r2 < 100) {
      this.glassWall(
        red,
        p.createVector(250, 250, 0),
        p.createVector(0, 0, PI / 12)
      );
    } else if (r2 < 150) {
      this.glassWall(
        yellow,
        p.createVector(300, 150, 0),
        p.createVector(0, 0, PI / 12)
      );
    } else if (r2 < 200) {
      this.glassWall(
        green,
        p.createVector(300, 50, 0),
        p.createVector(0, 0, PI / 12)
      );
    }

  }

  straight(origin: p5.Vector, length: number, angle: number, draw = true) {
    const x = origin.x + length * cos(angle);
    const y = origin.y + length * sin(angle);
    draw && this.sketch.line(origin.x, origin.y, x, y);
    return this.p.createVector(x, y);
  }

  render() {
    // console.group("Rendering");
    // console.log("start")
    this.frame++;
    this.p.clear();

    this.renderSketch();
    this.p.image(this.sketch, -this.width / 2, -this.height / 2);
    
    this.p.translate(0, 120, 0);
    this.renderWalls();

    this.copyAlpha();
    // console.log("stop")
    // console.groupEnd();
  }

  copyAlpha() {
    this.p.loadPixels();
    const alphaCtx = this.alphaCanvas.getContext("2d")!;
    const imageData = alphaCtx.createImageData(this.width, this.height);
    for (let i = 0; i < this.width*this.height*4; i += 4) {
      const alpha = this.p.pixels[i + 3];
      imageData.data[i] = alpha;
      imageData.data[i + 1] = alpha;
      imageData.data[i + 2] = alpha;
      imageData.data[i + 3] = 255;
    }

    alphaCtx.putImageData(imageData, 0, 0);
  }
}
