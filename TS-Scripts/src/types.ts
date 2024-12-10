
import { PrintConfig } from "./gcodePrintConfig";

export interface Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GCommand {
  x?: number;
  y?: number;
  z?: number;
  a?: number;
  b?: number;
  f?: number;
  comment?: string;
}

export interface Temperature {
  extruder1?: Record<string, number>;
  extruder2?: Record<string, number>;
  heat_bed?: Record<string, number>;
}

export interface Bounds {
  x: Record<string, number>;
  y: Record<string, number>;
  z: Record<string, number>;
}

export interface MetaData {
  valid: boolean;
  fname: string;
  printer: string;
  file_size: number;
  n_lines: number;
  extruder: string;
  filament_usage?: number;
  duration?: number;
  nozzle_size?: number;
  layer_height?: number;
  optimal_config?: [number, number, boolean][];
  max_repeats?: number;
  bounds?: Bounds;
  temperature?: Temperature;
  units: {
    distance: string;
    temperature: string;
    duration: string;
    file_size: string;
  };
  printing_params: Record<string, any>;
  extra_metadata: Record<string, any>;
  thumbnail?: string;
}

export abstract class BaseParams {
  get timestamp(): string {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  get jsonCommented(): string {
    return JSON.stringify(this, null, 4)
      .split('\n')
      .map((line) => `; ${line}`)
      .join('\n');
  }
}

export class RepeaterParams extends BaseParams {
  zhop: number = 0.5;
  speed: number = 50;

  constructor(zhop: number, speed: number) {
    super();
    this.zhop = zhop;
    this.speed = speed;
  }
}

export class StandbyParams extends BaseParams {
  temp_bed: number;
  temp_noz: number;

  constructor(temp_bed: number, temp_noz: number) {
    super();
    this.temp_bed = temp_bed;
    this.temp_noz = temp_noz;
  }
}

class PrintHeadDimension {
  constructor(
    public minX: number,
    public maxX: number,
    public minY: number,
    public maxY: number,
  ) {}
}

export class PrintersParams extends BaseParams {
  extruderConfig: PrintConfig['extruderConfig'];
  heatbedConfig: PrintConfig['heatbedConfig'];
  cncConfig: PrintConfig['CNCConfig'];

  constructor(printerConfig: PrintConfig) {
    super();

    // Directly assign the printerConfig values to the corresponding properties
    this.extruderConfig = printerConfig.extruderConfig;
    this.heatbedConfig = printerConfig.heatbedConfig;
    this.cncConfig = printerConfig.CNCConfig;

  }

  //Log Parameters
  //console.log(`Extruder 1 Head Dimensions: ${this.extruderConfig.extruder1.headDimensions}`);
  // Calculates the offset needed to transition from (bed coordinate system with 0,0 in bottom left) to G53 (absolute coordinate system)
  get g53ToG54(): [number, number] {
    return [
      this.heatbedConfig.travelCenter_X,
      this.heatbedConfig.travelCenter_Y,
    ];
  }

  get bedCoordinatesToG53(): [number, number] {
    return [this.heatbedConfig.travelMin_X, this.heatbedConfig.travelMin_Y];
  }

  getBedCoordinatesToG53(): [number, number] {
    /*
    // Map input strings to extruder keys
    const extruderKeyMap: { [key: string]: string } = {
      extruder1: 'extruderA',
      extruder2: 'extruderB',
    };

    // Get the corresponding key for the provided extruder string
    const extruderKey = extruderKeyMap[extruder];
    if (!extruderKey) {
      throw new Error(
        `Invalid extruder input: '${extruder}'. Use 'extruder1' or 'extruder2'.`,
      );
    }

    // Access the extruder offsets
    const extruderOffset = this.extruderOffsets[extruderKey];

    if (!extruderOffset) {
      throw new Error(`Extruder '${extruderKey}' not found in extruderOffsets`);
    }

    // Round the centerOffset values to 2 decimal places
    const roundedXOffset = parseFloat(extruderOffset.centerOffset_X.toFixed(2));
    const roundedYOffset = parseFloat(extruderOffset.centerOffset_Y.toFixed(2));
    */
    // Calculate and return the transformed coordinates
    return [this.heatbedConfig.travelMin_X, this.heatbedConfig.travelMin_Y];
  }

  get plateWidth(): number {
    return this.heatbedConfig.travelMax_X - this.heatbedConfig.travelMin_X;
  }

  get plateHeight(): number {
    return this.heatbedConfig.travelMax_Y - this.heatbedConfig.travelMax_Y;
  }

  get headCenterG53(): [number, number] {
    return [
      this.heatbedConfig.travelCenter_X,
      this.heatbedConfig.travelCenter_Y,
    ];
  }

  // Function to get the head dimension based on part height
  getHeadDimensionForHeight(
    partHeight: number,
    extruder: string,
  ): PrintHeadDimension | undefined {
    let availableHeights: number[];

    // Determine which extruder's head dimensions to use
    if (extruder === 'extruder1') {
      availableHeights = Object.keys(
        this.extruderConfig.extruder1.headDimensions,
      ).map(Number);
    } else if (extruder === 'extruder2') {
      availableHeights = Object.keys(
        this.extruderConfig.extruder2.headDimensions,
      ).map(Number);
    } else {
      throw new Error(
        `Invalid extruder input: '${extruder}'. Use 'extruder1' or 'extruder2'.`,
      );
    }

    // Find the smallest height that is greater than or equal to partHeight
    const validHeights = availableHeights.filter(
      (height) => height >= partHeight,
    );

    // If no valid height found, return undefined
    if (validHeights.length === 0) {
      return undefined;
    }

    // Select the smallest height
    const selectedHeight = Math.min(...validHeights);

    // Return the corresponding PrintHeadDimension for the selected height
    if (extruder === 'extruder1') {
      return this.extruderConfig.extruder1.headDimensions[selectedHeight];
    } else if (extruder === 'extruder2') {
      return this.extruderConfig.extruder2.headDimensions[selectedHeight];
    }

    // Default return for safety, although this shouldn't happen
    return undefined;
  }

  // Function to get head width and height for a given part height
  getHeadWidthAndHeightForHeight(
    partHeight: number,
    extruder: string,
  ): { headWidth: number; headHeight: number } | undefined {
    // First, get the head dimensions using the getHeadDimensionForHeight method
    const Dimension = this.getHeadDimensionForHeight(partHeight, extruder);

    if (!Dimension) {
      // If it's undefined, return undefined
      return undefined;
    }

    // Calculate width and height
    const headWidth = Dimension.maxX - Dimension.minX;
    const headHeight = Dimension.maxY - Dimension.minY;
    return { headWidth: headWidth, headHeight: headHeight };
  }
}

export class MBLParams extends BaseParams {
  n_probes_x: number;
  n_probes_y: number;
  travel_feed_rate: number; // [mm/s]
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  extruder: string = 'extruder_1';
  max_acceleration: number = 30000.0;

  constructor(
    n_probes_x: number,
    n_probes_y: number,
    travel_feed_rate: number,
    min_x: number,
    min_y: number,
    max_x: number,
    max_y: number,
  ) {
    super();
    this.n_probes_x = n_probes_x;
    this.n_probes_y = n_probes_y;
    this.travel_feed_rate = travel_feed_rate;
    this.min_x = min_x;
    this.min_y = min_y;
    this.max_x = max_x;
    this.max_y = max_y;
  }

  get travelFeedRateMmMin(): number {
    return this.travel_feed_rate * 60;
  }
}
