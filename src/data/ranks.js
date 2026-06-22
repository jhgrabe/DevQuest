export const RANKS = [
  { name: 'Novice',     minXP: 0    },
  { name: 'Apprentice', minXP: 500  },
  { name: 'Adept',      minXP: 1500 },
  { name: 'Master',     minXP: 3500 },
]

export function getRank(xp) {
  return [...RANKS].reverse().find(r => xp >= r.minXP) ?? RANKS[0]
}
