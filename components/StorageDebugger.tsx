"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, RefreshCw } from "lucide-react"

export function StorageDebugger() {
  const [storageData, setStorageData] = useState<Record<string, string>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or when there are timeout issues
    const hasTimeoutData = typeof window !== "undefined" && localStorage.getItem("voteTimeoutLogout")
    setIsVisible(Boolean(hasTimeoutData))

    if (typeof window !== "undefined") {
      const data: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          data[key] = localStorage.getItem(key) || ""
        }
      }
      setStorageData(data)
    }
  }, [])

  const clearAllStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.clear()
      setStorageData({})
      window.location.reload()
    }
  }

  const refreshData = () => {
    if (typeof window !== "undefined") {
      const data: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          data[key] = localStorage.getItem(key) || ""
        }
      }
      setStorageData(data)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 max-h-60 overflow-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Debug Storage</span>
            <div className="flex gap-1">
              <Button onClick={refreshData} size="sm" variant="ghost" className="h-6 w-6 p-0">
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button onClick={clearAllStorage} size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 text-xs">
            {Object.entries(storageData).map(([key, value]) => {
              // Format timestamps for better readability
              let displayValue = value
              if (key.includes("Timestamp") && !isNaN(Number(value))) {
                const timestamp = Number(value)
                displayValue = `${value} (${new Date(timestamp).toLocaleString()})`
              }

              return (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-mono text-gray-600 text-xs">{key}:</span>
                    <span className="font-mono text-xs break-all">{displayValue}</span>
                  </div>
                </div>
              )
            })}
            {Object.keys(storageData).length === 0 && <div className="text-gray-500">No data in localStorage</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
