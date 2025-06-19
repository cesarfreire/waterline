import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import { DashboardDTO, DeviceStatus } from "@/lib/types";

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

    // consulta 1: ultima leitura dos sensores
    const sensorDataQuery = db
      .collection("dados")
      .findOne({}, { sort: { timestamp: -1 } });

    // consultas 2-5: estado de cada um dos 4 reles
    const relayIds = [1, 2, 3, 4];
    const releStatusQueries = relayIds.map((id) =>
      db
        .collection("logs")
        .findOne(
          { action: { $in: [`LIGA_RELE_${id}`, `DESLIGA_RELE_${id}`] } },
          { sort: { timestamp: -1 } }
        )
    );

    // executamos todas as 5 consultas em paralelo para maxima eficiencia
    const [sensorDoc, ...releActionDocs] = await Promise.all([
      sensorDataQuery,
      ...releStatusQueries,
    ]);

    // validacao essencial: precisamos de pelo menos um dado de sensor
    if (!sensorDoc) {
      throw new Error("Nenhum dado encontrado na coleção 'dados'.");
    }

    // processamos os resultados dos reles para determinar o estado de cada um
    const deviceStatus = releActionDocs.reduce((acc, currentDoc, index) => {
      const releId = relayIds[index];
      // Se a ultima acao começar com "LIGA", esta ON. Senao, OFF.
      const status = currentDoc?.action.startsWith("LIGA") ? "ON" : "OFF";
      acc[`rele${releId}Status`] = status;
      return acc;
    }, {} as { [key: string]: string }) as DeviceStatus;

    // montamos o objeto de retorno final, garantindo a serialização dos dados
    const dashboardData: DashboardDTO = {
      sensorData: {
        _id: sensorDoc._id.toString(),
        humidity: sensorDoc.humidity,
        temperature: sensorDoc.temperature,
        water_temperature: sensorDoc.water_temperature,
        water_level: sensorDoc.water_level,
        timestamp: sensorDoc.timestamp,
      },
      deviceStatus, // objeto com o status dos 4 reles
    };

    return dashboardData;
  } catch (error) {
    console.error("Erro ao buscar dados para o dashboard:", error);
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
  // usamos uma pipeline de agregação para um controle mais fino da query
  const pipeline = [
    // etapa 1: Filtra os documentos
    { $match: { [sensor]: { $exists: true } } },

    // etapa 2: Ordena do MAIS NOVO para o mais antigo para encontrar os ultimos registros
    { $sort: { timestamp: -1 } },

    // etapa 3: Limita o resultado aos 1000 registros mais recentes
    { $limit: 1000 },

    // etapa 4: Ordena NOVAMENTE, agora do mais antigo para o mais novo, para o grafico
    { $sort: { timestamp: 1 } },
  ];
  const rawData = await db.collection("dados").aggregate(pipeline).toArray();

  if (!rawData || rawData.length === 0) {
    throw new Error("Nenhum dado encontrado para o sensor selecionado.");
  }

  const result = rawData.map((doc) => ({
    timestamp: doc.timestamp,
    value: doc[sensor],
  }));

  return result;
};
