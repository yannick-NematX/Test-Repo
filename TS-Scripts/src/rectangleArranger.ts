import { Point2D, Rectangle, Vector2D, Bounds } from './types';

function generateRectangleFromBounds(bounds: Bounds): Rectangle {
  const { x, y } = bounds;

  if (x.min >= x.max || y.min >= y.max) {
    throw new Error(
      'Invalid boundaries: Ensure x.min < x.max and y.min < y.max.',
    );
  }

  const w = x.max - x.min; // Calculate width
  const h = y.max - y.min; // Calculate height

  return {
    x: x.min, // X-coordinate of the top-left corner (same as x.min)
    y: y.min, // Y-coordinate of the top-left corner (same as y.max)
    w,
    h,
  };
}

function offsetRectangle(rect: Rectangle, offset: Vector2D): Rectangle {
  return {
    x: rect.x + offset.x,
    y: rect.y + offset.y,
    w: rect.w,
    h: rect.h,
  };
}

function getRectangleBounds(rect: Rectangle): Bounds {
  return {
    x: { min: rect.x, max: rect.x + rect.w },
    y: { min: rect.y, max: rect.y + rect.h },
  };
}

function getRectangleCenter(rect: Rectangle): Point2D {
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
  };
}

function calculateVectorToMoveRectangleWithinBounds(
  rect: Rectangle,
  targetPoint: Point2D,
  bounds: Bounds,
): Vector2D {
  const dx = targetPoint.x - (rect.x + rect.w / 2);
  const dy = targetPoint.y - (rect.y + rect.h / 2);

  const x = Math.max(
    bounds.x.min - rect.x,
    Math.min(bounds.x.max - (rect.x + rect.w), dx),
  );
  const y = Math.max(
    bounds.y.min - rect.y,
    Math.min(bounds.y.max - (rect.y+rect.h), dy),
  );

  return { x, y };
}




// Enums for Directions
export enum DirectionX {
  LeftToRight = 'left-to-right',
  RightToLeft = 'right-to-left',
}

export enum DirectionY {
  TopToBottom = 'top-to-bottom',
  BottomToTop = 'bottom-to-top',
}

export type Center = {
  x: number;
  y: number;
};

export type Centers = Center[];

type HeadDimension = {
  minX: number; // Horizontal spacing before a rectangle
  maxX: number; // Horizontal spacing after a rectangle
  minY: number; // Vertical spacing before a rectangle
  maxY: number; // Vertical spacing after a rectangle
  rangeHeight: number; // Spacing in between rows
};

export type LayoutConfig = {
  centerRectangle: Rectangle;
  boundingRectangle: Rectangle;
  directionX: DirectionX; // Horizontal direction (enum)
  directionY: DirectionY; // Vertical direction (enum)
  headDimension: HeadDimension; // Spacing and offsets for both axes
};

export class RectangleArranger {
  private centerRectangle: Rectangle;
  private boundingRectangle: Rectangle;
  private directionX: DirectionX;
  private directionY: DirectionY;
  private head: HeadDimension;

  constructor(config: LayoutConfig) {
    this.centerRectangle = config.centerRectangle;
    this.boundingRectangle = config.boundingRectangle;
    this.directionX = config.directionX;
    this.directionY = config.directionY;
    this.head = config.headDimension;
  }

  arrangeAndCenterRectangles(
    n: number,
    width: number,
    height: number,
  ): Rectangle[] {
    let rectangles: Rectangle[] = [];
    //Step 1: arrange rectangles
    rectangles = this.arrangeEqualRectangles(n, width, height);

    //Step 2: shift rectangles to center of container
    rectangles = this.shiftRectanglesToCenter(
      rectangles,
      this.centerRectangle.w,
      this.centerRectangle.h,
    );

    return rectangles;
  }

