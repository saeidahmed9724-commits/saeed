import { useEffect, useState } from 'react';

interface ParallaxBackgroundProps {
  isBlurred?: boolean;
}

export default function ParallaxBackground({ isBlurred = false }: ParallaxBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-20 pointer-events-none select-none">
      {/* Permanent High-Quality Couple Background */}
      <div
        className="absolute inset-0 w-full h-[120%] bg-cover bg-center transition-all duration-1000 ease-out bg-zoom"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/utefkiln/image/upload/v1784470650/ebjbtyayuuyguqlwbtxz.jpg')`,
          transform: `translateY(${scrollY * 0.15}px)`,
        }}
      />
      
      {/* Gaussian Blur and Overlay Layer */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
          isBlurred ? 'backdrop-blur-md bg-black/40' : 'backdrop-blur-[2px] bg-black/25'
        }`}
      />

      {/* Decorative soft vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/30" />
    </div>
  );
}
