import React from 'react';
import { NotificationItem, PlacementItem } from '@/types/homepage';

const circulars: NotificationItem[] = [
    { id: 1, title: 'Circular - Holiday - SANKRANTHI FESTIVAL', date: 'Jan 12' },
    { id: 2, title: 'Circular - Class work Suspended', date: 'Jan 10' },
    { id: 3, title: 'Circular - 25/12/2025 - Holiday - Christmas', date: 'Dec 24' },
    { id: 4, title: 'Circular - Holiday - DIWALI FESTIVAL', date: 'Oct 20' },
    { id: 5, title: 'Circular - Holiday - DUSSERA FESTIVAL', date: 'Oct 05' },
];

const exams: NotificationItem[] = [
    { id: 1, title: 'RESULTS RELEASED NOTIFICATION - II M.TECH', date: 'Jan 15' },
    { id: 2, title: 'RESULTS RELEASED NOTIFICATION - I B.TECH', date: 'Jan 10' },
    { id: 3, title: 'SEE - TIME TABLE - I M.TECH I SEM', date: 'Jan 05' },
    { id: 4, title: 'Revised Time Table - I B.TECH', date: 'Jan 02' },
];

const placements: PlacementItem[] = [
    { id: 1, company: 'Lyzr AI India Pvt Ltd', offers: 1 },
    { id: 2, company: 'Tata Consultancy Services (NQT)', offers: 164 },
    { id: 3, company: 'Celestica (India) Pvt Ltd', offers: 1 },
    { id: 4, company: 'Lumen Technologies', offers: 4 },
    { id: 5, company: 'Mahindra and Mahindra', offers: 1 },
    { id: 6, company: 'Cognizant Technology Solutions', offers: 98 },
];

export const Notifications: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-primary mb-12 uppercase tracking-wide">Notifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Circulars */}
                <NotificationCard title="Circulars" icon="📋">
                    <ul className="divide-y divide-gray-200">
                        {circulars.map((item) => (
                            <li key={item.id} className="py-3 px-4 hover:bg-gray-50 transition-colors text-sm text-gray-700 flex justify-between">
                                <span className="line-clamp-2">{item.title}</span>
                                {item.date && <span className="text-xs text-primary font-bold whitespace-nowrap ml-2">{item.date}</span>}
                            </li>
                        ))}
                    </ul>
                    <div className="p-2 text-center border-t">
                        <a href="#" className="text-xs text-blue-600 hover:underline">View All Circulars</a>
                    </div>
                </NotificationCard>

                {/* Examination */}
                <NotificationCard title="Examination" icon="📝">
                    <ul className="divide-y divide-gray-200">
                        {exams.map((item) => (
                            <li key={item.id} className="py-3 px-4 hover:bg-gray-50 transition-colors text-sm text-gray-700">
                                {item.title}
                            </li>
                        ))}
                    </ul>
                     <div className="p-2 text-center border-t">
                        <a href="#" className="text-xs text-blue-600 hover:underline">View All Notifications</a>
                    </div>
                </NotificationCard>

                {/* Placements */}
                <NotificationCard title="Placements 2024-25" icon="💼">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-orange-100 text-gray-700 font-bold">
                                <tr>
                                    <th className="px-4 py-2">Company</th>
                                    <th className="px-4 py-2 text-right">Offers</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {placements.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{item.company}</td>
                                        <td className="px-4 py-2 text-right font-bold text-primary">{item.offers}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="p-2 text-center border-t">
                        <a href="#" className="text-xs text-blue-600 hover:underline">View Placement Records</a>
                    </div>
                </NotificationCard>
            </div>
        </div>
    </section>
  );
};

interface NotificationCardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title, icon, children }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="bg-primary text-white py-3 px-4 flex items-center space-x-2">
                <span>{icon}</span>
                <h3 className="font-bold text-lg">{title}</h3>
            </div>
            <div className="flex-grow overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300">
                {children}
            </div>
        </div>
    );
};
