
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
  plate_xmin: number;
  plate_xmax: number;
  plate_ymin: number;
  plate_ymax: number;
  head_xmin: number;
  head_xmax: number;
  head_ymin: number;
  head_ymax: number;
  x0: number;
  y0: number;
  headDimensions: { [key: number]: PrintHeadDimension };

  constructor(
    plate_xmin: number,
    plate_xmax: number,
    plate_ymin: number,
    plate_ymax: number,
    head_xmin: number,
    head_xmax: number,
    head_ymin: number,
    head_ymax: number,
    x0: number,
    y0: number,
    headDimensions: { [key: number]: PrintHeadDimension },
  ) {
    super();
    this.plate_xmin = plate_xmin;
    this.plate_xmax = plate_xmax;
    this.plate_ymin = plate_ymin;
    this.plate_ymax = plate_ymax;
    this.head_xmin = head_xmin;
    this.head_xmax = head_xmax;
    this.head_ymin = head_ymin;
    this.head_ymax = head_ymax;
    this.x0 = x0;
    this.y0 = y0;
    this.headDimensions = headDimensions;
  }

  // Calculates the offset needed to transition from G53 (machine coordinate system) to G54 (bed-centered coordinate system)
  get g53ToG54(): [number, number] {
    return [this.x0 - this.plateWidth / 2, this.y0 - this.plateHeight / 2]; //TODO: check if this is correctly taking the offsets from the heatbed config
  }

  get plateWidth(): number {
    return this.plate_xmax - this.plate_xmin;
  }

  get plateHeight(): number {
    return this.plate_ymax - this.plate_ymin;
  }

  get headWidth(): number {
    return this.head_xmax - this.head_xmin;
  }

  get headHeight(): number {
    return this.head_ymax - this.head_ymin;
  }

  get headCenterG53(): [number, number] {
    return [this.x0, this.y0];
  }

  // Function to get the head dimension based on part height
  getHeadDimensionForHeight(
    partHeight: number,
  ): PrintHeadDimension | undefined {
    // Get the list of available heights from the headDimensions keys
    const availableHeights = Object.keys(this.headDimensions).map(Number);

    // Find the smallest height that is greater than or equal to partHeight
    const selectedHeight = Math.min(
      ...availableHeights.filter((height) => height >= partHeight),
    );

    // Return the corresponding PrintHeadDimension
    return this.headDimensions[selectedHeight];
  }

  // Function to get head width and height for a given part height
  getHeadWidthAndHeightForHeight(
    partHeight: number,
  ): { headWidth: number; headHeight: number } | undefined {
    // First, get the head dimensions using the getHeadDimensionForHeight method
    const Dimension = this.getHeadDimensionForHeight(partHeight);

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
