"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, CheckCircle, Database, Clock } from "lucide-react"
import { useState } from "react"

export function DatabaseSetupGuide() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "1. Ir a Realtime Database",
      description: "Ve a Firebase Console > Realtime Database",
      action: "Abrir Database",
      link: "https://console.firebase.google.com/project/planning-poker-v0/database",
      completed: false,
    },
    {
      title: "2. Crear Database",
      description: "Haz clic en 'Create database'",
      action: "Crear Database",
      link: "https://console.firebase.google.com/project/planning-poker-v0/database",
      completed: false,
    },
    {
      title: "3. Configurar modo",
      description: "Selecciona 'Start in test mode'",
      action: "Configurar modo",
      link: "https://console.firebase.google.com/project/planning-poker-v0/database",
      completed: false,
    },
    {
      title: "4. Seleccionar región",
      description: "Elige 'us-central1' (recomendado)",
      action: "Seleccionar región",
      link: "https://console.firebase.google.com/project/planning-poker-v0/database",
      completed: false,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Database className="h-5 w-5" />
            Realtime Database No Habilitado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error: Service database is not available</AlertTitle>
            <AlertDescription>
              Realtime Database no está habilitado en tu proyecto de Firebase. Necesitas crearlo para que la aplicación
              funcione.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  index === currentStep
                    ? "border-blue-500 bg-blue-50"
                    : index < currentStep
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {index < currentStep ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : index === currentStep ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                  <Button
                    onClick={() => {
                      window.open(step.link, "_blank")
                      if (index === currentStep && index < steps.length - 1) {
                        setTimeout(() => setCurrentStep(index + 1), 2000)
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {step.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📋 Pasos detallados:</h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Haz clic en "Abrir Database" arriba</li>
              <li>
                En la página que se abre, haz clic en <strong>"Create database"</strong>
              </li>
              <li>
                Selecciona <strong>"Start in test mode"</strong> (para desarrollo)
              </li>
              <li>
                Elige la región <strong>"us-central1"</strong> (recomendado)
              </li>
              <li>
                Haz clic en <strong>"Enable"</strong>
              </li>
              <li>Espera a que se cree la base de datos</li>
              <li>Regresa a esta aplicación y recarga la página</li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">🔧 Reglas de seguridad (después de crear):</h4>
            <p className="text-sm text-yellow-800 mb-2">
              Una vez creada la base de datos, ve a la pestaña "Rules" y usa estas reglas:
            </p>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              {`{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}`}
            </pre>
          </div>

          <Alert>
            <AlertDescription>
              <strong>💡 Importante:</strong> Después de crear Realtime Database, recarga esta página. La aplicación
              detectará automáticamente que está disponible.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button onClick={() => window.location.reload()} className="w-full" size="lg">
              Recargar página después de crear Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
