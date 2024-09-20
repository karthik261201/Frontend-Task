import { Component } from '@angular/core';

@Component({
  selector: 'app-screen1',
  templateUrl: './screen1.component.html',
  styleUrls: ['./screen1.component.scss']
})
export class Screen1Component {
  uploadedImages: string[] = []; // Array to hold multiple images
  dragging: number | null = null; // Index of the currently dragged image
  zooming: number | null = null;  // Index of the currently zoomed image
  rotating: number | null = null; // Index of the currently rotated image
  positions: { x: number, y: number }[] = []; // Store the position of each image
  sizes: { width: number, height: number }[] = []; // Store sizes of each image
  scales: number[] = []; // Store scale factors for zooming
  rotations: number[] = []; // Store rotation angles for each image

  initialMousePos: { x: number, y: number } | null = null; // Initial mouse position during drag
  initialImagePos: { x: number, y: number } | null = null; // Initial image position during drag
  initialScale: number | null = null; // Initial scale during zoom
  initialZoomMousePos: { x: number, y: number } | null = null; // Mouse position when zoom started
  initialRotation: number | null = null; // Initial rotation angle
  clickCount = 0; // Counter for triple-click detection
  clickTimeout: any; // Timeout for triple-click detection

  constructor() {
    this.uploadedImages = [];
    this.positions = [];
    this.sizes = [];
    this.scales = [];
    this.rotations = [];
  }

  // Handle file selection and upload images
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();

        reader.onload = () => {
          this.uploadedImages.push(reader.result as string);
          // Initialize positions, sizes, scales, and rotations for each image
          this.positions.push({ x: 0, y: 0 });
          this.sizes.push({ width: 150, height: 150 });
          this.scales.push(1); // Start with scale 1 (normal size)
          this.rotations.push(0); // Start with no rotation
        };

        reader.readAsDataURL(file);
      });
    }
  }

  // Start dragging the image
  onDragStart(event: MouseEvent, index: number): void {
    this.dragging = index;
    this.initialMousePos = { x: event.clientX, y: event.clientY };
    this.initialImagePos = { x: this.positions[index].x, y: this.positions[index].y };
    event.preventDefault();
  }

  // Handle dragging the image
  onDragging(event: MouseEvent, index: number): void {
    if (this.dragging === index && this.initialMousePos && this.initialImagePos) {
      const dx = event.clientX - this.initialMousePos.x;
      const dy = event.clientY - this.initialMousePos.y;
      this.positions[index] = {
        x: this.initialImagePos.x + dx,
        y: this.initialImagePos.y + dy
      };
    }

    // Handle zooming if zooming mode is active
    if (this.zooming === index && this.initialZoomMousePos && this.initialScale !== null) {
      const dy = event.clientY - this.initialZoomMousePos.y;
      const zoomFactor = 1 + dy / 100; // Adjust the division for zoom sensitivity
      this.scales[index] = this.initialScale * zoomFactor;
    }

    // Handle rotating if rotating mode is active
    if (this.rotating === index && this.initialMousePos) {
      const centerX = this.positions[index].x + (this.sizes[index].width / 2);
      const centerY = this.positions[index].y + (this.sizes[index].height / 2);
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const degrees = (angle * 180) / Math.PI;
      this.rotations[index] = degrees;
    }
  }

  // Stop dragging, zooming, and rotating
  onDragEnd(): void {
    this.dragging = null;
    this.zooming = null;
    this.rotating = null; // Stop rotating when mouse is released
    this.initialMousePos = null;
    this.initialImagePos = null;
    this.initialZoomMousePos = null;
    this.initialScale = null;
    this.initialRotation = null;
  }

  // Handle double click to start zooming mode
  onZoomStart(event: MouseEvent, index: number): void {
    this.zooming = index;
    this.initialZoomMousePos = { x: event.clientX, y: event.clientY };
    this.initialScale = this.scales[index];
    event.preventDefault();
  }

  // Detect triple-click for rotation
  onTripleClick(event: MouseEvent, index: number): void {
    this.clickCount++;
    clearTimeout(this.clickTimeout);

    if (this.clickCount === 3) {
      this.clickCount = 0; // Reset click count
      this.rotating = index; // Enter rotate mode
      this.initialMousePos = { x: event.clientX, y: event.clientY };
      this.initialRotation = this.rotations[index];
      event.preventDefault();
    } else {
      // Reset the click count after 300ms if no triple click
      this.clickTimeout = setTimeout(() => {
        this.clickCount = 0;
      }, 300);
    }
  }
}
