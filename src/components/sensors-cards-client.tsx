"use client";

import { use, useState, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Thermometer,
  Droplets,
  Waves,
  Layers,
  RefreshCw,
  Clock,
  Zap,
  Lightbulb,
  Fish,
  Filter,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { DashboardDTO } from "@/lib/types";

// array de configuração com icones
const statusConfig: {
  id: number;
  label: string;
  key: keyof DashboardDTO["deviceStatus"];
  icon: ReactNode;
}[] = [
  {
    id: 1,
    label: "Iluminação",
    key: "rele1Status",
    icon: <Lightbulb className="h-5 w-5 text-yellow-400" />,
  },
  {
    id: 2,
    label: "Alimentador",
    key: "rele2Status",
    icon: <Fish className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 3,
    label: "Filtro",
    key: "rele3Status",
    icon: <Filter className="h-5 w-5 text-gray-400" />,
  },
  {
    id: 4,
    label: "Bomba",
    key: "rele4Status",
    icon: <Waves className="h-5 w-5 text-teal-500" />,
  },
];

export function SectionCardsClient({ data }: { data: Promise<DashboardDTO> }) {
  const initialData = use(data);
  const [dashboardData, setDashboardData] = useState<DashboardDTO>(initialData);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
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
      {/* cabecalho geral */}
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

      {/* grid de cards dos sensores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Umidade do Ar</CardTitle>
            <Droplets className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sensorData.humidity}%</div>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
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

        <Card>
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
      </div>

      {/* grid de cards de status dos dispositivos */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-500" />
          Status dos Dispositivos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* mapeia o array para criar um card por rele */}
          {statusConfig.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.label}
                </CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    deviceStatus[item.key] === "ON" ? "default" : "destructive"
                  }
                  className="text-base"
                >
                  {deviceStatus[item.key] === "ON" ? "Ligado" : "Desligado"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
