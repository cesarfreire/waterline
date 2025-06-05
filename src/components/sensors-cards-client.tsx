// app/components/SectionCardsClient.tsx
"use client";

import { use, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Thermometer,
  Droplets,
  Waves,
  Layers,
  Lightbulb,
  Power,
  RefreshCw,
  Clock,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { DashboardDTO } from "@/lib/types";

export function SectionCardsClient({ data }: { data: Promise<DashboardDTO> }) {
  const initialData = use(data);
  const [dashboardData, setDashboardData] = useState<DashboardDTO>(initialData);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // A API agora retorna tanto os sensores quanto o status em uma única chamada
      const response = await fetch("/api/dashboard-data");
      if (!response.ok) {
        throw new Error("Falha ao buscar dados do dashboard.");
      }
      const data: DashboardDTO = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Se não houver dados iniciais, mostra uma mensagem de carregamento.
  if (!dashboardData?.sensorData) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Carregando dados do painel...
      </div>
    );
  }

  const { sensorData, deviceStatus } = dashboardData;
  const timeAgo = formatTimeAgo(new Date(sensorData.timestamp));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Cabeçalho Unificado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Geral</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Atualizado {timeAgo}</span>
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card: Umidade */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Umidade do Ar</CardTitle>
            <Droplets className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sensorData.humidity}%</div>
          </CardContent>
        </Card>

        {/* Card: Temperatura do Ar */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Temperatura do Ar
            </CardTitle>
            <Thermometer className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sensorData.temperature}°C</div>
          </CardContent>
        </Card>

        {/* Card: Temperatura da Água */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Temperatura da Água
            </CardTitle>
            <Waves className="h-5 w-5 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sensorData.water_temperature.toFixed(1)}°C
            </div>
          </CardContent>
        </Card>

        {/* Card: Nível da Água */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nível da Água</CardTitle>
            <Layers className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sensorData.water_level}</div>
            <p className="text-xs text-muted-foreground">
              Leitura do sensor analógico
            </p>
          </CardContent>
        </Card>

        {/* --- NOVOS CARDS DE STATUS --- */}

        {/* Card: Status do LED */}
        <Card className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status do LED</CardTitle>
            <Lightbulb className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                deviceStatus.ledStatus === "ON" ? "default" : "destructive"
              }
              className="text-lg"
            >
              {deviceStatus.ledStatus === "ON" ? "Ligado" : "Desligado"}
            </Badge>
          </CardContent>
        </Card>

        {/* Card: Status do Relé */}
        <Card className="hidden sm:block sm:col-span-2 lg:col-span-1 xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Status do Relé
            </CardTitle>
            <Power className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                deviceStatus.releStatus === "ON" ? "default" : "destructive"
              }
              className="text-lg"
            >
              {deviceStatus.releStatus === "ON" ? "Ligado" : "Desligado"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
