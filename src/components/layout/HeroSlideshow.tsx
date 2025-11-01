"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSlide } from '@/types';
import { getAllHeroSlides } from '@/utils/imageManagementUtils';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const HeroSlideshow = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Fetch active slides from utility
    const activeSlides = getAllHeroSlides().filter(s => s.isActive);
    setSlides(activeSlides);
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (slides.length === 0) {
    // Fallback if no slides are configured
    return (
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to CustomPrint
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Start designing your unique products today!
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Browse Products
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {slides.map((slide, index) => (
            <div className="embla__slide relative h-full flex-shrink-0 w-full" key={slide.id}>
              {/* Background Image */}
              <img 
                src={slide.imageUrl} 
                alt={slide.heading} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Overlay and Content */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-in fade-in duration-500">
                    {slide.heading}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 animate-in fade-in duration-700">
                    {slide.subheading}
                  </p>
                  <Link to={slide.buttonLink}>
                    <Button 
                      size="lg" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 animate-in fade-in duration-1000"
                    >
                      {slide.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white"
            onClick={scrollPrev}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white"
            onClick={scrollNext}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
          
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index === selectedIndex ? "bg-white w-6" : "bg-white/50"
                )}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlideshow;