import { Suspense } from "react";
import { LogsList } from "@/components/logs-list";
import { getLatestLogsData } from "@/database";
import { Loader2 } from "lucide-react";

export const revalidate = 0;

export default function LogsPage() {
  const initial_logs = getLatestLogsData();
  return (
    <div className="px-4 py-6 space-y-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Logs do Sistema
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualize as últimas ações e alterações realizadas no sistema.
        </p>
      </div>

      <Suspense
        fallback={
          <div>
            <div className="flex justify-center items-center h-48">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Carregando...
            </div>
          </div>
        }
      >
        <LogsList data={initial_logs} />
      </Suspense>
    </div>
  );
}
