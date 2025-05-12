import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const client = clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE as string);
  const logs = await db
    .collection("leituras")
    .find({})
    .sort({ timestamp: -1 })
    .limit(1)
    .toArray();

  return NextResponse.json({ data: logs }, { status: 200 });
}
