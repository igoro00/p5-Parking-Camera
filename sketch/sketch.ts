// GLOBAL VARS & TYPES

//@ts-expect-error
p5.disableFriendlyErrors = true;
let steering: p5.Element;

const E = Math.E
let sketch: p5.Graphics;
let myCamera: p5.Camera;

let fps: p5.Element;
let sensorL1: p5.Element;
let sensorL2: p5.Element;
let sensorR1: p5.Element;
let sensorR2: p5.Element;

let capture: p5.Element
let captureImg: p5.Image;

let cWidth:number
let cHeight: number;

let l2 = 100;
let l1 = 100;
let r1 = 100;
let r2 = 100;

function setL2(value: number) {
  l2 = value;
}
function setL1(value: number) {
  l1 = value;
}
function setR1(value: number) {
  r1 = value;
}
function setR2(value: number) {
  r2 = value;
}


function setup() {
  //@ts-expect-error
  capture = createCapture(VIDEO, () => {
    capture.size(2048, 1536);
    cWidth = capture.width;
    cHeight = capture.height;
    createCanvas(cWidth, cHeight, WEBGL).style("position", "absolute").style("top", "0").style("left", "0");

    sketch = createGraphics(cWidth, cHeight);
    myCamera = createCamera();
    myCamera.setPosition(0, cHeight/2 + 100, 200)
    myCamera.lookAt(0, -600, 0);
    perspective(2 * PI / 3, cWidth / cHeight, 0.1, 2000);

    sketch.rectMode(CENTER).noFill();

    steering = createSlider(0, 255, 127, 1).position(100, 10).style("cWidth", "1800px");
    createP("Steering: ").position(10, 10).style("color", "white");
    sensorL2 = createSlider(0, 255, 55, 1).position(100, 30).style("cWidth", "1800px");
    createP("SensorL2: ").position(10, 30).style("color", "white");
    sensorL1 = createSlider(0, 255, 55, 1).position(100, 50).style("cWidth", "1800px");
    createP("SensorL1: ").position(10, 50).style("color", "white");
    sensorR1 = createSlider(0, 255, 55, 1).position(100, 70).style("cWidth", "1800px");
    createP("SensorR1: ").position(10, 70).style("color", "white");
    sensorR2 = createSlider(0, 255, 55, 1).position(100, 90).style("cWidth", "1800px");
    createP("SensorR2: ").position(10, 90).style("color", "white");
    
    steering.elt.addEventListener("input", ()=>redraw());
    sensorL2.elt.addEventListener("input", ()=>redraw());
    sensorL1.elt.addEventListener("input", ()=>redraw());
    sensorR1.elt.addEventListener("input", ()=>redraw());
    sensorR2.elt.addEventListener("input", ()=>redraw());

    fps = createP("FPS: ").position(10, 110);
    fps.style("color", "white");
    fps.style("display", "block");
    fps.style("white-space", "pre");
    fps.style("font-family", "monospace");
    noLoop();
    // redraw();
  })
}

