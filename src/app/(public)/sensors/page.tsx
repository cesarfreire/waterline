import SensorHistory from "@/components/sensor-history";
import { getHistorySensorData } from "@/database";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function SensorsPage() {
  const initialHistoryData = getHistorySensorData("temperature", {});
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold p-6 pb-0">Histórico dos Sensores</h1>
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
        <SensorHistory initialData={initialHistoryData} />
      </Suspense>
    </div>
  );
}
