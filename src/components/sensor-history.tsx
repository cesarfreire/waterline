"use client";

import { use, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SensorRecord, SensorType } from "@/lib/types";
import { Loader2 } from "lucide-react";

// o componente SensorHistory é um componente client que recebe dados iniciais da pagina
export default function SensorHistory({
  initialData,
}: {
  initialData: Promise<SensorRecord[]>;
}) {
  // usamos o hook 'use' para resolver a promessa vinda da pagina (server side)
  // isso garante que o componente so renderize quando os dados iniciais estiverem prontos
  const resolvedInitialData = use(initialData);

  // o estado inicial eh populado com os dados recebidos do servidor
  const [selectedSensor, setSelectedSensor] =
    useState<SensorType>("temperature");
  const [data, setData] = useState<SensorRecord[]>(resolvedInitialData);
  const [loading, setLoading] = useState(false);

  // o useEffect continua funcionando para as seleções do cliente
  // ele não sera disparado no carregamento inicial se o sensor padrao não for alterado
  useEffect(() => {
    // se o sensor selecionado for o padrao, nao fazemos nada pois ja temos os dados
    if (selectedSensor === "temperature" && data === resolvedInitialData) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/sensors/history?sensor=${selectedSensor}`
        );
        if (!res.ok) throw new Error("Falha ao buscar dados do sensor.");
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Erro ao buscar dados históricos:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSensor]); // a dependencia continua sendo o sensor selecionado

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-sm">
        <Label>Selecione o tipo de sensor:</Label>
        <Select
          onValueChange={(val: SensorType) => setSelectedSensor(val)}
          defaultValue="temperature"
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o sensor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature">Temperatura do Ar</SelectItem>
            <SelectItem value="water_temperature">
              Temperatura da Água
            </SelectItem>
            <SelectItem value="humidity">Umidade do Ar</SelectItem>
            <SelectItem value="water_level">Nível da Água</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <div>
          <div className="flex justify-center items-center h-48">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Carregando...
          </div>
        </div>
      ) : (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) =>
                  new Date(v).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label) =>
                  new Date(label).toLocaleString("pt-BR")
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