function straight(origin: p5.Vector, length: number, angle: number, draw = true) {
  const x = origin.x + length * cos(angle);
  const y = origin.y + length * sin(angle);
  draw && sketch.line(origin.x, origin.y, x, y);
  return createVector(x, y);
}
function draw() {
  if(steering === undefined) return;
  const startMilis = window.performance.now()
  // orbitControl();
  clear();
  // background("white")
  
  setL1(<number>sensorL1.value())
  setL2(<number>sensorL2.value())
  setR1(<number>sensorR1.value())
  setR2(<number>sensorR2.value())
  
  const steeringValue = <number>steering.value();
  console.log(steeringValue)
  
  let angle = map(steeringValue, 0, 255, PI / 2, -PI / 2);
  
  sketch.clear()
  // sketch.background(255) //debug plane
  sketch.push()
  sketch.stroke("red");
  sketch.strokeCap(SQUARE)
  sketch.strokeWeight(4)
  sketch.translate(cWidth / 2, cHeight - 10);
  sketch.scale(1, -1)

  const sign = angle > 0 ? 1 : -1;
  const length = 300;
  const vertical = 400;
  const horizontalShiftMultiplier = 0.6;

  const start1 = createVector(-length / 2, 0);
  straight(start1, length, 0);

  sketch.stroke("#00aa00");
  sketch.strokeWeight(8);
  const line: p5.Vector[] = [];

  let myColor = sketch.color(0, 170, 0, 255)
  for (let i = 1; i < vertical; i++) {
    const percent = i / vertical;
    const start = createVector(-length / 2 * sign - angle * percent * i * horizontalShiftMultiplier, i);
    myColor.setAlpha(255 * (1 - percent));
    sketch.stroke(myColor)
    sketch.point(start.x, start.y);
    const end = straight(start, length * sign, angle * percent, i==vertical-1);
    sketch.point(end.x, end.y);
    line.push(end);
  }
  sketch.pop();
  image(sketch, -cWidth/2, -cHeight/2);
  fps.html(
    `FPS: ${Math.floor(frameRate())}
Frame time[ms]: ${(window.performance.now() - startMilis).toFixed(4)}`
  );
    translate(0, 475, 0)

  const green = color(70, 255, 70)
  const yellow = color(255, 255, 70)
  const red = color(255, 70, 70)

  //3d stuff
  // L2
  if (l2 < 100) {
    glassWall(red, createVector(-250, 250, 0), createVector(0, 0, -PI / 12));
  } else if (l2 < 150) {
    glassWall(yellow, createVector(-300, 150, 0), createVector(0, 0, -PI / 12));
  } else if (l2 < 200){
    glassWall(green, createVector(-300, 50, 0), createVector(0, 0, -PI / 12));
  }

  // L1
  if (l1 < 100) {
    glassWall(red, createVector(-100, 225, 0), createVector(0, 0, -PI / 64));
  } else if (l1 < 150) {
    glassWall(yellow, createVector(-100, 120, 0), createVector(0, 0, -PI / 128));
  } else if (l1 < 200){
    glassWall(green, createVector(-100, 0, 0), createVector(0, 0, 0));
  }

  // R1
  if (r1 < 100) {
    glassWall(red, createVector(100, 225, 0), createVector(0, 0, PI / 64));
  } else if (r1 < 150) {
    glassWall(yellow, createVector(100, 120, 0), createVector(0, 0, PI / 128));
  } else if (r1 < 200){
    glassWall(green, createVector(100, 0, 0), createVector(0, 0, 0));
  }

  // R2
  if (r2 < 100) {
    glassWall(red, createVector(250, 250, 0), createVector(0, 0, PI / 12));
  } else if (r2 < 150) {
    glassWall(yellow, createVector(300, 150, 0), createVector(0, 0, PI / 12));
  } else if (r2 < 200){
    glassWall(green, createVector(300, 50, 0), createVector(0, 0, PI / 12));
  }
}

function glassWall(c: p5.Color, position: p5.Vector = createVector(0, 0, 0), rotation: p5.Vector = createVector(0, 0, 0)) {
  push();

  //@ts-expect-error
  const strokeColor = color(...c.levels);
  // strokeColor.setAlpha(175);
  stroke(strokeColor);
  

  strokeWeight(0.5);
  translate(position);
  rotateX(rotation.x);
  rotateY(rotation.y);
  rotateZ(rotation.z);

  {
    push()
    translate(0, 0, 2.5)
    noStroke()
    emissiveMaterial(c);
    drawingContext.shadowBlur = 320;
    drawingContext.shadowColor = c;
    box(100, 5, 5)
    pop();
  }
  {
    push()
    translate(0, 0, 55)
    pointLight(c, position.x*1.2, 475+position.y, -50);
    specularMaterial(50, 50, 50, 90);
    shininess(1);
    drawingContext.shadowBlur = 320;
    drawingContext.shadowColor = c;
    box(100, 5, 100);
    pop()
  }
  pop()
}