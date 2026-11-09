import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { cine, clock, cutFor, money } from './theme';

// ── Timeline (frames at 30fps) ─────────────────────────────────────────────
const HOOK_EXIT = 72;
const DAY1 = 84; // board starts filling
const RUN_IN = 188; // your run panel appears
const RUN_START = 198; // clock starts
const RUN_END = 288; // clock stops
const LAND = 300; // your row lands on the board
const DAY1_EXIT = 392;
const DAY2 = 424;
const DAY2_LAND = 466;
const DAY2_EXIT = 508;
const END = 516;
export const CROWN_RACE_FRAMES = 600;

// ── Layout (1080 x 1920) ───────────────────────────────────────────────────
// Side margin and vertical bounds keep everything clear of the TikTok / Reels
// interface (caption and buttons cover roughly the bottom 420px and top 220px).
const M = 96;
const CONTENT_W = 1080 - M * 2;
const HEADER_TOP = 250;
const BOARD_TOP = 540;
const ROW_H = 112;
const ROW_PITCH = 128;
const LOWER_TOP = 1212;

// ── Data ───────────────────────────────────────────────────────────────────
// Illustrative heists. Cuts are computed with the game's real formula
// (market value minus 0.1% per adjusted second), values sit inside the real
// daily range, and the numbering follows the real puzzle epoch.
type Player = { name: string; secs: number; at: number; you?: boolean };
type Day = { no: number; title: string; value: number; players: Player[] };

const DAY_ONE: Day = {
  no: 178,
  title: 'The Emerald at Vane Hall',
  value: 640_000,
  players: [
    { name: 'Jo', secs: 298, at: DAY1 + 8 },
    { name: 'Sam', secs: 363, at: DAY1 + 26 },
    { name: 'Maya', secs: 252, at: DAY1 + 44 },
    { name: 'Dad', secs: 221, at: DAY1 + 64 },
    { name: 'You', secs: 225, at: LAND, you: true },
  ],
};

const DAY_TWO: Day = {
  no: 179,
  title: 'The Ledger at Orrin Bank',
  value: 1_180_000,
  players: [
    { name: 'Sam', secs: 312, at: DAY2 + 6 },
    { name: 'Jo', secs: 280, at: DAY2 + 10 },
    { name: 'Maya', secs: 238, at: DAY2 + 14 },
    { name: 'Dad', secs: 213, at: DAY2 + 18 },
    { name: 'You', secs: 209, at: DAY2_LAND, you: true },
  ],
};

const gapToCrown = (day: Day): number => {
  const you = day.players.find((p) => p.you)!;
  const best = Math.min(...day.players.filter((p) => !p.you).map((p) => p.secs));
  return you.secs - best;
};

// ── Helpers ────────────────────────────────────────────────────────────────
const useSpringAt = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, stiffness = 140): number =>
    frame < at
      ? 0
      : spring({ frame: frame - at, fps, config: { damping: 18, stiffness, mass: 0.8 } });
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Fixed-width digit cells so counting numbers do not jitter sideways.
const Digits: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <span style={{ display: 'inline-flex' }}>
    {[...text].map((ch, i) => (
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: /\d/.test(ch) ? size * 0.62 : undefined,
          textAlign: 'center',
        }}
      >
        {ch}
      </span>
    ))}
  </span>
);

// The lucide "Crown" glyph the app's leaderboard uses, filled as a held crown.
const Crown: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
    <path d="M5 21h14" fill="none" />
  </svg>
);

const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: cine.bg }}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(900px 700px at 50% -120px, rgba(255,226,170,0.13), rgba(255,226,170,0) 70%)',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(1200px 1500px at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
      }}
    />
  </AbsoluteFill>
);

