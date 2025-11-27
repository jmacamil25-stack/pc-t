import React from 'react';

interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ icon, text }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-5 hover:scale-110 cursor-pointer">
      <div className="bg-blue-100 text-[#1E63FF] rounded-full p-4 mb-4 transition-transform duration-500 hover:rotate-[360deg] hover:scale-110">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#002B60]">{text}</h3>
    </div>
  );
};

export default TrustBadge;