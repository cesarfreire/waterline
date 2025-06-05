import SectionActions from "@/components/section-actions";
import { SectionCardsClient } from "@/components/sensors-cards-client";
import { Separator } from "@/components/ui/separator";
import { getDashboardData, getLatestSensorData } from "@/database";
import { Suspense } from "react";

export default function DashboardPage() {
  const dashboardDataPromise = getDashboardData();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SectionCardsClient data={dashboardDataPromise} />
    </Suspense>
  );
}
