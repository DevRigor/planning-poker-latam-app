"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function SuccessBanner() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 5000) // Hide after 5 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          🎉 ¡Aplicación funcionando correctamente! Firebase configurado y conectado.
        </AlertDescription>
      </Alert>
    </div>
  )
}
