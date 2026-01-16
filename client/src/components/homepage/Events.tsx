import React from 'react';

const events = [
    { id: 1, title: 'Mini Project Expo', category: 'EEE', image: 'https://picsum.photos/400/300?random=11' },
    { id: 2, title: 'Health Awareness Program', category: 'SRIT', image: 'https://picsum.photos/400/300?random=12' },
    { id: 3, title: 'Workshop on IPR', category: 'IIC Cell', image: 'https://picsum.photos/400/300?random=13' },
    { id: 4, title: 'Annual Sports Meet', category: 'Sports', image: 'https://picsum.photos/400/300?random=14' },
];

export const Events: React.FC = () => {
  return (
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-primary mb-12 uppercase tracking-wide">Events</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer h-64">
                        <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded w-fit mb-2 font-bold">{event.category}</span>
                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-8">
                <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-2 rounded-full font-medium transition-all">
                    View All Events
                </button>
            </div>
        </div>
    </section>
  );
};
