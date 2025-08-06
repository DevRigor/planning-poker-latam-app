"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function ConfigChecker() {
  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className="bg-green-50 border-green-200">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Aplicación funcionando en modo demostración con autenticación simulada
        </AlertDescription>
      </Alert>
    </div>
  )
}
