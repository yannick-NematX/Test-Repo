export type ExtruderConfig = {
  extruder1: {
    centerOffset_X: number | null;
    centerOffset_Y: number | null;
    headDimensions: {
      [key: number]: { minX: number; maxX: number; minY: number; maxY: number };
    };
  };
  extruder2: {
    centerOffset_X: number | null;
    centerOffset_Y: number | null;
    headDimensions: {
      [key: number]: { minX: number; maxX: number; minY: number; maxY: number };
    };
  };
};

export type HeatbedConfig = {
  travelMax_X: number;
  travelMin_X: number;
  travelMax_Y: number;
  travelMin_Y: number;
  travelCenter_X: number;
  travelCenter_Y: number;
  travelMax_Z: number;
};

export type CNCConfig = {
  travelX: number;
  travelY: number;
  travelZ: number;
};

export type PrintConfig = {
  extruderConfig: ExtruderConfig;
  heatbedConfig: HeatbedConfig;
  CNCConfig: CNCConfig;
};
