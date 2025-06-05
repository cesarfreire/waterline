export type SensorData = {
  _id: string;
  humidity: number;
  temperature: number;
  water_temperature: number;
  water_level: number;
  timestamp: string;
};

export type DeviceStatus = {
  ledStatus: "ON" | "OFF";
  releStatus: "ON" | "OFF";
};

export type DashboardDTO = {
  sensorData: SensorData;
  deviceStatus: DeviceStatus;
};
