import { SliderClient } from "./sliderClient";
console.log("Hello from frontend!");
p5.disableFriendlyErrors = true;
let sketch: p5.Graphics;
let myCamera: p5.Camera;

let fps: p5.Element;

let cWidth:number
let cHeight: number;
let sliderClient: SliderClient;

let steering = 127;
let l2 = 100;
let l1 = 100;
let r1 = 100;
let r2 = 100;


function setSteering(value: number) {
  steering = value;
}
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

let stream: MediaStream;

function setup() {
    cWidth = 1024;
    cHeight = 768;
    const canvas = createCanvas(cWidth, cHeight, WEBGL).style("position", "absolute").style("top", "0").style("left", "0");

    const canvasElement = canvas.elt as HTMLCanvasElement;
    canvasElement.getContext('webgl', { alpha: true });
    stream = canvasElement.captureStream(30); // 30 fps
  
    const ws = new WebSocket('ws://localhost:8080');
  
    ws.onopen = () => {  
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'video/webm; codecs=vp8' 
      });
      console.log(mediaRecorder)
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Convert blob to buffer and send
          event.data.arrayBuffer().then(buffer => {
            ws.send(new Uint8Array(buffer));
          });
        }
      };
  
      // Start recording
      mediaRecorder.start(100); // Collect data in 100ms chunks
    };

    sketch = createGraphics(cWidth, cHeight);
    myCamera = createCamera();
    myCamera.setPosition(0, cHeight/2 + 100, 200)
    myCamera.lookAt(0, -600, 0);
    perspective(2 * PI / 3, cWidth / cHeight, 0.1, 2000);

    sketch.rectMode(CENTER).noFill();

    fps = createP("FPS: ").position(10, 110);
    fps.style("color", "white");
    fps.style("display", "block");
    fps.style("white-space", "pre");
    fps.style("font-family", "monospace");
    
    sliderClient = new SliderClient("http://localhost:3000", ([s1, s2, s3, s4, s5]) => {
      setSteering(s1);
      setL2(s2);
      setL1(s3);
      setR1(s4);
      setR2(s5);
      console.log("Received slider values:", s1, s2, s3, s4, s5);
    });
    // setInterval(() => {redraw()}, 1000/30)
    frameRate(30);
    // loop();

}

 function straight(origin: p5.Vector, length: number, angle: number, draw = true) {
  const x = origin.x + length * cos(angle);
  const y = origin.y + length * sin(angle);
  draw && sketch.line(origin.x, origin.y, x, y);
  return createVector(x, y);
}
function draw() {
  if (steering==undefined) return;
  if (l2==undefined) return;
  if (l1==undefined) return;
  if (r1==undefined) return;
  if (r2==undefined) return;
  console.log("Drawing");
  const startMilis = window.performance.now()
  // orbitControl();
  clear();
  
  let angle = map(steering, 0, 255, PI / 2, -PI / 2);
  
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
    translate(0, 120, 0)

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

  // window.electron.triggerRender();
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

// so it doesnt get stripped by bun
console.log(typeof draw === "function");
console.log(typeof setup === "function");