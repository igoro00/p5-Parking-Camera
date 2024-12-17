type SliderValues = [number, number, number, number, number];

export class SliderClient {
  private websocket: WebSocket;
  private onUpdate: (values: SliderValues) => void;

  constructor(serverUrl: string, onUpdate: (values: SliderValues) => void) {
    // Initialize WebSocket connection
    this.websocket = new WebSocket(serverUrl);
	this.onUpdate = onUpdate;

    // Setup WebSocket event listeners
    this.websocket.addEventListener("open", this.handleOpen.bind(this));
    this.websocket.addEventListener("message", this.handleMessage.bind(this));
    this.websocket.addEventListener("close", this.handleClose.bind(this));
    this.websocket.addEventListener("error", this.handleError.bind(this));
  }

  // Handle WebSocket connection opening
  private handleOpen(): void {
    console.log("Connected to WebSocket server.");
  }

  // Handle incoming WebSocket messages
  private handleMessage(event: MessageEvent): void {
	console.log(event.data);
    try {
      const data: SliderValues = JSON.parse(event.data);
      this.onUpdate(data);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", event.data);
    }
  }

  // Handle WebSocket disconnection
  private handleClose(): void {
    console.log("Disconnected from WebSocket server.");
  }

  // Handle WebSocket errors
  private handleError(event: Event): void {
    console.error("WebSocket error occurred:", event);
  }
}