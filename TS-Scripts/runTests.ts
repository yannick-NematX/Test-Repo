import fs from "fs";
import path from "path";
import { Bounds, PrintersParams} from './src/types';
import { RectangleConfiguration, Rectangle } from "./src/testRectangleConfig";
import { RectangleArranger, LayoutConfig, DirectionX, DirectionY } from "./src/rectangleArranger";
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
    containerWidth: 500,
    containerHeight: 500,
    directionX: DirectionX.RightToLeft, // Can be "right-to-left"
    directionY: DirectionY.BottomToTop, // Can be "bottom-to-top"
    headDimension: {
      minX: 0,  // Horizontal spacing before each rectangle
      maxX: 0,  // Horizontal spacing after each rectangle
      minY: 0,  // Vertical spacing before each rectangle
      maxY: 0,  // Vertical spacing after each rectangle
      rangeHeight: 10, // Spacing between rows
    },
  };
  
  const arranger = new RectangleArranger(layoutConfig);
  const n = 4;  // Number of rectangles
  const rectangleWidth = 50;
  const rectangleHeight = 50;
  const { totalWidth, totalHeight} = arranger.calculateTotalDimensions(n, rectangleWidth, rectangleHeight);
  console.log(`Packed Rectangles Dimension:${totalWidth} x ${totalHeight} `)
  const arrangedRectangles = arranger.arrangeEqualRectangles(n, rectangleWidth, rectangleHeight);
  
  // Output arranged rectangles
  console.log("Arranged Rectangles:");
  console.table(arrangedRectangles);

  // Options to send data as JSON to the Python script
    let options: Options = {
    mode: 'json',// use JSON mode
    pythonPath: '', // Path to Python executable
    scriptPath: './src/', // Path to the Python script
    args: [JSON.stringify(arrangedRectangles), JSON.stringify([totalWidth,totalHeight]), 
    JSON.stringify([layoutConfig.containerWidth,layoutConfig.containerHeight])], // Pass the data as a JSON string
  };
  
// Explicitly define types for callback parameters
PythonShell.run('plotRectangles.py', options).then(messages=>{
    console.log('Python Script Finished');
  });
}

// Main execution
console.log("Starting tests...");
try {
    testPrinterParams();
    testRectangleConfiguration();
    testRectangleArranger();
} catch (error) {
    console.error("An error occurred during testing:", error);
}