  arrangeAndCenterRectanglesWithinBounds(
    n: number,
    width: number,
    height: number,
  ): Rectangle[] {
    let rectangles: Rectangle[] = [];
    //Step 1: arrange rectangles
    rectangles = this.arrangeEqualRectangles(n, width, height);

    //Step 2: shift rectangles towards center of container within bounds

    rectangles = this.shiftRectanglesTowardsCenterWithinBounds(
      rectangles,
      this.centerRectangle,
      this.boundingRectangle,
    );

    return rectangles;
  }
  arrangeEqualRectangles(
    n: number,
    width: number,
    height: number,
  ): Rectangle[] {
    const rows = Math.floor(Math.sqrt(n));
    const columns = Math.ceil(n / rows);
    const dX = this.getDX();
    const dY = this.getDY();
    const w = width;
    const h = height;

    const { totalWidth, totalHeight } = this.calculateTotalDimensions(
      n,
      width,
      height,
    );

    if (
      totalWidth > this.boundingRectangle.w ||
      totalHeight > this.boundingRectangle.h
    ) {
      throw new Error('Rectangles do not fit in the bounding rectangle');
    }

    const rectangles: Rectangle[] = [];
    let rectCount = 0;

    const startX = this.getStartX(totalWidth, width);
    const startY = this.getStartY(totalHeight, height);

    console.log(`Start Coordinates: (${startX},${startY})`);
    let rowHeight = 0;

    // Loop to place rectangles in the container
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (rectCount >= n) break;

        // Place rectangle based on current position and direction
        const x = this.getXPos(startX, col, width, dX);
        const y = this.getYPos(startY, row, height, dY);

        rectangles.push({ x, y, w, h });
        rectCount++;

        // Update max height for the row if needed
        rowHeight = Math.max(rowHeight, height);
      }

