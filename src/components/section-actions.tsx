"use client";

import { useState, useEffect } from "react";
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
import { Fish, Lightbulb, Loader2, Power } from "lucide-react";
import { Button } from "./ui/button";

interface DeviceStatus {
  led: boolean;
  rele: boolean;
}

type UpdatingDevice = keyof DeviceStatus | "feeder" | null;

export default function ActionControls() {
  // estado de cada dispositivo
  const [status, setStatus] = useState<DeviceStatus>({
    led: false,
    rele: false,
  });

  // estado para o carregamento geral e de cada controle individualmente
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<UpdatingDevice>(null);

  // função para buscar o estado atual dos dispositivos na API
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status"); // Você precisará criar este endpoint
      if (!res.ok) throw new Error("Falha ao buscar status.");
      const data = await res.json();

      setStatus({
        led: data.ledStatus === "ON",
        rele: data.releStatus === "ON",
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para buscar o estado inicial quando o componente for montado
  useEffect(() => {
    fetchStatus();
  }, []);

  // função para alternar o estado do LED ou Relé
  const handleToggle = async (device: keyof DeviceStatus) => {
    const originalStatus = { ...status };
    const newStatus = !status[device];

    setStatus((prev) => ({ ...prev, [device]: newStatus }));
    setUpdating(device);

    const action =
      device === "led"
        ? newStatus
          ? "ACENDE_LED"
          : "APAGA_LED"
        : newStatus
        ? "LIGA_RELE"
        : "DESLIGA_RELE";

    try {
      await sendApiAction(
        action,
        `${device.toUpperCase()} foi ${newStatus ? "ligado" : "desligado"}`
      );
    } catch (err: any) {
      setStatus(originalStatus); // Reverte em caso de erro
    } finally {
      setUpdating(null);
    }
  };

  // Função para alimentar agora
  const handleFeedNow = async () => {
    setUpdating("feeder");
    try {
      await sendApiAction("ALIMENTAR_AGORA", "Ração dispensada com sucesso!");
    } finally {
      // Adicionamos um pequeno delay para o usuário perceber a conclusão da ação
      setTimeout(() => setUpdating(null), 500);
    }
  };

  // Função para enviar a ação para a API
  const sendApiAction = async (action: string, successMessage: string) => {
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Erro ao executar a ação.`);

      toast.success(successMessage);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
      throw err; // Lança o erro para que a função que chamou possa tratá-lo (ex: reverter UI)
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        Carregando status dos dispositivos...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6">
      {/* Card para o LED (sem alterações) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            Controle do LED
          </CardTitle>
          <CardDescription>
            Ligue ou desligue o LED de status do dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Label htmlFor="led-switch" className="flex-1">
              Estado
            </Label>
            <Switch
              id="led-switch"
              checked={status.led}
              onCheckedChange={() => handleToggle("led")}
              disabled={!!updating}
              aria-readonly
            />
          </div>
        </CardContent>
      </Card>

      {/* Card para o Relé (sem alterações) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="w-6 h-6 text-green-500" />
            Controle do Relé
          </CardTitle>
          <CardDescription>
            Acione o relé para alimentar um dispositivo externo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Label htmlFor="rele-switch" className="flex-1">
              Estado
            </Label>
            <Switch
              id="rele-switch"
              checked={status.rele}
              onCheckedChange={() => handleToggle("rele")}
              disabled={!!updating}
              aria-readonly
            />
          </div>
        </CardContent>
      </Card>

      {/* NOVO CARD: Para o alimentador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="w-6 h-6 text-blue-500" />
            Alimentador Automático
          </CardTitle>
          <CardDescription>
            Dispensar uma porção de ração para os peixes agora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full text-lg py-6"
            onClick={handleFeedNow}
            disabled={!!updating} // Desabilita o botão se qualquer ação estiver em andamento
          >
            {updating === "feeder" ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Fish className="mr-2 h-5 w-5" />
            )}
            {updating === "feeder" ? "Dispensando..." : "Alimentar Agora"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
