import fs from "fs";
import path from "path";
import { Bounds, PrintersParams} from './src/types';
import { RectangleConfiguration, Rectangle } from "./src/testRectangleConfig";

function testPrinterParams() {
    console.log("Running PrinterParams tests...");

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
    if (headDimension) {
        console.log(`For part height ${partHeight}, the selected head dimension is:`);
        console.log(`minX: ${headDimension.minX}, maxX: ${headDimension.maxX}`);
        console.log(`minY: ${headDimension.minY}, maxY: ${headDimension.maxY}`);
        console.log(`Width: ${headSize?.headWidth}, Height: ${headSize?.headHeight}`);
    } else {
        console.log(`No suitable head dimension found for part height ${partHeight}.`);
    }
}

function testRectangleConfiguration() {
    console.log("Running RectangleConfiguration tests...");

    const outerRect: Rectangle = { x: 0, y: 0, w: 355, h: 180 };
    const innerRect: Rectangle = { x: 0, y: 0, w: 80, h: 40 };
    const dxMin = 10;
    const dyMin = 5;

    const config = new RectangleConfiguration(outerRect, innerRect, dxMin, dyMin);
    const arrangedRectangles = config.getOptimalConfig();

    console.log(`Number of rectangles: ${arrangedRectangles.length}`);
    console.log(arrangedRectangles);
}

// Main execution
console.log("Starting tests...");
try {
    testPrinterParams();
    console.log("PrinterParams tests completed successfully.\n");

    testRectangleConfiguration();
    console.log("RectangleConfiguration tests completed successfully.\n");
} catch (error) {
    console.error("An error occurred during testing:", error);
}
