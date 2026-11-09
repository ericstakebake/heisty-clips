import React from 'react';
import { Composition } from 'remotion';
import { CrownRace, CROWN_RACE_FRAMES } from './CrownRace';

// 9:16 at 30fps: the native format for TikTok, Reels and Shorts.
export const Root: React.FC = () => (
  <Composition
    id="CrownRace"
    component={CrownRace}
    durationInFrames={CROWN_RACE_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
