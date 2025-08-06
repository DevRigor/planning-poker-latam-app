"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, CheckCircle, Clock } from "lucide-react"
import { useState } from "react"

export function FirebaseSetupGuide() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "1. Habilitar Authentication",
      description: "Ve a Firebase Console > Authentication > Sign-in method",
      action: "Habilitar proveedor de Google",
      link: "https://console.firebase.google.com/project/planning-poker-latam-app/authentication/providers",
      completed: false,
    },
    {
      title: "2. Crear Realtime Database",
      description: "Ve a Firebase Console > Realtime Database",
      action: "Crear base de datos",
      link: "https://console.firebase.google.com/project/planning-poker-latam-app/database",
      completed: false,
    },
    {
      title: "3. Configurar reglas de seguridad",
      description: "Configurar reglas para usuarios autenticados",
      action: "Configurar reglas",
      link: "https://console.firebase.google.com/project/planning-poker-latam-app/database/rules",
      completed: false,
    },
    {
      title: "4. Añadir dominios autorizados",
      description: "Añadir v0.dev a dominios autorizados",
      action: "Configurar dominios",
      link: "https://console.firebase.google.com/project/planning-poker-latam-app/authentication/settings",
      completed: false,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Configuración de Firebase Requerida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de configuración detectado</AlertTitle>
            <AlertDescription>
              El proveedor de autenticación de Google no está habilitado en tu proyecto de Firebase. Sigue estos pasos
              para configurarlo:
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
            <h4 className="font-medium mb-2">Paso 1 detallado - Habilitar Google Authentication:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Haz clic en el botón "Habilitar proveedor de Google" arriba</li>
              <li>En la página que se abre, haz clic en "Google"</li>
              <li>Activa el toggle "Enable"</li>
              <li>Configura un email de soporte (tu email)</li>
              <li>Haz clic en "Save"</li>
              <li>Regresa a esta aplicación y recarga la página</li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Reglas de seguridad para Realtime Database:</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              {`{
  "rules": {
    "room": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}`}
            </pre>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Importante:</strong> Después de completar cada paso, recarga esta página para verificar que la
              configuración sea correcta.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
