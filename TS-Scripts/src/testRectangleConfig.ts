export interface Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
  }

// Main class for rectangle arrangement
export class RectangleConfiguration { 
    outer: Rectangle; // The larger, outer rectangle
    inner: Rectangle; // The smaller, inner rectangle
    dxMin: number;    // Minimum horizontal spacing between inner rectangles
    dyMin: number;    // Minimum vertical spacing between inner rectangles
  
    // Constructor to initialize configuration
    constructor(
      outer: Rectangle,
      inner: Rectangle,
      dxMin: number,
      dyMin: number,
    ) {
      this.outer = outer;
      this.inner = inner;
      this.dxMin = dxMin;
      this.dyMin = dyMin;
    }
  
    // Public method to calculate and return optimal rectangle configuration
    getOptimalConfig(): Rectangle[] {
      // Check for invalid dimensions
      if (
        this.outer.w <= 0 || // Outer rectangle must have a positive width
        this.outer.h <= 0 || // Outer rectangle must have a positive height
        this.inner.w <= 0 || // Inner rectangle must have a positive width
        this.inner.h <= 0    // Inner rectangle must have a positive height
      ) {
        console.log('Dimensions must be positive numbers.');
        throw new Error('Dimensions must be positive numbers.');
      }
  
      // Call the private method to calculate the configuration
      return this._getOptimalConfig();
    }
  
    // Private helper method to calculate the arrangement
    private _getOptimalConfig() {
      const ow = this.outer.w; // Outer rectangle width
      const oh = this.outer.h; // Outer rectangle height
      const iw = this.inner.w; // Inner rectangle width
      const ih = this.inner.h; // Inner rectangle height
      const recArray = []; // Array to store the positioned inner rectangles
  
      // Edge case: Check if the inner rectangle can fit at least once
      if (iw > ow || ih > oh) {
        return []; // If the inner rectangle is larger than the outer, return an empty array
      }
      // Initialize position variables
      let posX = ow - iw / 2; // Start placing from the rightmost position$
      let posY = ih / 2; // Start placing from the bottommost position
      // Loop to place rectangles row by row
      while (posY + ih <= oh) {
        // Continue until there's no more vertical space
        while (posX - iw / 2 >= 0) {
          // Continue until there's no more horizontal space
          // Add the current rectangle to the array
          const rec = { x: posX, y: posY, w: iw, h: ih };
          recArray.push(rec);
          // Move to the next position horizontally
          posX -= iw + this.dxMin;
        }
        // Reset horizontal position and move down a row
        posX = ow - iw / 2;
        posY += ih + this.dyMin;
      }
      return recArray; // Return the array of arranged rectangles
    }
    getOptimalRectangleCount(): number {
        return this.getOptimalConfig().length; // Simply return the count of rectangles
      }
  }
