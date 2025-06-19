export type SensorData = {
  _id: string;
  humidity: number;
  temperature: number;
  water_temperature: number;
  water_level: number;
  timestamp: string;
};

export type DeviceStatus = {
  rele1Status: "ON" | "OFF";
  rele2Status: "ON" | "OFF";
  rele3Status: "ON" | "OFF";
  rele4Status: "ON" | "OFF";
};

export type DashboardDTO = {
  sensorData: SensorData;
  deviceStatus: DeviceStatus;
};

export type SensorType =
  | "temperature"
  | "water_temperature"
  | "humidity"
  | "water_level";

export type SensorRecord = {
  timestamp: string;
  value: number;
};