// ── Hook ───────────────────────────────────────────────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpringAt();
  if (frame > HOOK_EXIT + 12) return null;
  const exit = interpolate(frame, [HOOK_EXIT, HOOK_EXIT + 12], [0, 1], clamp);
  const lines = [
    { text: 'Same heist.', at: 3 },
    { text: 'Same clock.', at: 19 },
    { text: 'One crown.', at: 37 },
  ];
  const crownIn = s(37, 220);
  return (
    <AbsoluteFill
      style={{
        paddingLeft: M,
        paddingRight: M,
        justifyContent: 'center',
        opacity: 1 - exit,
        transform: `translateY(${-70 * exit}px)`,
      }}
    >
      <div style={{ height: 150, opacity: crownIn, transform: `scale(${0.5 + 0.5 * crownIn})`, transformOrigin: 'left bottom' }}>
        <Crown size={132} color={cine.textHeading} />
      </div>
      {lines.map((l) => {
        const p = s(l.at);
        return (
          <div
            key={l.text}
            style={{
              fontFamily: cine.fontDisplay,
              fontSize: 132,
              lineHeight: 1.12,
              color: cine.textHeading,
              opacity: p,
              transform: `translateY(${(1 - p) * 46}px)`,
            }}
          >
            {l.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Day scene: heist header + live board ───────────────────────────────────
const Header: React.FC<{ day: Day }> = ({ day }) => (
  <div
    style={{
      position: 'absolute',
      left: M,
      top: HEADER_TOP,
      width: CONTENT_W,
      boxSizing: 'border-box',
      padding: '34px 40px 36px',
      borderRadius: 28,
      backgroundColor: cine.surface,
      boxShadow: cine.heroLight,
    }}
  >
    <div style={{ fontFamily: cine.fontTextSemi, fontSize: 34, color: cine.textSecondary }}>
      Heist #{day.no}
    </div>
    <div style={{ fontFamily: cine.fontDisplay, fontSize: 54, lineHeight: 1.2, color: cine.textHeading, marginTop: 6 }}>
      {day.title}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 20 }}>
      <span style={{ fontFamily: cine.fontText, fontSize: 34, color: cine.textSecondary }}>Market value</span>
      <span style={{ fontFamily: cine.fontDisplaySemi, fontSize: 46, color: cine.money }}>{money(day.value)}</span>
    </div>
  </div>
);

const Board: React.FC<{ day: Day }> = ({ day }) => {
  const frame = useCurrentFrame();
  const s = useSpringAt();
  const { players, value } = day;

  // The crown sits in the top slot; it pops each time a new leader arrives.
  const firstAt = Math.min(...players.map((p) => p.at));
  let bestSoFar = Infinity;
  const leadChanges = [...players]
    .sort((a, b) => a.at - b.at)
    .filter((p) => (p.secs < bestSoFar ? ((bestSoFar = p.secs), true) : false))
    .map((p) => p.at);
  const lastChange = Math.max(...leadChanges.filter((t) => t <= frame), -1000);
  const pop = interpolate(frame - lastChange, [0, 5, 18], [0, 1, 0], clamp);
  const youLead = players.some((p) => p.you && p.at <= frame && p.secs === Math.min(...players.map((q) => q.secs)));

  return (
    <div style={{ position: 'absolute', left: M, top: BOARD_TOP, width: CONTENT_W }}>
      {players.map((p) => {
        if (frame < p.at) return null;
        const enter = s(p.at);
        // A row slides down one slot for each faster player who has arrived.
        const index = players.reduce((n, q) => (q !== p && q.secs < p.secs ? n + s(q.at) : n), 0);
        const rank = Math.round(index) + 1;
        const nameColor = p.you ? cine.money : cine.textPrimary;
        return (
          <div
            key={p.name}
            style={{
              position: 'absolute',
              top: index * ROW_PITCH,
              left: 0,
              width: CONTENT_W,
              height: ROW_H,
              boxSizing: 'border-box',
              padding: '0 28px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 22,
              backgroundColor: p.you ? cine.surfaceRaised : cine.surface,
              boxShadow: p.you
                ? `${cine.cardLight}, 0 0 0 2px rgba(55,215,141,0.55), 0 0 44px rgba(46,232,143,0.18)`
                : cine.cardLight,
              opacity: enter,
              transform: `translateX(${(1 - enter) * 70}px) scale(${0.96 + 0.04 * enter})`,
              // Players are listed in arrival order: the newest row rides on
              // top while the rows it overtakes slide down beneath it.
              zIndex: players.indexOf(p) + 1,
            }}
          >
            <div style={{ width: 84, fontFamily: cine.fontDisplaySemi, fontSize: 42, color: p.you ? cine.money : cine.textMuted }}>
              {rank === 1 ? '' : rank}
            </div>
            <div style={{ flex: 1, fontFamily: p.you ? cine.fontTextBold : cine.fontTextSemi, fontSize: 42, color: nameColor }}>
              {p.name}
            </div>
            <div style={{ width: 110, textAlign: 'right', fontFamily: cine.fontText, fontSize: 32, color: cine.textMuted }}>
              {clock(p.secs)}
            </div>
            <div style={{ width: 250, textAlign: 'right', fontFamily: cine.fontDisplaySemi, fontSize: 42, color: cine.money }}>
              {money(cutFor(value, p.secs))}
            </div>
          </div>
        );
      })}
      {frame >= firstAt ? (
        <div
          style={{
            position: 'absolute',
            left: 22,
            top: (ROW_H - 60) / 2,
            zIndex: players.length + 1,
            opacity: s(firstAt),
            transform: `scale(${1 + 0.42 * pop}) rotate(${-8 * pop}deg)`,
            filter: youLead ? 'drop-shadow(0 0 18px rgba(243,236,221,0.55))' : undefined,
          }}
        >
          <Crown size={60} color={cine.textHeading} />
        </div>
      ) : null}
    </div>
  );
};

const DayScene: React.FC<{ day: Day; start: number; exitAt: number; children?: React.ReactNode }> = ({
  day,
  start,
  exitAt,
  children,
}) => {
  const frame = useCurrentFrame();
  const s = useSpringAt();
  if (frame < start || frame > exitAt + 12) return null;
  const enter = s(start);
  const exit = interpolate(frame, [exitAt, exitAt + 12], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 90 - exit * 90}px)`,
      }}
    >
      <Header day={day} />
      <Board day={day} />
      {children}
    </AbsoluteFill>
  );
};

// ── Lower zone: caption, your run, callouts ────────────────────────────────
const Lower: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const s = useSpringAt();
  if (frame < from || frame > to + 8) return null;
  const enter = s(from, 180);
  const exit = interpolate(frame, [to, to + 8], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: M,
        top: LOWER_TOP,
        width: CONTENT_W,
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 40 - exit * 24}px)`,
      }}
    >
      {children}
    </div>
  );
};

