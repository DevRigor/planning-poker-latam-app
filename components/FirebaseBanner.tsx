"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export function FirebaseBanner() {
  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Firebase Configurado</AlertTitle>
        <AlertDescription className="text-green-700">
          Aplicación conectada a Firebase con autenticación real y base de datos en tiempo real.
        </AlertDescription>
      </Alert>
    </div>
  )
}
