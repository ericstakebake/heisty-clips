import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

// Same families the app loads in app/_layout.tsx, copied from
// @expo-google-fonts into public/fonts.
const FONTS = [
  'ChakraPetch_700Bold',
  'ChakraPetch_600SemiBold',
  'ChakraPetch_500Medium',
  'Archivo_500Medium',
  'Archivo_600SemiBold',
  'Archivo_700Bold',
];

const handle = delayRender('Loading brand fonts');

Promise.all(
  FONTS.map(async (family) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${family}.ttf`)})`);
    // FontFaceSet.add is in every browser Remotion renders with, but this
    // TypeScript DOM lib does not declare it.
    (document.fonts as unknown as { add(font: FontFace): void }).add(await face.load());
  })
)
  .then(() => continueRender(handle))
  .catch((err) => cancelRender(err));
