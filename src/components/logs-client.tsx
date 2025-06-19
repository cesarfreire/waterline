"use client";

import { use, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Log, LogList } from "@/database";

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
      {logs.map((log) => (
        <Card key={log._id}>
          <CardHeader>
            <CardTitle className="text-base">{log.status}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ação: {log.action} em{" "}
              {new Date(log.timestamp).toLocaleString("pt-BR")}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
