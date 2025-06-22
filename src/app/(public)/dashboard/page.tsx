import { SectionCardsClient } from "@/components/sensors-cards";
import { getDashboardData } from "@/database";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export const revalidate = 0;

export default function DashboardPage() {
  const dashboardDataPromise = getDashboardData();
  return (
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
      <SectionCardsClient data={dashboardDataPromise} />
    </Suspense>
  );
}