const STAGES = [
  { label: 'Recon', color: cine.stage.recon, doneAt: 72 },
  { label: 'Breach', color: cine.stage.breach, doneAt: 150 },
  { label: 'Vault', color: cine.stage.vault, doneAt: 225 },
];

const RunPanel: React.FC<{ day: Day }> = ({ day }) => {
  const frame = useCurrentFrame();
  const you = day.players.find((p) => p.you)!;
  const t = interpolate(frame, [RUN_START, RUN_END], [0, you.secs], clamp);
  const started = frame >= RUN_START;
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: '30px 40px 34px',
        borderRadius: 28,
        backgroundColor: cine.surfaceRaised,
        boxShadow: cine.heroLight,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: cine.fontText, fontSize: 32, color: cine.textSecondary }}>Your time</div>
          <div style={{ fontFamily: cine.fontDisplay, fontSize: 112, lineHeight: 1.1, color: cine.textHeading }}>
            <Digits text={clock(t)} size={112} />
          </div>
        </div>
        <div style={{ textAlign: 'right', paddingBottom: 14 }}>
          <div style={{ fontFamily: cine.fontText, fontSize: 32, color: cine.textSecondary }}>Your cut</div>
          <div
            style={{
              fontFamily: cine.fontDisplay,
              fontSize: 68,
              lineHeight: 1.2,
              color: cine.money,
              textShadow: `0 0 28px ${cine.moneyGlow}`,
            }}
          >
            <Digits text={money(cutFor(day.value, t))} size={68} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
        {STAGES.map((st, i) => {
          const done = t >= st.doneAt;
          const active = started && !done && (i === 0 || t >= STAGES[i - 1].doneAt);
          return (
            <div
              key={st.label}
              style={{
                flex: 1,
                height: 58,
                borderRadius: 29,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: cine.fontTextSemi,
                fontSize: 30,
                color: done ? cine.bg : active ? st.color : cine.textMuted,
                backgroundColor: done ? st.color : 'transparent',
                boxShadow: `inset 0 0 0 2px ${done || active ? st.color : cine.border}`,
              }}
            >
              {st.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Callout: React.FC<{ big: string; small: string; bigSize?: number }> = ({ big, small, bigSize = 124 }) => (
  <div>
    <div style={{ fontFamily: cine.fontDisplay, fontSize: bigSize, lineHeight: 1.08, color: cine.textHeading }}>{big}</div>
    <div style={{ fontFamily: cine.fontTextSemi, fontSize: 54, lineHeight: 1.25, color: cine.textSecondary, marginTop: 10 }}>
      {small}
    </div>
  </div>
);

const NextDay: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpringAt();
  const from = DAY1_EXIT + 6;
  if (frame < from || frame > DAY2 + 6) return null;
  const enter = s(from, 220);
  const exit = interpolate(frame, [DAY2 - 4, DAY2 + 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: M, opacity: enter * (1 - exit) }}>
      <div
        style={{
          fontFamily: cine.fontDisplay,
          fontSize: 148,
          color: cine.textHeading,
          transform: `translateY(${(1 - enter) * 50 - exit * 60}px)`,
        }}
      >
        Next day.
      </div>
    </AbsoluteFill>
  );
};

// ── End card ───────────────────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpringAt();
  if (frame < END) return null;
  const part = (delay: number): React.CSSProperties => {
    const p = s(END + delay);
    return { opacity: p, transform: `translateY(${(1 - p) * 36}px)` };
  };
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 120 }}>
      <Img
        src={staticFile('icon.png')}
        style={{ width: 208, height: 208, borderRadius: 48, boxShadow: '0 24px 70px rgba(0,0,0,0.6)', ...part(0) }}
      />
      {/* Same text treatment as the in-app wordmark (app/index.tsx). */}
      <div
        style={{
          fontFamily: cine.fontDisplay,
          fontSize: 148,
          letterSpacing: 18,
          paddingLeft: 18,
          color: cine.textHeading,
          marginTop: 44,
          ...part(5),
        }}
      >
        HEISTY
      </div>
      <div style={{ fontFamily: cine.fontText, fontSize: 42, color: cine.textSecondary, marginTop: 6, ...part(10) }}>
        Pull jobs. Get rich. Become a legend.
      </div>
      <div style={{ fontFamily: cine.fontTextSemi, fontSize: 54, color: cine.textPrimary, marginTop: 110, ...part(18) }}>
        A new heist every day.
      </div>
      <div
        style={{
          marginTop: 40,
          padding: '26px 60px',
          borderRadius: 60,
          backgroundColor: cine.money,
          boxShadow: `0 0 60px ${cine.moneyGlow}`,
          fontFamily: cine.fontDisplay,
          fontSize: 62,
          color: cine.bg,
          ...part(24),
        }}
      >
        heisty.games
      </div>
    </AbsoluteFill>
  );
};

