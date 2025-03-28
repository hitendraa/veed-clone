"use client"

import { Button } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const slideData = [
  {
    id: 1,
    title: 'Add subtitles in just a click with our Auto Subtitle Generator',
    buttonText: 'Auto Subtitle',
    icon: '🎬' // Replace with actual SVG icon
  },
  {
    id: 2,
    title: 'Create consistent videos with your Brand Kit',
    buttonText: 'Brand Kit',
    icon: '🎨' // Replace with actual SVG icon
  },
  {
    id: 3,
    title: 'Dub your videos in multiple languages instantly',
    buttonText: 'Dubbing',
    icon: '🎤' // Replace with actual SVG icon
  },
  {
    id: 4,
    title: 'Edit videos online with our powerful tools',
    buttonText: 'Video Editor',
    icon: '✂️' // Replace with actual SVG icon
  },
  {
    id: 5,
    title: 'Transform your content with AI tools',
    buttonText: 'AI Tools',
    icon: '🤖' // Replace with actual SVG icon
  }
];

const HeroSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const interval = useInterval(() => {
    setActiveSlide((current) => (current + 1) % slideData.length);
  }, 3000);

  useEffect(() => {
    if (isPlaying) {
      interval.start();
    } else {
      interval.stop();
    }
    return () => interval.stop();
  }, [isPlaying]);

  const handleSlideChange = (index) => {
    setActiveSlide(index);
    setIsPlaying(false);
  };

  const handlePrevSlide = () => {
    setActiveSlide((current) => (current - 1 + slideData.length) % slideData.length);
    setIsPlaying(false);
  };

  const handleNextSlide = () => {
    setActiveSlide((current) => (current + 1) % slideData.length);
    setIsPlaying(false);
  };

  const mainVideoRef = useRef(null);
  const uiVideoRef = useRef(null);
  const svgRef = useRef(null);
  const buttonSvg1Ref = useRef(null);
  const buttonSvg2Ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (mainVideoRef.current && uiVideoRef.current && svgRef.current) {
      // Reset animations
      gsap.set([mainVideoRef.current, uiVideoRef.current, svgRef.current, buttonSvg1Ref.current, buttonSvg2Ref.current], {
        clearProps: "all"
      });

      // Initial state
      gsap.set(mainVideoRef.current, {
        width: '100%',
        height: '100%',
        left: '50%',
        xPercent: -50,
        top: '50%',
        yPercent: -50,
      });
      
      gsap.set([uiVideoRef.current, svgRef.current, buttonSvg1Ref.current, buttonSvg2Ref.current], {
        opacity: 0,
        xPercent: -30,
        scale: 0.8,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: mainVideoRef.current.parentElement,
          start: "top 70%", // Adjusted trigger point
          end: "center center",
          scrub: 1,
          toggleActions: "play none none reverse",
        }
      });

      tl.to(mainVideoRef.current, {
        width: '49%',
        height: '68%', // Adjusted height
        left: '108%',
        xPercent: -100,
        top: '90%',
        yPercent: -100,
        duration: 1,
        ease: "power2.inOut"
      })
      .to([buttonSvg1Ref.current, buttonSvg2Ref.current], {
        opacity: 1,
        yPercent: 0,
        duration: 0.3,
        ease: "power2.in"
      }, "<")
      .to(svgRef.current, {
        opacity: 1,
        xPercent: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.8")
      .to(uiVideoRef.current, {
        opacity: 1,
        xPercent: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.6");
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [activeSlide]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8"> {/* Reduced padding */}
      {/* Buttons Row */}
      <div className="flex justify-center gap-4 mb-8">
        {slideData.map((slide, index) => (
          <Button
            key={slide.id}
            onClick={() => handleSlideChange(index)}
            variant="outline"
            className={`transition-all duration-300 relative overflow-hidden
              ${activeSlide === index 
                ? 'border-blue-600 text-blue-600' 
                : 'border-gray-300 text-gray-700'
              } hover:border-t-blue-600 hover:border-r-blue-600 hover:border-b-gray-300 hover:border-l-gray-300`}
            lefticon={
              <Image
                src={`/svg/svgexport-${slide.id + 10}.svg`}
                alt={slide.buttonText}
                width={20}
                height={20}
              />
            }
          >
            {slide.buttonText}
          </Button>
        ))}
      </div>

      {/* Slide Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {slideData[activeSlide].title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Navigation Button Left */}
        <button
          onClick={handlePrevSlide}
          className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
        >
          <Image
            src="/svg/svgexport-10.svg"
            alt="Previous"
            width={24}
            height={24}
            className="rotate-180"
          />
        </button>

        {/* Slider */}
        <div className="relative bg-gray-100 rounded-xl h-[500px] overflow-hidden flex-1"> {/* Reduced height */}
          <div
            className="flex transition-transform duration-500 h-full"
            style={{ 
              transform: activeSlide === 0 ? 'none' : `translateX(-${activeSlide * 100}%)`
            }}
          >
            {/* First Slide with Special Animation */}
            <div className="min-w-full h-full relative overflow-hidden">
              {/* Button SVGs */}
              <div 
                className="absolute top-4 left-[90%] -translate-x-1/2 flex gap-4" 
                ref={buttonSvg1Ref}
              >
                <Image
                  src="/svg/svgexport-20.svg"
                  alt="Button 1"
                  width={200}
                  height={200}
                />
                <Image
                  src="/svg/svgexport-21.svg"
                  alt="Button 2"
                  width={200}
                  height={200}
                />
              </div>

              {/* SVG Element - Leftmost */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-[80px] h-[450px] flex items-center justify-center" 
                ref={svgRef}
                style={{ zIndex: 3 }}
              >
                <div className="w-full h-full relative">
                  <Image
                    src="/svg/svgexport-19.svg"
                    alt="Feature illustration"
                    fill
                    className="drop-shadow-lg object-contain"
                  />
                </div>
              </div>

              {/* UI Video - Center */}
              <div 
                className="absolute left-[8%] top-[18%] -translate-y-1/2 w-[26%] h-[28%]" 
                ref={uiVideoRef}
                style={{ zIndex: 2 }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full rounded-lg shadow-xl"
                >
                  <source src="/videos/HP_Autosubtitles_UI.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Main Video - Right */}
              <div 
                className="absolute" 
                ref={mainVideoRef}
                style={{ zIndex: 1 }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="rounded-lg shadow-lg w-full h-full object-cover"
                >
                  <source src="/videos/HP_Autosubtitles.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            {/* Other slides */}
            {slideData.slice(1).map((slide) => (
              <div
                key={slide.id}
                className="min-w-full h-full flex items-center justify-center"
              >
                <div className="text-2xl">Slide {slide.id} Content</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Button Right */}
        <button
          onClick={handleNextSlide}
          className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
        >
          <Image
            src="/svg/svgexport-10.svg"
            alt="Next"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;