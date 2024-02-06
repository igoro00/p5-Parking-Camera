p5.disableFriendlyErrors = true;
var steering;
var E = Math.E;
var sketch;
var myCamera;
var fps;
var sensorL1;
var sensorL2;
var sensorR1;
var sensorR2;
var capture;
var captureImg;
var cWidth;
var cHeight;
var l2 = 100;
var l1 = 100;
var r1 = 100;
var r2 = 100;
function setL2(value) {
    l2 = value;
}
function setL1(value) {
    l1 = value;
}
function setR1(value) {
    r1 = value;
}
function setR2(value) {
    r2 = value;
}
function setup() {
    capture = createCapture(VIDEO, function () {
        capture.size(2048, 1536);
        cWidth = capture.width;
        cHeight = capture.height;
        createCanvas(cWidth, cHeight, WEBGL).style("position", "absolute").style("top", "0").style("left", "0");
        sketch = createGraphics(cWidth, cHeight);
        myCamera = createCamera();
        myCamera.setPosition(0, cHeight / 2 + 100, 200);
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
        steering.elt.addEventListener("input", function () { return redraw(); });
        sensorL2.elt.addEventListener("input", function () { return redraw(); });
        sensorL1.elt.addEventListener("input", function () { return redraw(); });
        sensorR1.elt.addEventListener("input", function () { return redraw(); });
        sensorR2.elt.addEventListener("input", function () { return redraw(); });
        fps = createP("FPS: ").position(10, 110);
        fps.style("color", "white");
        fps.style("display", "block");
        fps.style("white-space", "pre");
        fps.style("font-family", "monospace");
        noLoop();
    });
}
function straight(origin, length, angle, draw) {
    if (draw === void 0) { draw = true; }
    var x = origin.x + length * cos(angle);
    var y = origin.y + length * sin(angle);
    draw && sketch.line(origin.x, origin.y, x, y);
    return createVector(x, y);
}
function draw() {
    if (steering === undefined)
        return;
    var startMilis = window.performance.now();
    clear();
    setL1(sensorL1.value());
    setL2(sensorL2.value());
    setR1(sensorR1.value());
    setR2(sensorR2.value());
    var steeringValue = steering.value();
    console.log(steeringValue);
    var angle = map(steeringValue, 0, 255, PI / 2, -PI / 2);
    sketch.clear();
    sketch.push();
    sketch.stroke("red");
    sketch.strokeCap(SQUARE);
    sketch.strokeWeight(4);
    sketch.translate(cWidth / 2, cHeight - 10);
    sketch.scale(1, -1);
    var sign = angle > 0 ? 1 : -1;
    var length = 300;
    var vertical = 400;
    var horizontalShiftMultiplier = 0.6;
    var start1 = createVector(-length / 2, 0);
    straight(start1, length, 0);
    sketch.stroke("#00aa00");
    sketch.strokeWeight(8);
    var line = [];
    var myColor = sketch.color(0, 170, 0, 255);
    for (var i = 1; i < vertical; i++) {
        var percent = i / vertical;
        var start = createVector(-length / 2 * sign - angle * percent * i * horizontalShiftMultiplier, i);
        myColor.setAlpha(255 * (1 - percent));
        sketch.stroke(myColor);
        sketch.point(start.x, start.y);
        var end = straight(start, length * sign, angle * percent, i == vertical - 1);
        sketch.point(end.x, end.y);
        line.push(end);
    }
    sketch.pop();
    image(sketch, -cWidth / 2, -cHeight / 2);
    fps.html("FPS: " + Math.floor(frameRate()) + "\nFrame time[ms]: " + (window.performance.now() - startMilis).toFixed(4));
    translate(0, 475, 0);
    var green = color(70, 255, 70);
    var yellow = color(255, 255, 70);
    var red = color(255, 70, 70);
    if (l2 < 100) {
        glassWall(red, createVector(-250, 250, 0), createVector(0, 0, -PI / 12));
    }
    else if (l2 < 150) {
        glassWall(yellow, createVector(-300, 150, 0), createVector(0, 0, -PI / 12));
    }
    else if (l2 < 200) {
        glassWall(green, createVector(-300, 50, 0), createVector(0, 0, -PI / 12));
    }
    if (l1 < 100) {
        glassWall(red, createVector(-100, 225, 0), createVector(0, 0, -PI / 64));
    }
    else if (l1 < 150) {
        glassWall(yellow, createVector(-100, 120, 0), createVector(0, 0, -PI / 128));
    }
    else if (l1 < 200) {
        glassWall(green, createVector(-100, 0, 0), createVector(0, 0, 0));
    }
    if (r1 < 100) {
        glassWall(red, createVector(100, 225, 0), createVector(0, 0, PI / 64));
    }
    else if (r1 < 150) {
        glassWall(yellow, createVector(100, 120, 0), createVector(0, 0, PI / 128));
    }
    else if (r1 < 200) {
        glassWall(green, createVector(100, 0, 0), createVector(0, 0, 0));
    }
    if (r2 < 100) {
        glassWall(red, createVector(250, 250, 0), createVector(0, 0, PI / 12));
    }
    else if (r2 < 150) {
        glassWall(yellow, createVector(300, 150, 0), createVector(0, 0, PI / 12));
    }
    else if (r2 < 200) {
        glassWall(green, createVector(300, 50, 0), createVector(0, 0, PI / 12));
    }
}
function glassWall(c, position, rotation) {
    if (position === void 0) { position = createVector(0, 0, 0); }
    if (rotation === void 0) { rotation = createVector(0, 0, 0); }
    push();
    var strokeColor = color.apply(void 0, c.levels);
    stroke(strokeColor);
    strokeWeight(0.5);
    translate(position);
    rotateX(rotation.x);
    rotateY(rotation.y);
    rotateZ(rotation.z);
    {
        push();
        translate(0, 0, 2.5);
        noStroke();
        emissiveMaterial(c);
        drawingContext.shadowBlur = 320;
        drawingContext.shadowColor = c;
        box(100, 5, 5);
        pop();
    }
    {
        push();
        translate(0, 0, 55);
        pointLight(c, position.x * 1.2, 475 + position.y, -50);
        specularMaterial(50, 50, 50, 90);
        shininess(1);
        drawingContext.shadowBlur = 320;
        drawingContext.shadowColor = c;
        box(100, 5, 100);
        pop();
    }
    pop();
}
//# sourceMappingURL=build.js.map