      // Move to the next row
    }

    return rectangles;
  }

  calculateGridCenter(rectangles: Rectangle[]): Point2D {
    if (!rectangles || rectangles.length === 0) {
      throw new Error('The list of rectangles is empty');
    }

    // Initialize bounds for the grid
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    // Iterate through rectangles to calculate the bounds
    rectangles.forEach((rect) => {
      const topLeftX = rect.x;
      const topLeftY = rect.y + rect.h;
      const bottomRightX = rect.x + rect.w;
      const bottomRightY = rect.y;

      // Update bounds
      minX = Math.min(minX, topLeftX);
      maxX = Math.max(maxX, bottomRightX);
      minY = Math.min(minY, bottomRightY);
      maxY = Math.max(maxY, topLeftY);
    });

    // Calculate the center of the grid
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return { x: centerX, y: centerY };
  }

  calculateGridBounds(rectangles: Rectangle[]) {
    if (!rectangles || rectangles.length === 0) {
      throw new Error('The list of rectangles is empty');
    }

    // Initialize bounds for the grid
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    // Iterate through rectangles to calculate the bounds
    rectangles.forEach((rect) => {
      const topLeftX = rect.x;
      const topLeftY = rect.y + rect.h;
      const bottomRightX = rect.x + rect.w;
      const bottomRightY = rect.y;

      // Update bounds
      minX = Math.min(minX, topLeftX);
      maxX = Math.max(maxX, bottomRightX);
      minY = Math.min(minY, bottomRightY);
      maxY = Math.max(maxY, topLeftY);
    });

    return {
      x: { min: minX, max: maxX },
      y: { min: minY, max: maxY },
    };
  }

  shiftRectanglesToCenter(
    rectangles: Rectangle[],
    width: number,
    height: number,
  ) {
    if (!rectangles || rectangles.length === 0) {
      throw new Error('The list of rectangles is empty');
    }

    // Step 1: Calculate the current center of the grid
    const gridCenter = this.calculateGridCenter(rectangles);

    // Step 2: Calculate the center of the target rectangle
    const targetCenterX = width / 2;
    const targetCenterY = height / 2;

    // Step 3: Calculate the offset needed to shift the grid center to the target center
    const offsetX = targetCenterX - gridCenter.x;
    const offsetY = targetCenterY - gridCenter.y;

    // Step 4: Apply the offset to each rectangle
    const shiftedRectangles = rectangles.map((rect) => ({
      x: rect.x + offsetX,
      y: rect.y + offsetY,
      w: rect.w,
      h: rect.h,
    }));

    return shiftedRectangles;
  }

  shiftRectanglesTowardsCenterWithinBounds(
    rectangles: Rectangle[], //list of rectangles to be shifted
    centerRectangle: Rectangle, //rectangle in which the rectangles should be centered
    boundingRectangle: Rectangle, //rectangle in which the rectangles should be contained
  ) {
    if (!rectangles || rectangles.length === 0) {
      throw new Error('The list of rectangles is empty');
    }

    // Step 1: Calculate the current bounds and bounding rectangle of the grids
    const gridRectangle = generateRectangleFromBounds(
      this.calculateGridBounds(rectangles),
    );
    // Step 2: Calculate the center of the target rectangle
    const targetCenter = getRectangleCenter(centerRectangle);
    const bounds = getRectangleBounds(boundingRectangle);

    //Step 2.2 calculate shift vector
    const vector = calculateVectorToMoveRectangleWithinBounds(
      gridRectangle,
      targetCenter,
      bounds,
    );

    // Step 4: Apply the offset to each rectangle
    const shiftedRectangles = rectangles.map((rect) => ({
      x: rect.x + vector.x,
      y: rect.y + vector.y,
      w: rect.w,
      h: rect.h,
    }));

    return shiftedRectangles;
  }

  getCentersOfRectangles(rectangles: Rectangle[]): Centers {
    if (rectangles.length === 0) {
      throw new Error('The list of rectangles is empty.');
    }

    return rectangles.map((rect) => {
      const x = rect.x + rect.w / 2; // Calculate center x-coordinate
      const y = rect.y - rect.h / 2; // Calculate center y-coordinate
      return { x, y };
    });
  }

  private getStartX(packWidth: number, rectWidth: number): number {
    if (this.directionX === DirectionX.RightToLeft) {
      return packWidth - rectWidth; // Start from the right if right-to-left
    }
    return 0; // Start from the left if left-to-right
  }

  private getStartY(packHeight: number, rectHeight: number): number {
    if (this.directionY === DirectionY.BottomToTop) {
      return 0; // Start from the bottom if bottom-to-top
    }
    return packHeight - rectHeight; // Start from the top if top-to-bottom
  }

  private getXPos(
    currentXPos: number,
    currentCol: number,
    width: number,
    dX: number,
  ) {
    if (this.directionX === DirectionX.LeftToRight) {
      return currentXPos + currentCol * (width + dX);
    } else {
      return currentXPos - currentCol * (width + dX);
    }
  }

  private getYPos(
    currentYPos: number,
    currentRow: number,
    height: number,
    dY: number,
  ) {
    if (this.directionY === DirectionY.BottomToTop) {
      return currentYPos + currentRow * (height + dY);
    } else {
      return currentYPos - currentRow * (height + dY);
    }
  }

  // Private method to get the horizontal spacing based on directionX
  private getDX(): number {
    return this.directionX === DirectionX.LeftToRight
      ? this.head.minX
      : this.head.maxX;
  }

  // Private method to get the vertical spacing based on directionY
  private getDY(): number {
    return this.directionY === DirectionY.BottomToTop
      ? this.head.minY
      : this.head.maxY;
  }

  calculateTotalDimensions(
    n: number,
    width: number,
    height: number,
  ): { totalWidth: number; totalHeight: number } {
    const rows = Math.floor(Math.sqrt(n)); // Approximate square grid
    const columns = Math.ceil(n / rows);

    const dX = this.getDX();
    const dY = this.getDY();

    const totalWidth = columns * width + (columns - 1) * dX;
    const totalHeight = rows * height + (rows - 1) * dY;

    return { totalWidth, totalHeight };
  }
}




