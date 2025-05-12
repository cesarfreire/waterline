"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const actions = [
  { label: "Ligar LED", value: "ACENDE_LED" },
  { label: "Apagar LED", value: "APAGA_LED" },
  { label: "Ligar Rele", value: "LIGA_RELE" },
  { label: "Desligar Rele", value: "DESLIGA_RELE" },
];

export default function ActionButtons() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const sendAction = async (action: string) => {
    try {
      setLoadingAction(action);
      const res = await fetch("/api/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao enviar ação.");
      }

      toast.success(`Ação "${action}" enviada com sucesso!`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-6">
      {actions.map(({ label, value }) => (
        <Button
          key={value}
          onClick={() => sendAction(value)}
          disabled={loadingAction === value}
          className="text-lg py-6"
        >
          {loadingAction === value ? "Enviando..." : label}
        </Button>
      ))}
    </div>
  );
}
