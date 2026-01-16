import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111] text-gray-400 text-sm font-sans">
        <div className="container mx-auto px-4 py-12">
            
            {/* Top Links Section */}
            <div className="border-b border-gray-800 pb-8 mb-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs uppercase tracking-wider text-gray-500">
                {['Chairperson', 'Secretary', 'Principal', 'Governing Council', 'Academic Council', 'Mandatory Disclosures', 'News Letters'].map(link => (
                    <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Departments */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4 border-b-2 border-primary inline-block pb-1">Departments</h3>
                    <ul className="space-y-2">
                        <li><FooterLink text="Computer Science Engineering (CSE)" /></li>
                        <li><FooterLink text="Electronics & Communication (ECE)" /></li>
                        <li><FooterLink text="Mechanical Engineering (MEC)" /></li>
                        <li><FooterLink text="Civil Engineering (CIV)" /></li>
                        <li><FooterLink text="Electrical & Electronics (EEE)" /></li>
                        <li><FooterLink text="CSE - AI & ML" /></li>
                        <li><FooterLink text="CSE - Data Science" /></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white text-lg font-bold mb-4 border-b-2 border-primary inline-block pb-1">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><FooterLink text="Admissions" /></li>
                        <li><FooterLink text="Placements" /></li>
                        <li><FooterLink text="Examinations" /></li>
                        <li><FooterLink text="Alumni" /></li>
                        <li><FooterLink text="Contact Us" /></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Logo & Address */}
                        <div className="flex-1">
                             <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">SRIT</div>
                                <div className="text-white font-bold leading-tight">
                                    <div>Srinivasa Ramanujan</div>
                                    <div>Institute of Technology</div>
                                </div>
                             </div>
                             <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-primary mt-1 shrink-0" />
                                    <p>Rotarypuram Village, BK Samudram Mandal,<br/>Anantapur District - 515701, AP</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-primary shrink-0" />
                                    <p>91-951 561 1111</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-primary shrink-0" />
                                    <p>hr@srit.ac.in</p>
                                </div>
                             </div>
                        </div>
                        
                        {/* Social Media */}
                        <div className="flex-1">
                             <h3 className="text-white font-bold mb-4">Connect With Us</h3>
                             <div className="flex gap-4 mb-6">
                                <SocialIcon Icon={Facebook} color="bg-blue-600" />
                                <SocialIcon Icon={Twitter} color="bg-sky-500" />
                                <SocialIcon Icon={Instagram} color="bg-pink-600" />
                                <SocialIcon Icon={Linkedin} color="bg-blue-700" />
                                <SocialIcon Icon={Youtube} color="bg-red-600" />
                             </div>
                             <p className="text-xs">
                                Please write your Comments, Feedback, Suggestions, Complaints to <a href="mailto:hr@srit.ac.in" className="text-primary hover:underline">hr@srit.ac.in</a>
                             </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                <div className="flex gap-4 mb-4 md:mb-0">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <span className="text-gray-700">|</span>
                    <a href="#" className="hover:text-white">Terms Of Use</a>
                </div>
                <div className="text-center md:text-right">
                    <p>Copyright © 2007 SRIT. All Rights Reserved. Built with <span className="text-red-500">❤</span> for College Project.</p>
                </div>
            </div>
        </div>
    </footer>
  );
};

const FooterLink: React.FC<{ text: string }> = ({ text }) => (
    <a href="#" className="flex items-center hover:text-primary transition-colors group">
        <ChevronRight size={14} className="mr-2 text-gray-600 group-hover:text-primary" />
        {text}
    </a>
);

const SocialIcon: React.FC<{ Icon: any, color: string }> = ({ Icon, color }) => (
    <a href="#" className={`${color} text-white w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}>
        <Icon size={16} />
    </a>
);
