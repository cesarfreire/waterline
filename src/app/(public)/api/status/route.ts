import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Document } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE as string);
    const logsCollection = db.collection("logs");

    // numeros dos reles que queremos buscar o status
    const relayIds = [1, 2, 3, 4];

    // cria um array de "promessas" de busca, uma para cada relé.
    // cada busca pega o ultimo log de ação (LIGA ou DESLIGA) para um rele especifico.
    const lastActionPromises = relayIds.map((id) => {
      return logsCollection
        .find({ action: { $in: [`LIGA_RELE_${id}`, `DESLIGA_RELE_${id}`] } })
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
    });

    // executa todas as buscas no banco de dados em paralelo
    const results = await Promise.all(lastActionPromises);

    // processa os resultados para criar o objeto de status final
    const statusObject = results.reduce((acc, currentResult, index) => {
      const relayId = relayIds[index];
      const lastAction: Document | undefined = currentResult[0];

      // determina o status: se a ultima acao foi "LIGA...", o status eh "ON".
      // caso contrario o status eh "OFF".
      const status =
        lastAction && lastAction.action.startsWith("LIGA") ? "ON" : "OFF";

      // adiciona ao objeto acumulador no formato { rele1Status: "ON", ... }
      acc[`rele${relayId}Status`] = status;

      return acc;
    }, {} as { [key: string]: string });

    return NextResponse.json(statusObject);
  } catch (error) {
    console.error("Erro ao buscar status dos relés:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor ao buscar status." },
      { status: 500 }
    );
  }
}
