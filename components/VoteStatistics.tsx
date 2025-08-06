"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users } from "lucide-react"
import { calculateVoteAverage, getVoteDistribution, getMostCommonVote } from "@/utils/voteCalculations"

interface VoteStatisticsProps {
  votes: Record<string, string>
  participants: Record<string, any>
}

export const VoteStatistics = memo(function VoteStatistics({ votes, participants }: VoteStatisticsProps) {
  const average = calculateVoteAverage(votes)
  const distribution = getVoteDistribution(votes)
  const mostCommon = getMostCommonVote(votes)
  const totalVotes = Object.keys(votes).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estadísticas de Votación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{average !== null ? average : "N/A"}</div>
              <div className="text-sm text-blue-800">Promedio</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-600 font-mono">{mostCommon || "N/A"}</div>
              <div className="text-sm text-green-800">Más Común</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{totalVotes}</div>
              <div className="text-sm text-purple-800">Total Votos</div>
            </div>
          </div>

          {/* Vote Distribution */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Distribución de Votos
            </h4>
            <div className="space-y-2">
              {Object.entries(distribution)
                .sort(([a], [b]) => {
                  // Sort numerically, with "☕" at the end
                  if (a === "☕") return 1
                  if (b === "☕") return -1
                  return Number(a) - Number(b)
                })
                .map(([vote, count]) => {
                  const percentage = Math.round((count / totalVotes) * 100)
                  return (
                    <div key={vote} className="flex items-center justify-between p-2 rounded bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono min-w-[40px] justify-center">
                          {vote}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">
                            {count} voto{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[35px]">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Additional insights */}
          {average !== null && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-sm text-yellow-800">
                <strong>💡 Insight:</strong>{" "}
                {average <= 2
                  ? "El equipo estima que es una tarea simple."
                  : average <= 5
                    ? "El equipo considera que es una tarea de complejidad media."
                    : "El equipo piensa que es una tarea compleja que requiere más análisis."}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
