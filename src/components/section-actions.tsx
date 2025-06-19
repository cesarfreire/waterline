"use client";

import { useState, useEffect, FC, ReactNode } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Fish, Lightbulb, Loader2, Zap, Waves, Filter } from "lucide-react";
import { Button } from "./ui/button";

// --- Interfaces de Estado e Tipos ---
interface DeviceStatus {
  reles: {
    [key: string]: boolean; // ex: { rele1: false, rele2: true, ... }
  };
}

type UpdatingDevice = keyof DeviceStatus["reles"] | "feeder" | null;

// --- Configuração dos Controles ---
// Adicionamos ícones e descrições para cada card
const relayConfig = [
  {
    id: 1,
    label: "Iluminação",
    description: "Controle a luz principal do aquário.",
    icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
  },
  {
    id: 2,
    label: "Alimentador",
    description: "Ligue/desligue e acione o alimentador.",
    icon: <Fish className="w-6 h-6 text-blue-500" />,
  },
  {
    id: 3,
    label: "Filtro",
    description: "Controle o sistema de filtragem.",
    icon: <Filter className="w-6 h-6 text-gray-400" />,
  },
  {
    id: 4,
    label: "Bomba",
    description: "Controle a bomba de circulação.",
    icon: <Waves className="w-6 h-6 text-teal-500" />,
  },
];

// ============================================================================
// --- COMPONENTE 1: Card de Controle de Relé Genérico ---
// ============================================================================
interface ReleControlCardProps {
  label: string;
  description: string;
  icon: ReactNode;
  isChecked: boolean;
  isUpdating: boolean;
  onToggle: () => void;
}

const ReleControlCard: FC<ReleControlCardProps> = ({
  label,
  description,
  icon,
  isChecked,
  isUpdating,
  onToggle,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {label}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-4 rounded-md border p-4">
        <Label htmlFor={`switch-${label}`} className="flex-1 font-medium">
          {isChecked ? "Ligado" : "Desligado"}
        </Label>
        <Switch
          id={`switch-${label}`}
          checked={isChecked}
          onCheckedChange={onToggle}
          disabled={isUpdating}
          aria-readonly
        />
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// --- COMPONENTE 2: Card de Controle Específico do Alimentador ---
// ============================================================================
interface FeederControlCardProps extends ReleControlCardProps {
  isFeeding: boolean;
  onFeedNow: () => void;
}

const FeederControlCard: FC<FeederControlCardProps> = ({
  label,
  description,
  icon,
  isChecked,
  isUpdating,
  isFeeding,
  onToggle,
  onFeedNow,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {label}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Controle de energia do alimentador */}
      <div className="flex items-center space-x-4 rounded-md border p-4">
        <Label htmlFor={`switch-${label}`} className="flex-1 font-medium">
          Energia ({isChecked ? "Ligada" : "Desligada"})
        </Label>
        <Switch
          id={`switch-${label}`}
          checked={isChecked}
          onCheckedChange={onToggle}
          disabled={isUpdating}
          aria-readonly
        />
      </div>
      {/* Botão para alimentar agora */}
      <Button
        className="w-full text-md py-5"
        onClick={onFeedNow}
        disabled={isUpdating || !isChecked} // Desabilita se estiver atualizando ou se a energia estiver desligada
      >
        {isFeeding ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Fish className="mr-2 h-5 w-5" />
        )}
        {isFeeding ? "Dispensando..." : "Alimentar Agora"}
      </Button>
    </CardContent>
  </Card>
);

// ============================================================================
// --- COMPONENTE 3: Container Principal (Dashboard) ---
// ============================================================================
export default function ActionControls() {
  const [status, setStatus] = useState<DeviceStatus>({
    reles: { rele1: false, rele2: false, rele3: false, rele4: false },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<UpdatingDevice>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Falha ao buscar status dos dispositivos.");
      const data = await res.json();
      setStatus({
        reles: {
          rele1: data.rele1Status === "ON",
          rele2: data.rele2Status === "ON",
          rele3: data.rele3Status === "ON",
          rele4: data.rele4Status === "ON",
        },
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReleToggle = async (releId: number) => {
    const releKey = `rele${releId}`;
    const originalStatus = { ...status };
    const newStatus = !status.reles[releKey];

    setStatus((prev) => ({
      ...prev,
      reles: { ...prev.reles, [releKey]: newStatus },
    }));
    setUpdating(releKey as UpdatingDevice);

    const action = newStatus ? `LIGA_RELE_${releId}` : `DESLIGA_RELE_${releId}`;
    const releLabel =
      relayConfig.find((r) => r.id === releId)?.label || `Relé ${releId}`;

    try {
      await sendApiAction(
        action,
        `${releLabel} foi ${newStatus ? "ligado" : "desligado"}`
      );
    } catch (err) {
      setStatus(originalStatus);
    } finally {
      setUpdating(null);
    }
  };

  const handleFeedNow = async () => {
    setUpdating("feeder");
    try {
      await sendApiAction("ALIMENTAR_AGORA", "Ração dispensada com sucesso!");
    } finally {
      setTimeout(() => setUpdating(null), 700);
    }
  };

  const sendApiAction = async (action: string, successMessage: string) => {
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao executar a ação.");
      toast.success(successMessage);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Carregando...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 md:p-6">
      <ReleControlCard
        label={relayConfig[0].label}
        description={relayConfig[0].description}
        icon={relayConfig[0].icon}
        isChecked={status.reles.rele1}
        isUpdating={!!updating}
        onToggle={() => handleReleToggle(1)}
      />
      <FeederControlCard
        label={relayConfig[1].label}
        description={relayConfig[1].description}
        icon={relayConfig[1].icon}
        isChecked={status.reles.rele2}
        isUpdating={!!updating}
        isFeeding={updating === "feeder"}
        onToggle={() => handleReleToggle(2)}
        onFeedNow={handleFeedNow}
      />
      <ReleControlCard
        label={relayConfig[2].label}
        description={relayConfig[2].description}
        icon={relayConfig[2].icon}
        isChecked={status.reles.rele3}
        isUpdating={!!updating}
        onToggle={() => handleReleToggle(3)}
      />
      <ReleControlCard
        label={relayConfig[3].label}
        description={relayConfig[3].description}
        icon={relayConfig[3].icon}
        isChecked={status.reles.rele4}
        isUpdating={!!updating}
        onToggle={() => handleReleToggle(4)}
      />
    </div>
  );
}
