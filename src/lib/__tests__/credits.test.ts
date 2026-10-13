import { describe, it, expect } from 'vitest'
import {
  getCreditsTeam,
  fisherYatesShuffle,
  LEAD_MEMBER,
  PEER_MEMBERS,
  ALL_TEAM_MEMBERS,
} from '../credits'

describe('credits.ts - Team Members & Fisher-Yates Shuffle', () => {
  it('guarantees Vardaan is always at index 0', () => {
    for (let i = 0; i < 50; i++) {
      const team = getCreditsTeam()
      expect(team[0].name).toBe('Vardaan')
      expect(team[0].initial).toBe('V')
    }
  })

  it('contains all three team names exactly once', () => {
    const expectedNames = ['Vardaan', 'Shashank', 'Raina Deep']

    for (let i = 0; i < 50; i++) {
      const team = getCreditsTeam()
      expect(team).toHaveLength(3)

      const names = team.map((m) => m.name)
      expect(names.sort()).toEqual([...expectedNames].sort())

      // Exactly once check
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(3)
    }
  })

  it('returns a valid permutation of the original team input', () => {
    const team = getCreditsTeam()
    const allNames = ALL_TEAM_MEMBERS.map((m) => m.name)
    const resultNames = team.map((m) => m.name)

    expect(resultNames.sort()).toEqual(allNames.sort())
  })

  it('fisherYatesShuffle produces permutations without mutating original array', () => {
    const original = ['A', 'B', 'C', 'D']
    const shuffled = fisherYatesShuffle(original)

    expect(shuffled).toHaveLength(4)
    expect(shuffled.sort()).toEqual([...original].sort())
    expect(original).toEqual(['A', 'B', 'C', 'D']) // Not mutated
  })

  it('fisherYatesShuffle handles empty and single-element arrays gracefully', () => {
    expect(fisherYatesShuffle([])).toEqual([])
    expect(fisherYatesShuffle(['alone'])).toEqual(['alone'])
  })

  it('can produce both peer orderings depending on RNG', () => {
    // Deterministic RNG where peer order is not swapped
    const team1 = getCreditsTeam(() => 0.99)
    // Deterministic RNG where peer order is swapped
    const team2 = getCreditsTeam(() => 0.01)

    expect(team1[0].name).toBe(LEAD_MEMBER.name)
    expect(team2[0].name).toBe(LEAD_MEMBER.name)

    const peerNames1 = team1.slice(1).map((m) => m.name)
    const peerNames2 = team2.slice(1).map((m) => m.name)

    // At least one of the combinations will differ between RNG outputs
    expect(peerNames1.sort()).toEqual(PEER_MEMBERS.map((m) => m.name).sort())
    expect(peerNames2.sort()).toEqual(PEER_MEMBERS.map((m) => m.name).sort())
  })
})
