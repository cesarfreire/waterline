import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import AWS from "aws-sdk";

const iotdata = new AWS.IotData({
  endpoint: process.env.AWS_IOT_ENDPOINT as string, // ex: 'a1234567890-ats.iot.us-east-1.amazonaws.com'
  region: process.env.AWS_REGION as string,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const ALLOWED_ACTIONS = [
  "APAGA_LED",
  "ACENDE_LED",
  "DESLIGA_RELE",
  "LIGA_RELE",
];
const TOPICO = "esp8266/sub";

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (!ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ message: "Ação inválida." }, { status: 400 });
    }

    const payload = JSON.stringify({ action });

    const params = {
      topic: TOPICO,
      payload,
      qos: 0,
    };

    await iotdata.publish(params).promise();

    return NextResponse.json(
      { message: "Ação publicada com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao publicar no MQTT:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
