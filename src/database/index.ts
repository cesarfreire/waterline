import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import { DateTime } from "luxon";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "sensores",
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error: ", error);
  }
};

export type Sensor = {
  _id: string;
  humidity: number;
  temperature: number;
  water_temperature: number;
  water_level: number;
  timestamp: string;
  timezone: string;
};

export type Log = {
  _id: string;
  action: string;
  status: string;
  timestamp: string;
  timezone: string;
};

export type LogList = {
  data: Log[];
};

export const getLatestSensorData = async (): Promise<Sensor> => {
  const client = clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE as string);
  const log = await db
    .collection("leituras")
    .findOne({}, { sort: { timestamp: -1 } });
  if (!log) {
    throw new Error("Nenhum dado encontrado na coleção 'leituras'.");
  }
  return {
    _id: log._id.toString(),
    humidity: log.humidity,
    temperature: log.temperature,
    water_temperature: log.water_temperature,
    water_level: log.water_level,
    timestamp: log.timestamp,
    timezone: log.timezone,
  };
};

export const getLatestLogsData = async (): Promise<LogList> => {
  const client = clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE as string);
  const log = await db
    .collection("logs")
    .find({})
    .sort({ timestamp: -1 })
    .toArray();
  if (!log) {
    throw new Error("Nenhum dado encontrado na coleção 'logs'.");
  }
  return {
    data: log.map((log) => ({
      _id: log._id.toString(),
      action: log.action,
      status: log.status,
      timestamp: log.timestamp,
      timezone: log.timezone,
    })),
  };
};

interface SensorData {
  timestamp: string;
  value: number;
}

export const getHistorySensorData = async (
  sensor: string,
  filter: any
): Promise<SensorData[]> => {
  const client = clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE as string);

  const rawData = await db
    .collection("leituras")
    .find(
      { [sensor]: { $exists: true } },
      { projection: { timestamp: 1, timezone: 1, [sensor]: 1 } }
    )
    .sort({ timestamp: 1 })
    .limit(1000)
    .toArray();

  if (!rawData || rawData.length === 0) {
    throw new Error("Nenhum dado encontrado para o sensor selecionado.");
  }

  const result = rawData.map((doc) => ({
    timestamp: doc.timestamp,
    value: doc[sensor],
    timezone: doc.timezone,
  }));

  return result;
};
