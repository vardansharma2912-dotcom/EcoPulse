/**
 * EcoPulse Project Credits & Team Information (CHE110)
 */

export interface TeamMember {
  name: string
  role?: string
  initial: string
}

export const LEAD_MEMBER: TeamMember = {
  name: 'Vardaan',
  role: 'Lead Developer & Architecture',
  initial: 'V',
}

export const PEER_MEMBERS: TeamMember[] = [
  {
    name: 'Shashank',
    role: 'Research & Calculations',
    initial: 'S',
  },
  {
    name: 'Raina Deep',
    role: 'Environmental Studies & Content',
    initial: 'R',
  },
]

export const ALL_TEAM_MEMBERS: TeamMember[] = [LEAD_MEMBER, ...PEER_MEMBERS]

/**
 * In-place Fisher-Yates shuffle on a cloned array.
 * Accepts an optional pseudo-random generator function for unit testing.
 */
export function fisherYatesShuffle<T>(array: T[], rng: () => number = Math.random): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Returns team members where Vardaan is strictly guaranteed at index 0,
 * and the remaining peers (Shashank, Raina Deep) appear in random Fisher-Yates order.
 */
export function getCreditsTeam(rng: () => number = Math.random): TeamMember[] {
  const shuffledPeers = fisherYatesShuffle(PEER_MEMBERS, rng)
  return [LEAD_MEMBER, ...shuffledPeers]
}
