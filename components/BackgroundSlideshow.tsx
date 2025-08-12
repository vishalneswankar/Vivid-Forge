import React, { useState, useEffect } from 'react';

const backgroundImages = [
  'https://images.unsplash.com/photo-1553095066-501467b0f4d2?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?q=80&w=2400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549225841-9841b80894f6?q=80&w=2400&auto=format&fit=crop'
];

export const BackgroundSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 10000); // Change image every 10 seconds

    return () => clearInterval(intervalId);
  }, []); // Run only once on mount

  return (
    <div className="fixed inset-0 w-screen h-screen -z-10" aria-hidden="true">
      {backgroundImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/20" /> 
    </div>
  );
};