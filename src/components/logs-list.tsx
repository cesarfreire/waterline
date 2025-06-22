"use client";

import { use, useState, ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Log, LogList } from "@/database";
import { Lightbulb, Fish, Filter, Waves, Zap, HelpCircle } from "lucide-react";

// objeto para mapear o tipo de status para uma cor de fundo
const statusColorMap = {
  success: "bg-green-500", // Ligado
  danger: "bg-red-500", // Desligado
  info: "bg-blue-500", // Ação (Alimentar)
  neutral: "bg-gray-400", // Outros
};

// cada relé tem um ícone e uma descrição
const relayConfig: {
  id: number;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: 1,
    label: "Iluminação",
    icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
  },
  {
    id: 2,
    label: "Alimentador",
    icon: <Fish className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 3,
    label: "Filtro",
    icon: <Filter className="w-5 h-5 text-gray-400" />,
  },
  {
    id: 4,
    label: "Bomba",
    icon: <Waves className="w-5 h-5 text-teal-500" />,
  },
];

// função "tradutora" para formatar cada log
const formatLogMessage = (log: Log) => {
  const { action } = log;

  // caso especial para "ALIMENTAR_AGORA"
  if (action === "ALIMENTAR_AGORA") {
    return {
      title: "Alimentador Acionado",
      description: "Uma porção de ração foi dispensada.",
      icon: <Fish className="w-5 h-5 text-blue-500" />,
      statusType: "info" as const,
    };
  }

  // expressão regular para extrair a AÇÃO e o NÚMERO do relé
  const match = action.match(/(LIGA|DESLIGA)_RELE_(\d+)/);

  if (match) {
    const operation = match[1]; // "LIGA" ou "DESLIGA"
    const relayId = parseInt(match[2], 10); // o número do relé

    const device = relayConfig.find((r) => r.id === relayId);
    const deviceName = device?.label || `Relé ${relayId}`;
    const deviceIcon = device?.icon || <Zap className="w-5 h-5" />;
    const actionText = operation === "LIGA" ? "ligado(a)" : "desligado(a)";
    const statusType = operation === "LIGA" ? "success" : "danger";

    return {
      title: `${deviceName} foi ${actionText}`,
      description: `Ação técnica: ${action}`,
      icon: deviceIcon,
      statusType: statusType as "success" | "danger",
    };
  }

  // Caso não encontre um padrão conhecido, exibe o log bruto
  return {
    title: log.status,
    description: `Ação: ${log.action}`,
    icon: <HelpCircle className="w-5 h-5 text-muted-foreground" />,
    statusType: "neutral" as const,
  };
};

export function LogsList({ data }: { data: Promise<LogList> }) {
  const initial_data = use(data);
  const [logs, setLogs] = useState<Log[]>(initial_data.data);

  if (!logs || logs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhuma ação registrada.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        // 3. Para cada log, chamamos a função tradutora antes de renderizar
        const formattedLog = formatLogMessage(log);

        return (
          <Card key={log._id} className="relative pl-8">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${
                statusColorMap[formattedLog.statusType]
              }`}
            />
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {formattedLog.icon}
                {formattedLog.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-1">
                {formattedLog.description} em{" "}
                {new Date(log.timestamp).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
