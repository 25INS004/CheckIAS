import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Sparkles } from 'lucide-react';

const SectionSeparator = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({ 
      speed: 1, // Slower speed (default is often higher)
      startDelay: 0,
      stopOnInteraction: false,
      stopOnMouseEnter: true
    }) 
  ]);

  return (
    <div className="py-8 overflow-hidden bg-white dark:bg-black border-y border-gray-100 dark:border-gray-900">
      <div className="max-w-[100vw]" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {[...Array(20)].map((_, index) => (
            <div key={index} className="flex-[0_0_auto] mx-8 flex items-center gap-4 select-none">
              <span className="text-4xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-400 dark:to-white tracking-widest uppercase font-serif">
                CheckIAS
              </span>
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionSeparator;
