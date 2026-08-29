interface ParallaxBackgroundProps {
  isBlurred?: boolean;
}

export default function ParallaxBackground({ isBlurred = false }: ParallaxBackgroundProps) {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-20 pointer-events-none select-none">
      {/* Base theme background:
          Light mode = "Gwen" theme (white + soft pink + light blue)
          Dark mode  = "Miles Morales" theme (black + deep red + purple undertone) */}
      <div
        className="absolute inset-0 w-full h-full transition-colors duration-1000
          bg-gradient-to-br from-white via-rose-gold-50 to-arcade-cyan-100
          dark:from-black dark:via-red-950 dark:to-arcade-purple-950"
      />

      {/* Soft decorative glow accents (kept subtle so they never fight with text contrast) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-arcade-cyan-300 dark:opacity-20 dark:bg-red-700" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-rose-gold-300 dark:opacity-20 dark:bg-arcade-purple-700" />

      {/* Optional dim overlay used when a modal is open, to keep foreground content readable */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          isBlurred ? 'backdrop-blur-md bg-white/40 dark:bg-black/55' : ''
        }`}
      />
    </div>
  );
}
