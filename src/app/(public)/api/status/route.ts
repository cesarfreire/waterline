// /app/api/status/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = clientPromise;
    // Busca o último comando enviado para cada dispositivo
    const db = client.db(process.env.MONGODB_DATABASE as string);
    const lastLedAction = await db
      .collection("logs") // Suponha uma coleção "commands"
      .find({ action: { $in: ["ACENDE_LED", "APAGA_LED"] } })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    const lastReleAction = await db
      .collection("logs")
      .find({ action: { $in: ["LIGA_RELE", "DESLIGA_RELE"] } })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    const ledStatus =
      lastLedAction.length > 0 && lastLedAction[0].action === "ACENDE_LED"
        ? "ON"
        : "OFF";
    const releStatus =
      lastReleAction.length > 0 && lastReleAction[0].action === "LIGA_RELE"
        ? "ON"
        : "OFF";

    return NextResponse.json({ ledStatus, releStatus });
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
