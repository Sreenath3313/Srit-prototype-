import React from 'react';

export const Partners: React.FC = () => {
  return (
    <section className="py-12 bg-secondary text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-500">Industry Partners For Placements</h2>
        </div>
        
        {/* Simple Marquee Implementation */}
        <div className="relative w-full overflow-hidden">
             <div className="flex space-x-12 animate-marquee whitespace-nowrap items-center">
                 {/* Duplicated list for seamless scrolling */}
                 {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex space-x-12">
                        <PartnerLogo name="Palo Alto" />
                        <PartnerLogo name="EC-Council" />
                        <PartnerLogo name="EPAM" />
                        <PartnerLogo name="EduSkills" />
                        <PartnerLogo name="Salesforce" />
                        <PartnerLogo name="Wipro" />
                        <PartnerLogo name="TCS" />
                        <PartnerLogo name="Infosys" />
                    </div>
                 ))}
             </div>
        </div>
    </section>
  );
};

const PartnerLogo: React.FC<{ name: string }> = ({ name }) => (
    <div className="bg-white text-secondary font-bold text-xl px-8 py-4 rounded shadow-lg min-w-[200px] text-center flex items-center justify-center h-20">
        {name}
    </div>
);
