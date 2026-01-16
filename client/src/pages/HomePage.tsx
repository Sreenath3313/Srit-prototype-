import React from 'react';
import { Header } from '@/components/homepage/Header';
import { Hero } from '@/components/homepage/Hero';
import { About } from '@/components/homepage/About';
import { Notifications } from '@/components/homepage/Notifications';
import { Events } from '@/components/homepage/Events';
import { Facilities } from '@/components/homepage/Facilities';
import { Partners } from '@/components/homepage/Partners';
import { Footer } from '@/components/homepage/Footer';
import { CampusGallery } from '@/components/homepage/CampusGallery';
import { MessageCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <CampusGallery />
        <About />
        <Notifications />
        <Events />
        <Facilities />
        <Partners />
      </main>
      <Footer />
      
      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 group">
         <div className="absolute bottom-16 right-0 bg-white shadow-xl p-3 rounded-lg w-48 text-center text-sm mb-2 hidden group-hover:block border border-gray-200 animate-fade-in">
             <p className="font-bold text-gray-800">Need Help?</p>
             <p className="text-gray-600">Chat with us!</p>
         </div>
         <button className="bg-primary hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center w-14 h-14">
             <MessageCircle size={28} fill="currentColor" />
         </button>
      </div>
    </div>
  );
};

export default HomePage;
