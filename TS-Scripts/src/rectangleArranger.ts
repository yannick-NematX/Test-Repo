import { Rectangle } from "./types";

// Enums for Directions
export enum DirectionX {
  LeftToRight = "left-to-right",
  RightToLeft = "right-to-left",
}

export enum DirectionY {
  TopToBottom = "top-to-bottom",
  BottomToTop = "bottom-to-top",
}

type HeadDimension = { 
  minX: number;  // Horizontal spacing before a rectangle
  maxX: number;  // Horizontal spacing after a rectangle
  minY: number;  // Vertical spacing before a rectangle
  maxY: number;  // Vertical spacing after a rectangle
  rangeHeight: number; // Spacing in between rows
};

export type LayoutConfig = {
  containerWidth: number;
  containerHeight: number;
  directionX: DirectionX;  // Horizontal direction (enum)
  directionY: DirectionY;  // Vertical direction (enum)
  headDimension: HeadDimension; // Spacing and offsets for both axes
};

export class RectangleArranger {
  private containerWidth: number;
  private containerHeight: number;
  private directionX: DirectionX;
  private directionY: DirectionY;
  private head: HeadDimension;

  constructor(config: LayoutConfig) {
    this.containerWidth = config.containerWidth;
    this.containerHeight = config.containerHeight;
    this.directionX = config.directionX;
    this.directionY = config.directionY;
    this.head = config.headDimension;
  }

  arrangeEqualRectangles(n: number, width: number, height: number): Rectangle[] {
    const rows = Math.floor(Math.sqrt(n));
    const columns = Math.ceil(n / rows);
    const dX = this.getDX();
    const dY = this.getDY();
    const w = width;
    const h = height;

    const { totalWidth, totalHeight } = this.calculateTotalDimensions(n, width, height);

    if (totalWidth > this.containerWidth || totalHeight > this.containerHeight) {
      console.error('Rectangles do not fit in the container');
    }

    const rectangles: Rectangle[] = [];
    let rectCount = 0;

    let currentX = this.getStartX(totalWidth);
    let currentY = this.getStartY(totalHeight);
    let rowHeight = 0;

    // Loop to place rectangles in the container
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (rectCount >= n) break;

        // Place rectangle based on current position and direction
        const x = currentX + col * (width + dX);
        const y = currentY + row * (height + dY);

        rectangles.push({ x, y, w, h });
        rectCount++;

        // Update max height for the row if needed
        rowHeight = Math.max(rowHeight, height);
      }

      // Move to the next row
      currentY = this.nextRowY(currentY, rowHeight);
      currentX = this.getStartX(totalWidth); // Reset to the starting X position for the next row
    }

    return rectangles;
  }

  private getStartX(width: number): number {
    if (this.directionX === DirectionX.RightToLeft) {
      return width;  // Start from the right if right-to-left
    }
    return 0;  // Start from the left if left-to-right
  }

  private getStartY(height: number): number {
    if (this.directionY === DirectionY.BottomToTop) {
      return 0;  // Start from the bottom if bottom-to-top
    }
    return height;  // Start from the top if top-to-bottom
  }

  private nextRowY(currentY: number, rowHeight: number): number {
    if (this.directionY === DirectionY.BottomToTop) {
      return currentY + rowHeight;
    }
    return currentY - rowHeight;
  }

  // Private method to get the horizontal spacing based on directionX
  private getDX(): number {
    return this.directionX === DirectionX.LeftToRight ? this.head.minX : this.head.maxX;
  }

  // Private method to get the vertical spacing based on directionY
  private getDY(): number {
    return this.directionY === DirectionY.BottomToTop ? this.head.minY : this.head.maxY;
  }

  calculateTotalDimensions(n: number, width: number, height: number): { totalWidth: number; totalHeight: number } {
    const rows = Math.floor(Math.sqrt(n)); // Approximate square grid
    const columns = Math.ceil(n / rows);

    const dX = this.getDX();
    const dY = this.getDY();

    const totalWidth = columns * width + (columns - 1) * dX;
    const totalHeight = rows * height + (rows - 1) * dY;

    return { totalWidth, totalHeight };
  }
}