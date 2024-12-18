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

  arrangeAndCenterRectangles(n: number, width: number, height: number): Rectangle[] {
    let rectangles: Rectangle[] = [];
    //Step 1: arrange rectangles
    rectangles = this.arrangeEqualRectangles(n,width,height);

    //Step 2: shift rectangles to center of container
    rectangles = this.shiftRectanglesToCenter(rectangles, this.containerWidth, this.containerHeight)

    return rectangles
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

    let startX = this.getStartX(totalWidth,width);
    let startY = this.getStartY(totalHeight,height);

    console.log(`Start Coordinates: (${startX},${startY})`);
    let rowHeight = 0;

    // Loop to place rectangles in the container
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (rectCount >= n) break;

        // Place rectangle based on current position and direction
        const x = this.getXPos(startX,col,width,dX) 
        const y = this.getYPos(startY,row,height,dY)

        rectangles.push({ x, y, w, h });
        rectCount++;

        // Update max height for the row if needed
        rowHeight = Math.max(rowHeight, height);
      }

      // Move to the next row
      //currentY = this.nextRowY(currentY, rowHeight);
      //currentX = this.getStartX(totalWidth,width); // Reset to the starting X position for the next row
    }

    return rectangles;
  }

  calculateGridCenter(rectangles: Rectangle[]) {
    if (!rectangles || rectangles.length === 0) {
        throw new Error("The list of rectangles is empty");
    }

    // Initialize bounds for the grid
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    // Iterate through rectangles to calculate the bounds
    rectangles.forEach(rect => {
        const topLeftX = rect.x;
        const topLeftY = rect.y;
        const bottomRightX = rect.x + rect.w;
        const bottomRightY = rect.y - rect.h;

        // Update bounds
        minX = Math.min(minX, topLeftX);
        maxX = Math.max(maxX, bottomRightX);
        minY = Math.min(minY, bottomRightY);
        maxY = Math.max(maxY, topLeftY);
    });

    // Calculate the center of the grid
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return { centerX, centerY };
  }

  shiftRectanglesToCenter(rectangles: Rectangle[], width: number, height:number) {
    if (!rectangles || rectangles.length === 0) {
        throw new Error("The list of rectangles is empty");
    }

    // Step 1: Calculate the current center of the grid
    const gridCenter = this.calculateGridCenter(rectangles);

    // Step 2: Calculate the center of the target rectangle
    const targetCenterX = width / 2;
    const targetCenterY = height / 2;

    // Step 3: Calculate the offset needed to shift the grid center to the target center
    const offsetX = targetCenterX - gridCenter.centerX;
    const offsetY = targetCenterY - gridCenter.centerY;

    // Step 4: Apply the offset to each rectangle
    const shiftedRectangles = rectangles.map(rect => ({
        x: rect.x + offsetX,
        y: rect.y + offsetY,
        w: rect.w,
        h: rect.h
    }));

    return shiftedRectangles;
}


  private getStartX(packWidth: number,rectWidth:number): number {
    if (this.directionX === DirectionX.RightToLeft) {
      return packWidth-rectWidth;  // Start from the right if right-to-left
    }
    return 0;  // Start from the left if left-to-right
  }

  private getStartY(packHeight: number, rectHeight:number): number {
    if (this.directionY === DirectionY.BottomToTop) {
      return rectHeight;  // Start from the bottom if bottom-to-top
    }
    return packHeight;  // Start from the top if top-to-bottom
  }

  private nextRowY(currentY: number, rowHeight: number): number {
    if (this.directionY === DirectionY.BottomToTop) {
      return currentY + rowHeight;
    }
    return currentY - rowHeight;
  }

  private getXPos(currentXPos: number, currentCol:number, width: number, dX: number){
    if (this.directionX===DirectionX.LeftToRight) {
      return currentXPos + currentCol*(width + dX) 
    } else {
      return currentXPos - currentCol*(width + dX)
    }
  }

  private getYPos(currentYPos: number, currentRow:number, height: number, dY: number){
    if (this.directionY===DirectionY.BottomToTop) {
      return currentYPos + currentRow*(height + dY) 
    } else {
      return currentYPos - currentRow*(height + dY)
    }
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