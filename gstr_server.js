const WebSocket = require('ws');
const { spawn } = require('child_process');
const colors = require('ansi-colors');
const fs = require('fs');

// touch a file so that the browser refreshes
setInterval(() => {
// fs.closeSync(fs.openSync('./test.txt', 'w'));
}, 2000);

const wss = new WebSocket.Server({ port: 8080 });
const gstreamerProcess = spawn('gst-launch-1.0', [ '-v',
  // V4L2 camera source
  // 'v4l2src', 'device=/dev/video2',
  // '!', 'videoconvert',
  // '!', 'video/x-raw,format=I420',
  // '!', 'comp.sink_0',

  'videotestsrc',
  '!', 'videoconvert',
  '!', 'video/x-raw,framerate=30/1,width=1024,height=768',
  '!', 'comp.sink_0',
  
  // Canvas main stream
  'fdsrc', 'fd=3', 
  '!', 'matroskademux', 
  '!', 'vp8dec',
  '!', 'acomb.sink',
  
  // Transparency stream
  'fdsrc', 'fd=4',
  '!', 'matroskademux', 
  '!', 'vp8dec',
  '!', 'acomb.alpha',

  'alphacombine', 'name=acomb',
  '!', 'video/x-raw,format=A420', 
  '!', 'comp.sink_1',
  
  // Compositor with explicit positioning
  'compositor', 'name=comp', 
    'sink_0::xpos=0', 'sink_0::ypos=0', 'sink_0::zorder=0', 
    'sink_1::xpos=0', 'sink_1::ypos=0', 'sink_1::zorder=1',
  '!', 'autovideosink'
], { stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe', 'pipe'] });
const mainStream = gstreamerProcess.stdio[3];
const alphaStream = gstreamerProcess.stdio[4];
// Handle GStreamer process errors
gstreamerProcess.stderr.on('data', (data) => {
  console.error(colors.red(data.toString()));
});
gstreamerProcess.stdout.on('data', (data) => {
  console.log(colors.gray(data.toString()));
});
gstreamerProcess.on('exit', (code, signal) => {
  console.log(colors.red(`GStreamer process exited with code ${code} and signal ${signal}`));
  process.exit(1);
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    //check if the first byte is "m" or "a" and then send the rest of the message to the appropriate stream
    if (message[0] === 109) {
      //send slice of message from index 1 to the end
      mainStream.write(Buffer.from(message.slice(1)));
    } else {
      alphaStream.write(Buffer.from(message.slice(1)));
    }
  });
});