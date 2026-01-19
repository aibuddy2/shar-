
import React from 'react';

const Splash: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-[999]">
      <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center shadow-2xl animate-bounce mb-8">
        <span className="text-blue-600 text-6xl font-bold">ရှာ</span>
      </div>
      <h1 className="text-white text-3xl font-bold mb-2">ရှာ (Shar)</h1>
      <p className="text-blue-100 text-sm tracking-widest opacity-80">လိုအပ်တာရှာ</p>
      
      <div className="mt-12 flex space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default Splash;
