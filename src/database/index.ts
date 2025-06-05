import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import { DashboardDTO } from "@/lib/types";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "waterline",
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
};

export type Log = {
  _id: string;
  action: string;
  status: string;
  timestamp: string;
};

export type LogList = {
  data: Log[];
};

/**
 * Busca todos os dados necessários para o dashboard inicial em uma única operação.
 * Retorna os dados do último sensor e o estado mais recente dos dispositivos (LED e Relé).
 */
export const getDashboardData = async (): Promise<DashboardDTO> => {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE as string);

    // Definimos as três consultas que precisamos executar
    const sensorDataQuery = db
      .collection("leituras") // ATENÇÃO: Verifique se o nome da coleção é "leituras" ou "dados"
      .findOne({}, { sort: { timestamp: -1 } });

    const ledStatusQuery = db
      .collection("commands") // ATENÇÃO: Coleção onde os comandos são salvos
      .findOne(
        { action: { $in: ["ACENDE_LED", "APAGA_LED"] } },
        { sort: { timestamp: -1 } }
      );

    const releStatusQuery = db
      .collection("commands")
      .findOne(
        { action: { $in: ["LIGA_RELE", "DESLIGA_RELE"] } },
        { sort: { timestamp: -1 } }
      );

    // Executamos todas as consultas em paralelo para maior eficiência
    const [sensorDoc, ledActionDoc, releActionDoc] = await Promise.all([
      sensorDataQuery,
      ledStatusQuery,
      releStatusQuery,
    ]);

    // Validação essencial: precisamos de pelo menos um dado de sensor
    if (!sensorDoc) {
      throw new Error("Nenhum dado encontrado na coleção 'leituras'.");
    }

    // Processamos os resultados para determinar o estado
    const ledStatus = ledActionDoc?.action === "ACENDE_LED" ? "ON" : "OFF";
    const releStatus = releActionDoc?.action === "LIGA_RELE" ? "ON" : "OFF";

    // Montamos o objeto de retorno final, garantindo a serialização dos dados
    const dashboardData: DashboardDTO = {
      sensorData: {
        _id: sensorDoc._id.toString(),
        humidity: sensorDoc.humidity,
        temperature: sensorDoc.temperature,
        water_temperature: sensorDoc.water_temperature,
        water_level: sensorDoc.water_level,
        timestamp: sensorDoc.timestamp.toISOString(), // Garante que seja uma string ISO
      },
      deviceStatus: {
        ledStatus,
        releStatus,
      },
    };

    return dashboardData;
  } catch (error) {
    console.error("Erro ao buscar dados para o dashboard:", error);
    // Relança o erro para que a camada superior (ex: Server Component) possa tratá-lo
    throw new Error("Não foi possível carregar os dados do dashboard.");
  }
};

export const getLatestSensorData = async (): Promise<Sensor> => {
  const client = clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE as string);
  const log = await db
    .collection("dados")
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
    .collection("dados")
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
