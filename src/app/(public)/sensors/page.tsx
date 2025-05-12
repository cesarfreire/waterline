import SensorHistory from "@/components/sensor-history"
import { SectionCardsClient } from "@/components/sensors-cards-client"
import { getLatestSensorData } from "@/database"
import { Suspense } from "react"

export default function SensorsPage() {

    const data = getLatestSensorData()
    return (
        <SensorHistory />
    )
}
