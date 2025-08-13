"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, Copy, CheckCircle, Shield } from "lucide-react"
import { useState } from "react"

export function DatabaseRulesGuide() {
  const [copied, setCopied] = useState(false)

  const rules = `{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}`

  const copyRules = async () => {
    try {
      await navigator.clipboard.writeText(rules)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  const openRulesPage = () => {
    window.open("https://console.firebase.google.com/project/planning-poker-v0/database/rules", "_blank")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Shield className="h-5 w-5" />
            Problema de Reglas de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de permisos de Database</AlertTitle>
            <AlertDescription>
              Tu Realtime Database existe, pero las reglas de seguridad están bloqueando el acceso. Necesitas configurar
              las reglas para permitir acceso a usuarios autenticados.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              ¡Tu Database está funcionando!
            </h3>
            <p className="text-sm text-blue-800">Confirmamos que tu Realtime Database está creado y funcionando en:</p>
            <code className="block bg-white p-2 rounded mt-2 text-xs">
              https://planning-poker-v0-default-rtdb.firebaseio.com/
            </code>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Pasos para configurar las reglas:</h3>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">1. Copia las reglas de seguridad:</span>
                <Button
                  onClick={copyRules}
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
              <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto">{rules}</pre>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">2. Abrir página de reglas:</span>
                <Button
                  onClick={openRulesPage}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Reglas
                </Button>
              </div>
              <p className="text-sm text-gray-600">Se abrirá la página de reglas de tu Realtime Database</p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <span className="font-medium">3. Reemplazar las reglas:</span>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
                <li>En la página que se abre, verás un editor de reglas</li>
                <li>Selecciona todo el contenido actual (Ctrl+A)</li>
                <li>Pega las reglas que copiaste (Ctrl+V)</li>
                <li>Haz clic en "Publicar" o "Publish"</li>
              </ol>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <span className="font-medium">4. Verificar y probar:</span>
              <p className="text-sm text-gray-600 mt-1">
                Después de publicar las reglas, regresa a esta aplicación y recárgala. El acceso a la base de datos
                debería funcionar correctamente.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 ¿Qué hacen estas reglas?</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>
                • <strong>".read": "auth != null"</strong> - Solo usuarios autenticados pueden leer datos
              </li>
              <li>
                • <strong>".write": "auth != null"</strong> - Solo usuarios autenticados pueden escribir datos
              </li>
              <li>
                • <strong>"rooms"</strong> - Aplica estas reglas solo a la sección "rooms" de la database
              </li>
            </ul>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Importante:</strong> Estas reglas son seguras para producción ya que requieren autenticación, pero
              permiten que cualquier usuario autenticado acceda a las salas. Para mayor seguridad, puedes configurar
              reglas más específicas más adelante.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button onClick={() => window.location.reload()} className="w-full" size="lg">
              Recargar página después de configurar reglas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
