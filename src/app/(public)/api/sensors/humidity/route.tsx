import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const client = clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE as string);
  const logs = await db
    .collection("dados")
    .find({})
    .sort({ metacritic: -1 })
    .limit(20)
    .toArray();

  return NextResponse.json({ data: logs }, { status: 200 });
}
