"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Database, HardDrive } from "lucide-react"
import { ParkingAPI } from "@/lib/parking-api"

export function StorageIndicator() {
  const [storageMode, setStorageMode] = useState<"mysql" | "localStorage" | null>(null)

  useEffect(() => {
    const checkStorage = async () => {
      const mode = await ParkingAPI.getStorageMode()
      setStorageMode(mode)
    }

    checkStorage()
  }, [])

  if (!storageMode) return null

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-2 ${
        storageMode === "mysql"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-yellow-50 text-yellow-700 border-yellow-200"
      }`}
    >
      {storageMode === "mysql" ? (
        <>
          <Database className="h-3 w-3" />
          MySQL Conectado
        </>
      ) : (
        <>
          <HardDrive className="h-3 w-3" />
          Modo Local
        </>
      )}
    </Badge>
  )
}
