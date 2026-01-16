import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Coins, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { campusImages } from '@/data/campusImages';

// HOW TO ADD YOUR OWN IMAGES MANUALLY:
// 1. Create a folder named 'public' or 'assets' in your project root.
// 2. Save your image files there (e.g., 'main-block.jpg').
// 3. Replace the HTTPS links below with your local path (e.g., '/assets/main-block.jpg').

const heroImages = campusImages;

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  // Helper to handle broken image links when testing local paths
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://via.placeholder.com/1920x800?text=Image+Not+Found+(Check+Path)";
  };

  return (
    <div className="relative w-full group">
      {/* Hero Image Slider */}
      <div className="w-full h-[400px] md:h-[600px] relative overflow-hidden bg-gray-900">
        {heroImages.map((img, index) => (
            <div 
                key={img.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
                <img 
                    src={img.src} 
                    alt={img.alt}
                    onError={handleImageError}
                    className="w-full h-full object-cover opacity-80"
                />
            </div>
        ))}
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-24 items-center z-10">
             <h2 className="text-white text-3xl md:text-6xl font-bold mb-4 shadow-sm text-center tracking-tight animate-fade-in-up">
                Empowering Knowledge
             </h2>
             <p className="text-gray-200 text-lg md:text-xl shadow-sm text-center max-w-3xl px-4 animate-fade-in-up delay-100">
                 Join a community of innovators and leaders at Srinivasa Ramanujan Institute of Technology.
             </p>
        </div>

        {/* Navigation Arrows */}
        <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-primary/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
        >
            <ChevronRight size={24} />
        </button>

        {/* Dots Indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {heroImages.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white'}`}
                />
            ))}
        </div>
      </div>

      {/* Quick Access Cards - Overlaying */}
      <div className="relative -mt-16 z-30 container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLinkCard 
            title="Courses Offered" 
            icon={<BookOpen size={32} />} 
            image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=400" 
          />
          <QuickLinkCard 
            title="Admission Procedure" 
            icon={<FileText size={32} />} 
            image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400" 
          />
          <QuickLinkCard 
            title="Fees Structure" 
            icon={<Coins size={32} />} 
            image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400" 
          />
          <QuickLinkCard 
            title="Scholarships" 
            icon={<GraduationCap size={32} />} 
            image="https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&q=80&w=400" 
          />
      </div>
    </div>
  );
};

interface QuickLinkCardProps {
    title: string;
    icon: React.ReactNode;
    image: string;
}

const QuickLinkCard: React.FC<QuickLinkCardProps> = ({ title, icon, image }) => {
    return (
        <div className="group relative h-40 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            {/* Background Image */}
            <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-primary/80 group-hover:bg-primary/90 transition-colors flex flex-col items-center justify-center text-white p-4">
                <div className="mb-2 transform group-hover:scale-110 transition-transform duration-300 bg-white/20 p-2 rounded-full">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-center leading-tight">{title}</h3>
                <div className="h-0.5 w-0 bg-white group-hover:w-1/2 transition-all duration-300 mt-2"></div>
            </div>
        </div>
    )
}