// ── Composition ────────────────────────────────────────────────────────────
export const CrownRace: React.FC = () => {
  const gap = gapToCrown(DAY_ONE);
  const lead = -gapToCrown(DAY_TWO);
  return (
    <AbsoluteFill>
      <Background />
      <Hook />
      <DayScene day={DAY_ONE} start={DAY1} exitAt={DAY1_EXIT}>
        <Lower from={DAY1 + 12} to={RUN_IN - 10}>
          <div style={{ fontFamily: cine.fontTextSemi, fontSize: 56, lineHeight: 1.25, color: cine.textSecondary }}>
            Your crew already ran it.
          </div>
        </Lower>
        <Lower from={RUN_IN} to={LAND - 2}>
          <RunPanel day={DAY_ONE} />
        </Lower>
        <Lower from={LAND + 12} to={DAY1_EXIT}>
          <Callout big={`${gap} seconds`} small="off the crown." />
        </Lower>
      </DayScene>
      <NextDay />
      <DayScene day={DAY_TWO} start={DAY2} exitAt={DAY2_EXIT}>
        <Lower from={DAY2_LAND + 12} to={DAY2_EXIT}>
          <Callout big="Today it's yours." small={`${lead} seconds faster than Dad.`} bigSize={92} />
        </Lower>
      </DayScene>
      <EndCard />
    </AbsoluteFill>
  );
};
