export function calculateVoteAverage(votes: Record<string, string>): number | null {
  const voteValues = Object.values(votes)

  if (voteValues.length === 0) return null

  // Filter out non-numeric votes (like "☕")
  const numericVotes = voteValues.filter((vote) => vote !== "☕" && !isNaN(Number(vote))).map((vote) => Number(vote))

  if (numericVotes.length === 0) return null

  const sum = numericVotes.reduce((acc, vote) => acc + vote, 0)
  return Math.round((sum / numericVotes.length) * 10) / 10 // Round to 1 decimal place
}

export function getVoteDistribution(votes: Record<string, string>): Record<string, number> {
  const distribution: Record<string, number> = {}

  Object.values(votes).forEach((vote) => {
    distribution[vote] = (distribution[vote] || 0) + 1
  })

  return distribution
}

export function getMostCommonVote(votes: Record<string, string>): string | null {
  const distribution = getVoteDistribution(votes)
  const entries = Object.entries(distribution)

  if (entries.length === 0) return null

  return entries.reduce((a, b) => (distribution[a[0]] > distribution[b[0]] ? a : b))[0]
}
