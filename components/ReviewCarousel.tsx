import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

// ... (reviews data remains the same)
const reviews = [
  {
    id: 1,
    name: "Sitaram",
    role: "UPSC Aspirant",
    content: "The feedback on my essay paper was incredibly detailed. The mentor pointed out structural issues I had never noticed before.",
    rating: 5,
    color: "text-blue-500"
  },
  {
    id: 2,
    name: "Ajay",
    role: "UPSC Aspirant",
    content: "Fastest evaluation service I've tried. Got my copies back in 18 hours with model answers. Highly recommended!",
    rating: 5,
    color: "text-emerald-500"
  },
  {
    id: 3,
    name: "Jagmohan",
    role: "UPSC Aspirant",
    content: "The 1-on-1 mentorship calls were a game changer. They helped me refine my answer writing strategy significantly.",
    rating: 5,
    color: "text-purple-500"
  },
  {
    id: 4,
    name: "Pankaj",
    role: "UPSC Aspirant",
    content: "Quality of evaluation is top-notch. They don't just give marks but actually tell you how to improve.",
    rating: 4,
    color: "text-orange-500"
  },
  {
    id: 5,
    name: "Anita Yadav",
    role: "UPSC Aspirant",
    content: "CheckIAS has been my constant companion. The daily targets keep me disciplined and focused.",
    rating: 5,
    color: "text-pink-500"
  }
];

const ReviewCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 bg-gray-50 dark:bg-black border-t border-gray-100 dark:border-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Our Students Say</h2>
             <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Join thousands of satisfied aspirants.</p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={scrollPrev}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollNext}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="relative" ref={emblaRef}>
          <div className="flex -ml-4 mb-12">
            {reviews.map((review) => (
              <div key={review.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 min-w-0">
                <div className="h-full bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative group flex flex-col">
                  {/* ... Card Content ... */}
                   <div className={`absolute top-6 right-8 opacity-20 group-hover:opacity-40 transition-opacity ${review.color}`}>
                    <Quote className="w-12 h-12 transform rotate-180" />
                  </div>
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 relative z-10 leading-relaxed flex-grow">
                    "{review.content}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{review.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{review.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`
                h-1.5 rounded-full transition-all duration-300 
                ${index === selectedIndex 
                  ? 'w-8 bg-indigo-600 dark:bg-indigo-400' 
                  : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewCarousel;
