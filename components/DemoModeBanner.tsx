"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function DemoModeBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Modo Demostración</AlertTitle>
        <AlertDescription className="text-blue-700">
          Esta es una demostración funcional de Planning Poker. Los datos son simulados y se almacenan localmente. Para
          usar con Firebase real, configura las variables de entorno apropiadas.
        </AlertDescription>
      </Alert>
    </div>
  )
}
