declare module "china-map-geojson" {
  export const ChinaData: {
    type: "FeatureCollection";
    features: Array<Record<string, unknown>>;
  };

  export const ProvinceData: Record<string, unknown>;
}
