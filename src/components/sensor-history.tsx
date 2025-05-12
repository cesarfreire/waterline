"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SensorType = "temperature" | "water_temperature" | "humidity" | "water_level"

type SensorRecord = {
  timestamp: string
  value: number
}

export default function SensorHistory() {
  const [selectedSensor, setSelectedSensor] = useState<SensorType>("temperature")
  const [data, setData] = useState<SensorRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedSensor) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/sensors/history?sensor=${selectedSensor}`)
        const json = await res.json()
        setData(json.data || [])
      } catch (err) {
        console.error("Erro ao buscar dados históricos:", err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedSensor])

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-sm">
        <Label>Selecione o tipo de sensor:</Label>
        <Select onValueChange={(val: SensorType) => setSelectedSensor(val)} defaultValue="temperature">
          <SelectTrigger>
            <SelectValue placeholder="Selecione o sensor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature">Temperatura</SelectItem>
            <SelectItem value="water_temperature">Temperatura da Água</SelectItem>
            <SelectItem value="humidity">Umidade</SelectItem>
            <SelectItem value="water_level">Nível da Água</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando dados...</p>
      ) : (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} />
              <YAxis />
              <Tooltip labelFormatter={(label) => new Date(label).toLocaleString("pt-BR")} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
