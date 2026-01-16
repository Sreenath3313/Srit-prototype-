import React from 'react';
import { ArrowRight } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section className="py-16 bg-secondary text-white relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
                <pattern id="pattern-circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <circle cx="25" cy="25" r="10" fill="currentColor" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
            </svg>
        </div>

        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 relative z-10">
            {/* Text Content */}
            <div className="lg:w-1/2">
                <div className="mb-4">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">About SRIT</span>
                    <h2 className="text-4xl font-bold mt-2 mb-6">Welcome to SRIT</h2>
                    <div className="w-20 h-1 bg-primary mb-6"></div>
                </div>
                <div className="space-y-4 text-gray-300 leading-relaxed text-justify">
                    <p>
                        This Society was established by Founder-cum-Secretary Sri Aluru Sambasiva Reddy in November 2007 in memory of his mother, Late Smt. Aluru Narayanamma, to give shape to his firm belief that "EDUCATION IS A KEY ENABLER FOR PROGRESS".
                    </p>
                    <p>
                        This belief has shaped his entire life — he himself excelled in his scholastic years and then became a tutor, teaching students not only his subject but also imparting higher human values. As his career progressed, he wanted to ensure that maximum students from rural and developing areas could derive benefit from this credo.
                    </p>
                </div>
                <button className="mt-8 bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded font-medium transition-colors flex items-center group">
                    Read More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Image Content */}
            <div className="lg:w-1/2">
                <div className="bg-white p-4 rounded-lg shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <img 
                        src="https://picsum.photos/600/400?random=10" 
                        alt="Talent Visionary Award Certificate" 
                        className="w-full h-auto rounded border border-gray-200"
                    />
                    <div className="mt-4 text-center">
                        <h4 className="text-gray-800 font-bold text-lg">Talent Visionary Award</h4>
                        <p className="text-gray-500 text-sm">Awarded by Salesforce for Excellence</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};
