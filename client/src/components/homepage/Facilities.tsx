import React from 'react';
import { Library, Briefcase, Trophy, Bus, UserCheck } from 'lucide-react';

export const Facilities: React.FC = () => {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-primary mb-12 uppercase">Facilities</h2>
            <div className="flex flex-wrap justify-center gap-6">
                <FacilityCard title="Internships" icon={<Briefcase size={32} />} />
                <FacilityCard title="Modern Library" icon={<Library size={32} />} />
                <FacilityCard title="Expert Faculty" icon={<UserCheck size={32} />} />
                <FacilityCard title="Sports" icon={<Trophy size={32} />} />
                <FacilityCard title="Transportation" icon={<Bus size={32} />} />
            </div>
        </div>
    </section>
  );
};

const FacilityCard: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex flex-col items-center justify-center w-40 h-40 bg-secondary text-white rounded-lg shadow-lg hover:bg-primary transition-colors duration-300 cursor-pointer group">
        <div className="mb-3 transform group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-medium text-sm text-center px-2">{title}</span>
    </div>
);
