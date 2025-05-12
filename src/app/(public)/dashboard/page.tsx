import SectionActions from "@/components/section-actions";
import { SectionCards } from "@/components/section-cards";
import { SectionCardsClient } from "@/components/sensors-cards-client";
import { Separator } from "@/components/ui/separator";
import { getLatestSensorData } from "@/database";
import { Suspense } from "react";

export default function DashboardPage() {
  const data = getLatestSensorData();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SectionCardsClient data={data} />
    </Suspense>
  );
}
