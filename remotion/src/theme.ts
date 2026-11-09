// Mirror of the `cine` warm palette in src/constants/redesignTheme.ts.
// The app file reads __DEV__ and localStorage, so it cannot be imported into
// a Remotion bundle. If a token changes there, change it here.
export const cine = {
  bg: '#080706',
  surface: '#201f1a',
  surfaceRaised: '#2e2d27',
  border: 'rgba(232,223,208,0.10)',
  textPrimary: '#E8DFD0',
  textHeading: '#f3ecdd',
  textSecondary: '#aca495',
  textMuted: '#9c917f',
  money: '#37d78d',
  moneyGlow: 'rgba(46,232,143,0.45)',
  gold: '#d8ab4c',
  stage: { recon: '#37d78d', breach: '#6f97a2', vault: '#d8ab4c' },
  cardLight:
    'inset 0 1px 0 rgba(255,244,225,0.07), inset 0 48px 40px -40px rgba(255,244,225,0.05)',
  heroLight:
    'inset 0 1px 0 rgba(255,236,200,0.12), inset 0 96px 80px -64px rgba(255,226,170,0.09)',
  fontDisplay: 'ChakraPetch_700Bold',
  fontDisplaySemi: 'ChakraPetch_600SemiBold',
  fontDisplayMed: 'ChakraPetch_500Medium',
  fontText: 'Archivo_500Medium',
  fontTextSemi: 'Archivo_600SemiBold',
  fontTextBold: 'Archivo_700Bold',
} as const;

// Mirror of TIME_PENALTY_PCT_PER_SECOND in src/engine/shared/heistPayout.ts:
// each adjusted second costs 0.1% of the market value.
export const TIME_PENALTY_PCT_PER_SECOND = 0.001;

export const cutFor = (marketValue: number, adjustedSeconds: number): number =>
  Math.round(marketValue - adjustedSeconds * marketValue * TIME_PENALTY_PCT_PER_SECOND);

export const money = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`;

export const clock = (seconds: number): string => {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
