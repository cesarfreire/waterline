"use client"

import { use, useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Log, LogList } from "@/database"


export function LogsList({ data }: { data: Promise<LogList> }) {
    const initial_data = use(data)
  const [logs, setLogs] = useState<Log[]>(initial_data.data)
  const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const res = await fetch("/api/logs")
//         const data = await res.json()
//         setLogs(data.logs)
//       } catch (error) {
//         console.error("Erro ao buscar logs:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchLogs()
//   }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[60px] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhuma ação registrada.</div>
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log._id}>
          <CardHeader>
            <CardTitle className="text-base">{log.status}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ação: {log.action} em {new Date(log.timestamp).toLocaleString("pt-BR")}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
