// /app/api/dashboard-data/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE as string);
    // 1. Pega o último registro de sensor
    const sensorData = await db
      .collection("dados")
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    // 2. Pega o último status do LED
    const lastLedAction = await db
      .collection("logs")
      .find({ action: { $in: ["ACENDE_LED", "APAGA_LED"] } })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    // 3. Pega o último status do Relé
    const lastReleAction = await db
      .collection("logs")
      .find({ action: { $in: ["LIGA_RELE", "DESLIGA_RELE"] } })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (!sensorData[0]) {
      return NextResponse.json(
        { message: "Nenhum dado de sensor encontrado." },
        { status: 404 }
      );
    }

    const ledStatus =
      lastLedAction.length > 0 && lastLedAction[0].action === "ACENDE_LED"
        ? "ON"
        : "OFF";
    const releStatus =
      lastReleAction.length > 0 && lastReleAction[0].action === "LIGA_RELE"
        ? "ON"
        : "OFF";

    const responsePayload = {
      sensorData: sensorData[0],
      deviceStatus: {
        ledStatus,
        releStatus,
      },
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
