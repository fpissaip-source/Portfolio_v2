import type { OrbProject } from './project-orbs'

/**
 * Color system shared between the desktop 3D constellation and the mobile
 * card row, so both read as the same visual language:
 *   - hero: GuardianGrid — the one blue-violet gradient node
 *   - blue: live/client work
 *   - violet: AI/automation work
 *   - muted: concepts & research — desaturated, deliberately quieter
 */
export type Role = 'hero' | 'blue' | 'violet' | 'muted'

const ROLE_BY_NAME: Record<string, Role> = {
  GuardianGrid: 'hero',
  'TaxiBB Essen': 'blue',
  Bewerbungsbot: 'violet',
  StudyForge: 'violet',
  'Team Operations Suite': 'muted',
  'Automation Systems': 'muted',
}

export function roleFor(p: Pick<OrbProject, 'name'>): Role {
  return ROLE_BY_NAME[p.name] ?? 'blue'
}

export const ROLE_COLORS: Record<Role, { core: string; glow: string; ring: string }> = {
  hero: { core: '#9b8cf0', glow: 'rgba(155,140,240,0.55)', ring: '#b3a8f5' },
  blue: { core: '#7da5eb', glow: 'rgba(125,165,235,0.45)', ring: '#8fb4f2' },
  violet: { core: '#a78bfa', glow: 'rgba(167,139,250,0.45)', ring: '#b79cfb' },
  muted: { core: '#8b86a3', glow: 'rgba(139,134,163,0.35)', ring: '#9d97b5' },
}

/** Size tier per project — drives both the 3D node scale and any visual
 *  weight cues on mobile. */
export type Tier = 'hero' | 'large' | 'medium' | 'small'

const TIER_BY_NAME: Record<string, Tier> = {
  GuardianGrid: 'hero',
  'TaxiBB Essen': 'large',
  Bewerbungsbot: 'large',
  StudyForge: 'medium',
  'Team Operations Suite': 'medium',
  'Automation Systems': 'small',
}

export function tierFor(p: Pick<OrbProject, 'name'>): Tier {
  return TIER_BY_NAME[p.name] ?? 'medium'
}
