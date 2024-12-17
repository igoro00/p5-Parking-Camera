import p5 from "p5";
import { Overlay } from "./src/overlay";


const WIDTH = 1024;
const HEIGHT = 768;

let mainCanvas: HTMLCanvasElement;
const alphaCanvas = document.getElementById("alphaCanvas") as HTMLCanvasElement;

function onRunning() {
	// Create streams
	const mainStream = mainCanvas.captureStream(30);
	const alphaStream = alphaCanvas.captureStream(30);

	// Create MediaRecorders
	const mainRecorder = new MediaRecorder(mainStream, { 
		mimeType: 'video/webm; codecs=vp8' 
	});

	const alphaRecorder = new MediaRecorder(alphaStream, { 
		mimeType: 'video/webm; codecs=vp8' 
	});

	// WebSocket setup
	const ws = new WebSocket('ws://localhost:8080');

	ws.onopen = () => {
		// Start recording both streams
		mainRecorder.start(50); 
		alphaRecorder.start(50);
	};

	// Handle main stream chunks
	mainRecorder.ondataavailable = (event) => {
		if (event.data.size > 0) {
			event.data.arrayBuffer().then((buffer) => {

				// send "m" and then the buffer
				const data = new Uint8Array(buffer);
				const dataToSend = new Uint8Array(data.length + 1);
				dataToSend.set([109], 0);
				dataToSend.set(data, 1);
				ws.send(dataToSend);
			});
		};
	}

	// Handle alpha stream chunks
	alphaRecorder.ondataavailable = (event) => {
		if (event.data.size > 0) {
			event.data.arrayBuffer().then((buffer) => {
				console.log("sent alpha")
				// send "a" and then the buffer
				const data = new Uint8Array(buffer);
				const dataToSend = new Uint8Array(data.length + 1);
				dataToSend.set([97], 0);
				dataToSend.set(data, 1);
				ws.send(dataToSend);
			});
		}
	}

}

const sketch = (p: p5) => {
	let overlay:Overlay;
	p.setup = ()=>{
		overlay = new Overlay(p, WIDTH, HEIGHT, alphaCanvas);
		mainCanvas = overlay.canvas.elt as HTMLCanvasElement;
		onRunning();
	};
	p.draw = ()=>{
		overlay?.render();
	};
}

new p5(sketch);