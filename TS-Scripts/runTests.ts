import fs from "fs";
import path from "path";
import { Bounds, PrintersParams} from './src/types';
import { RectangleConfiguration, Rectangle } from "./src/testRectangleConfig";
import { RectangleArranger, LayoutConfig, DirectionX, DirectionY, Centers } from "./src/rectangleArranger";
import { PythonShell, Options } from 'python-shell';
import { json } from "stream/consumers";

function testPrinterParams() {
    console.log("------ Test: PrinterParams (Running) ----- ");

    // Read the JSON configuration
    const printerConfigPath = path.join(__dirname, "config", "printerConfig.json");
    const printerDict = JSON.parse(fs.readFileSync(printerConfigPath, "utf-8"));

    //console.log(printerDict);

    // Read selected extruder
    const selectedExtruder = ['extruder1',''];

    // Initialize PrinterParams with data from the JSON file
    const printerParams = new PrintersParams(printerDict);

    // Test partHeight
    const partHeight = 3; // Example part height
    const headDimension = printerParams.getHeadDimensionForHeight(partHeight, selectedExtruder[0]);
    const headSize = printerParams.getHeadWidthAndHeightForHeight(partHeight, selectedExtruder[0]);

    // Log the results
    console.log("------ Test: PrinterParams (Results) ----- ")
    if (headDimension) {
        console.log(`For part height ${partHeight}, the selected head dimension is:`);
        console.log(`minX: ${headDimension.minX}, maxX: ${headDimension.maxX}`);
        console.log(`minY: ${headDimension.minY}, maxY: ${headDimension.maxY}`);
        console.log(`Width: ${headSize?.headWidth}, Height: ${headSize?.headHeight}`);
    } else {
        console.log(`No suitable head dimension found for part height ${partHeight}.`);
    }
    console.log("------ Test: PrinterParams (Completed) ----- \n")
}

function testRectangleConfiguration() {
    console.log("------ Test: RectangleConfiguration (Running) ----- ");

    const outerRect: Rectangle = { x: 0, y: 0, w: 355, h: 180 };
    const innerRect: Rectangle = { x: 0, y: 0, w: 80, h: 40 };
    const dxMin = 10;
    const dyMin = 5;

    const config = new RectangleConfiguration(outerRect, innerRect, dxMin, dyMin);
    const arrangedRectangles = config.getOptimalConfig();
    console.log("------ Test: RectangleConfiguration (Results) ----- ")
    console.log(`Number of rectangles: ${arrangedRectangles.length}`);
    console.log(arrangedRectangles);
    console.log("------ Test: RectangleConfiguration (Completed) -----\n ")
}

function testRectangleArranger() {

const layoutConfig: LayoutConfig = {
    centerRectangle: { x: 0, y: 0, w: 355, h: 180 },
    boundingRectangle: { x: 20, y: 0, w: 335, h: 180 },
    directionX: DirectionX.RightToLeft, // Can be "right-to-left"
    directionY: DirectionY.BottomToTop, // Can be "bottom-to-top"
    headDimension: {
      minX: 10,  // Horizontal spacing before each rectangle
      maxX: 10,  // Horizontal spacing after each rectangle
      minY: 10,  // Vertical spacing before each rectangle
      maxY: 10,  // Vertical spacing after each rectangle
      rangeHeight: 10, // Spacing between rows
    },
  };
  
  const arranger = new RectangleArranger(layoutConfig);
  const n = 8;  // Number of rectangles
  const rectangleWidth = 40;
  const rectangleHeight = 40;
  const { totalWidth, totalHeight} = arranger.calculateTotalDimensions(n, rectangleWidth, rectangleHeight);
  console.log(`Packed Rectangles Dimension:${totalWidth} x ${totalHeight} `)
  const arrangedRectangles = arranger.arrangeAndCenterRectanglesWithinBounds(n, rectangleWidth, rectangleHeight);
  
  // Output arranged rectangles
  console.log("Arranged Rectangles:");
  console.table(arrangedRectangles);

  // Options to send data as JSON to the Python script
    let options: Options = {
    mode: 'json',// use JSON mode
    pythonPath: '', // Path to Python executable
    scriptPath: './src/', // Path to the Python script
    args: [JSON.stringify(arrangedRectangles), JSON.stringify(layoutConfig.boundingRectangle), 
    JSON.stringify(layoutConfig.centerRectangle)], // Pass the data as a JSON string
  };
  
// Explicitly define types for callback parameters
PythonShell.run('plotRectangles.py', options).then(messages=>{
    console.log('Python Script Finished');
  });
}

function testRectangleOperations() {

    function intersectionRectangles(
      rect1: Rectangle,
      rect2: Rectangle,
    ): Rectangle | null {
      // Calculate the edges of the intersection rectangle
      const left = Math.max(rect1.x, rect2.x);
      const bottom = Math.max(rect1.y, rect2.y);
      const right = Math.min(rect1.x + rect1.w, rect2.x + rect2.w);
      const top = Math.min(rect1.y + rect1.h, rect2.y + rect2.h);
    
      // Check if there is an actual intersection
      if (left < right && top > bottom) {
        // Calculate the intersection's width and height
        const width = right - left;
        const height = top - bottom;
    
        return {
          x: left,
          y: bottom,
          w: width,
          h: height,
        };
      } else {
        // If no intersection, return null
        return null;
      }
    }

    console.log("------ Test: RectangleOperations (Running) ----- ");
    // Test the RectangleOperations class
    const rect1: Rectangle = { x: 0, y: 0, w: 355, h: 180 };
    const rect2: Rectangle = { x: 0, y: 0, w: 80, h: 40 };

    const intersectRect = intersectionRectangles(rect1,rect2)
    console.log("------ Test: RectangleOperations (Results) ----- ");
    console.log(`Intersection rectangle:`);
    console.table(intersectRect);

}

// Main execution
console.log("Starting tests...");
try {
   // testPrinterParams();
   testRectangleArranger();
    //testRectangleConfiguration();
    //testRectangleArranger();
    testRectangleOperations();
} catch (error) {
    console.error("An error occurred during testing:", error);
}
