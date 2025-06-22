import { getHistorySensorData } from "@/database";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic"; // Força o Next.js a tratar esta rota como dinâmica

const querySchema = z.object({
  sensor: z.enum([
    "temperature",
    "humidity",
    "water_temperature",
    "water_level",
  ]),
  minutes: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
      message: "O parâmetro 'minutes' deve ser um número positivo",
    }),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const { sensor, minutes } = querySchema.parse(query);

    const data = await getHistorySensorData(sensor, minutes);

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("Erro ao buscar histórico de sensores:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
