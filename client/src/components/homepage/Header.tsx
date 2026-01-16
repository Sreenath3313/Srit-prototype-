import React from 'react';
import { Phone, Mail, User, BookOpen, Download, HelpCircle, GraduationCap, ChevronDown, Menu, X } from 'lucide-react';
import { NavItem } from '@/types/homepage';
import { latestNews } from '@/data/news';

const navItems: NavItem[] = [
  { label: 'Home' },
  { label: 'About Us', hasDropdown: true },
  { label: 'Admissions', hasDropdown: true },
  { label: 'Academics', hasDropdown: true },
  { label: 'Campus Life', hasDropdown: true },
  { label: 'Student Chapters', hasDropdown: true },
  { label: 'Examination', hasDropdown: true },
  { label: 'Placements', hasDropdown: true },
  { label: 'Committees', hasDropdown: true },
  { label: 'Community Services', hasDropdown: true },
];

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="w-full flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 print:hidden">
        <div className="flex space-x-4 items-center">
          <div className="flex items-center space-x-1">
            <Phone size={14} />
            <span>91-951 561 1111</span>
          </div>
          <div className="flex items-center space-x-1 border-l border-white/30 pl-4">
            <Mail size={14} />
            <span>hr@srit.ac.in</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 items-center">
          <a href="/login" className="flex items-center space-x-1 hover:text-gray-200">
            <User size={14} /> <span>Login Here</span>
          </a>
          <span className="hidden md:inline">|</span>
          <a href="#" className="flex items-center space-x-1 hover:text-gray-200">
            <BookOpen size={14} /> <span>Degree Verification</span>
          </a>
          <span className="hidden md:inline">|</span>
          <a href="#" className="flex items-center space-x-1 hover:text-gray-200">
            <Download size={14} /> <span>Downloads</span>
          </a>
          <span className="hidden md:inline">|</span>
          <a href="#" className="flex items-center space-x-1 hover:text-gray-200">
            <HelpCircle size={14} /> <span>Contact Us</span>
          </a>
        </div>
      </div>

      {/* Main Banner Area */}
      <div className="bg-white px-2 md:px-4 py-2 border-b-4 border-primary/20">
        <div className="container mx-auto">
            {/* Desktop Banner Layout */}
            <div className="hidden md:flex flex-row items-stretch border border-orange-500 p-1 bg-white">
                
                {/* Left Logo Box */}
                <div className="w-[140px] flex-shrink-0 flex flex-col items-center border border-gray-300 mr-4 relative">
                    <div className="flex-grow flex flex-col items-center justify-center p-2">
                        {/* Logo Circle */}
                        <div className="w-16 h-16 rounded-full bg-[#d84e18] flex items-center justify-center mb-1 overflow-hidden relative">
                             {/* Abstract Bird/Swoosh */}
                             <svg viewBox="0 0 100 100" className="w-full h-full p-2 text-black fill-current">
                                <path d="M20 50 Q 50 20 80 50 T 90 40" stroke="black" strokeWidth="5" fill="none" />
                                <path d="M15 55 Q 40 60 60 40" stroke="black" strokeWidth="3" fill="none" />
                             </svg>
                        </div>
                        {/* SRIT Box */}
                        <div className="border border-orange-500 px-2 py-0.5 mb-0.5">
                            <span className="text-2xl font-bold text-gray-800 tracking-wide block leading-none">SRIT</span>
                        </div>
                        <div className="text-[0.6rem] text-gray-600 font-medium text-center leading-tight">
                            Empowering Knowledge
                        </div>
                    </div>
                    {/* Autonomous Tag */}
                    <div className="w-full bg-[#d84e18] text-white text-center text-[0.65rem] font-bold py-1 mt-auto uppercase tracking-wider">
                        AUTONOMOUS
                    </div>
                </div>

                {/* Right Text Content */}
                <div className="flex-grow flex flex-col justify-center text-center font-serif">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight scale-y-105 mb-1">
                        Srinivasa Ramanujan Institute of Technology
                    </h1>
                    <div className="text-sm font-bold text-gray-800 tracking-[0.2em] uppercase mb-1">
                        AUTONOMOUS
                    </div>
                    <div className="text-lg text-gray-800 border-b border-orange-400 pb-1 mb-1 inline-block mx-auto px-8">
                        Rotarypuram Village, BK Samudram Mandal, Ananthapuramu - 515701
                    </div>
                    <div className="text-base font-bold text-gray-800 flex items-center justify-center gap-1.5 flex-wrap">
                        <span>Accredited by</span>
                        <span className="text-[#d84e18]">NBA</span>
                        <span>&</span>
                        <span className="text-[#d84e18]">NAAC</span>
                        <span>with</span>
                        <span className="text-[#d84e18]">"A" Grade</span>
                        <span>, Affiliated to</span>
                        <span className="text-[#d84e18]">JNTUA</span>
                        <span>, Ananthapuramu</span>
                    </div>
                </div>
            </div>

            {/* Mobile Banner Layout (Simplified) */}
            <div className="md:hidden flex flex-col items-center text-center space-y-2 py-2">
                 <div className="flex items-center gap-3">
                     <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center border-2 border-primary text-primary font-bold text-lg">SRIT</div>
                     <div className="text-left">
                         <h1 className="text-xl font-bold font-serif leading-tight text-gray-900">Srinivasa Ramanujan</h1>
                         <h2 className="text-lg font-serif text-gray-800">Institute of Technology</h2>
                     </div>
                 </div>
                 <div className="text-xs text-gray-600 font-medium">Ananthapuramu - 515701</div>
                 <div className="text-xs font-bold text-primary">Autonomous | NBA & NAAC 'A' Grade</div>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center md:hidden py-3">
                 <span className="font-bold text-gray-700">Menu</span>
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                 </button>
            </div>
            <nav className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row justify-center md:items-center w-full`}>
                {navItems.map((item, index) => (
                    <div key={index} className="group relative">
                        <a href="#" className="block py-3 px-4 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 md:hover:bg-transparent transition-colors flex items-center justify-between md:justify-start">
                            {item.label}
                            {item.hasDropdown && <ChevronDown size={14} className="ml-1" />}
                        </a>
                        {/* Dropdown Mock */}
                        {item.hasDropdown && (
                            <div className="hidden group-hover:block absolute left-0 top-full w-48 bg-white shadow-lg border-t-2 border-primary py-2 z-50">
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Overview</a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Details</a>
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
      </div>

      {/* Ticker */}
      <div className="bg-primary text-white py-2 overflow-hidden relative flex items-center ticker-wrapper">
          <div className="absolute left-0 bg-primary z-10 px-4 py-2 font-bold shadow-lg whitespace-nowrap">
              LATEST NEWS
          </div>
          <div className="w-full overflow-hidden flex pl-32">
              <div className="ticker-text text-sm font-medium whitespace-nowrap inline-block">
                  {latestNews} {latestNews}
              </div>
          </div>
      </div>
    </header>
  );
};
