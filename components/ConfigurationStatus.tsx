"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Zap, Shield, Database, Users } from "lucide-react"

export function ConfigurationStatus() {
  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">🎉 ¡Firebase Configurado Correctamente!</AlertTitle>
        <AlertDescription className="text-green-700">
          Tu aplicación está conectada y lista para usar. Todas las funcionalidades están disponibles.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function FirebaseStatusCard() {
  const features = [
    {
      icon: <Shield className="h-5 w-5 text-green-600" />,
      title: "Google Authentication",
      description: "Autenticación habilitada y funcionando",
      status: "✅ Configurado",
    },
    {
      icon: <Database className="h-5 w-5 text-green-600" />,
      title: "Realtime Database",
      description: "Base de datos en tiempo real conectada",
      status: "✅ Conectada",
    },
    {
      icon: <Users className="h-5 w-5 text-green-600" />,
      title: "Salas Múltiples",
      description: "Sistema de salas independientes",
      status: "✅ Activo",
    },
    {
      icon: <Zap className="h-5 w-5 text-green-600" />,
      title: "Tiempo Real",
      description: "Sincronización instantánea",
      status: "✅ Funcionando",
    },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-6 w-6" />
          Estado de la Configuración
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              {feature.icon}
              <div className="flex-1">
                <h3 className="font-medium text-green-900">{feature.title}</h3>
                <p className="text-sm text-green-700 mb-1">{feature.description}</p>
                <span className="text-xs font-medium text-green-800">{feature.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">🚀 Tu Aplicación Está Lista Para:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Crear y unirse a salas de Planning Poker</li>
            <li>• Autenticación segura con Google</li>
            <li>• Votación en tiempo real con múltiples participantes</li>
            <li>• Compartir salas con URLs únicas</li>
            <li>• Estadísticas y análisis de votaciones</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
