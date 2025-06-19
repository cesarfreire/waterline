import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // Força o Next.js a tratar esta rota como dinâmica

export async function GET() {
  try {
    const client = clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE as string);
    // consulta ultimos dados dos sensores
    const sensorDataQuery = db
      .collection("dados")
      .findOne({}, { sort: { timestamp: -1 } });

    // consulta ultimos dados dos reles
    const relayIds = [1, 2, 3, 4];
    const releStatusQueries = relayIds.map((id) =>
      db
        .collection("logs")
        .findOne(
          { action: { $in: [`LIGA_RELE_${id}`, `DESLIGA_RELE_${id}`] } },
          { sort: { timestamp: -1 } }
        )
    );

    const [sensorDoc, ...releActionDocs] = await Promise.all([
      sensorDataQuery,
      ...releStatusQueries,
    ]);

    // validacao
    if (!sensorDoc) {
      return NextResponse.json(
        { message: "Nenhum dado de sensor encontrado." },
        { status: 404 }
      );
    }

    // transforma os dados dos reles em um objeto de status
    const deviceStatus = releActionDocs.reduce((acc, currentDoc, index) => {
      const releId = relayIds[index];
      const status = currentDoc?.action.startsWith("LIGA") ? "ON" : "OFF";
      acc[`rele${releId}Status`] = status;
      return acc;
    }, {} as { [key: string]: string });

    // monta resposta da api
    const responsePayload = {
      sensorData: {
        ...sensorDoc,
        _id: sensorDoc._id.toString(),
        timestamp: sensorDoc.timestamp,
      },
      deviceStatus,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
