"use client";

import { IconRefresh } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "./ui/separator";
import { getLatestSensorData } from "@/database";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Sensor = {
  _id: string;
  humidity: number;
  temperature: number;
  water_temperature: number;
  water_level: number;
  timestamp: string;
  timezone: string;
};

type SensorDTO = {
  data: Sensor[];
};

export function SectionCardsClient({ data }: { data: Promise<Sensor> }) {
  const latest_data = use(data);
  const [sensor, setSensor] = useState<Sensor>(latest_data);
  const [loading, setLoading] = useState(false);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      // simula um atraso de 1 segundo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await fetch("/api/sensors/all");
      const data: SensorDTO = await response.json();
      if (!data) {
        throw new Error("Nenhum dado encontrado na coleção 'leituras'.");
      }
      setSensor(data.data[0]);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!sensor) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Carregando dados...
      </div>
    );
  }

  const lastUpdate = new Date(sensor.timestamp).toLocaleString("pt-BR", {
    timeZone: sensor.timezone,
    hour12: false,
  })

  return (
    <>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Umidade</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {sensor.humidity}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Umidade do ambiente</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Temperatura</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {sensor.temperature} °C
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Temperatura do ambiente</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Temperatura da Água</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {sensor.water_temperature.toFixed(1)} °C
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Temperatura da água</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Nível da Água</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {sensor.water_level} cm
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Nível da água</div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="text-sm text-muted-foreground">
          Última atualização dos dados: {lastUpdate}
        </div>
        <Button
          onClick={fetchSensorData}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <IconRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar dados
        </Button>
      </div>

      <Separator className="mt-4" />
    </>
  );
}
