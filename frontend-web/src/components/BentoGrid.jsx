import React from 'react';

const categories = [
  { id: 1, title: "SOC MANAGÉ", size: "large", bg: "bg-blue-900/20" },
  { id: 2, title: "EDR SHIELD", size: "small", bg: "bg-cyan-900/20" },
  { id: 3, title: "XDR UNIFIED", size: "small", bg: "bg-purple-900/20" },
  { id: 4, title: "AUDIT & PENTEST", size: "small", bg: "bg-emerald-900/20" },
  { id: 5, title: "CONSULTING", size: "small", bg: "bg-slate-800/50" },
];

const BentoGrid = () => {
  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-20 mt-32">
      <h2 className="text-3xl font-bold text-cyna-text mb-8">Nos domaines d'expertise</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[600px]">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            className={`
              relative group overflow-hidden rounded-3xl border border-white/5 bg-cyna-steel
              hover:border-cyna-cyan/40 transition-all duration-300 cursor-pointer
              ${cat.size === 'large' ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'}
            `}
          >
            {/* Background Overlay (Image placeholder) */}
            <div className={`absolute inset-0 ${cat.bg} opacity-40 group-hover:opacity-20 transition-opacity duration-300`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-cyna-navy via-transparent to-transparent"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-2xl font-bold text-cyna-white group-hover:text-cyna-cyan transition-colors">
                {cat.title}
              </h3>
              <div className="w-0 group-hover:w-full h-1 bg-cyna-cyan mt-4 transition-all duration-500"></div>
            </div>
            
            {/* Zoom effect on hover */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 scale-95 group-hover:scale-100 transition-all duration-500 rounded-3xl"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BentoGrid;