"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function DomainAuthGuide() {
  const [currentDomain, setCurrentDomain] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCurrentDomain(window.location.hostname)
  }, [])

  const copyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openFirebaseSettings = () => {
    window.open(
      "https://console.firebase.google.com/project/planning-poker-latam-app/authentication/settings",
      "_blank",
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Dominio No Autorizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de dominio</AlertTitle>
            <AlertDescription>
              El dominio <code className="bg-red-100 px-1 rounded">{currentDomain}</code> no está autorizado para
              autenticación en tu proyecto de Firebase.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              ¡Buenas noticias!
            </h3>
            <p className="text-sm text-blue-800">
              Firebase está configurado correctamente. Solo necesitas añadir este dominio a la lista de dominios
              autorizados.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Pasos para autorizar el dominio:</h3>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">1. Copia el dominio actual:</span>
                <Button
                  onClick={copyDomain}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <code className="bg-gray-100 px-3 py-2 rounded block text-center font-mono">{currentDomain}</code>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">2. Abrir configuración de Firebase:</span>
                <Button
                  onClick={openFirebaseSettings}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Firebase
                </Button>
              </div>
              <p className="text-sm text-gray-600">Se abrirá la página de configuración de Authentication</p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <span className="font-medium">3. Añadir el dominio:</span>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
                <li>En la página que se abre, busca la sección "Authorized domains"</li>
                <li>Haz clic en "Add domain"</li>
                <li>
                  Pega el dominio que copiaste: <code className="bg-gray-100 px-1">{currentDomain}</code>
                </li>
                <li>Haz clic en "Add"</li>
              </ol>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <span className="font-medium">4. Verificar y probar:</span>
              <p className="text-sm text-gray-600 mt-1">
                Después de añadir el dominio, regresa a esta página y recárgala. El login debería funcionar
                correctamente.
              </p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Nota:</strong> Los cambios en los dominios autorizados pueden tardar unos minutos en aplicarse. Si
              el error persiste, espera un momento y recarga la página.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button onClick={() => window.location.reload()} className="w-full" size="lg">
              Recargar página después de configurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
