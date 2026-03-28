import React from 'react';

const Hero = () => {
  return (
    <div className="bg-background font-sans text-on-surface selection:bg-primary-fixed selection:text-white overflow-x-hidden min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-6 pointer-events-none">
        <div className="flex items-center pointer-events-auto">
          <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
          <h1 className="text-2xl font-black tracking-tight text-black italic">VELOUR</h1>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-xl">person</span>
          </button>
        </div>
      </header>

      <main className="relative min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 relative grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-0">
          
          {/* Left Side Text Content */}
          <div className="col-span-full md:col-span-4 z-20 flex flex-col justify-between h-full py-10 md:py-20">
            <div className="space-y-12 md:space-y-48">
              <div className="hero-text text-black">
                where<br />- style
              </div>
              
              <div className="space-y-8 md:space-y-12">
                <p className="font-mono text-[10px] md:text-xs tracking-widest text-neutral-500 uppercase font-bold">// FASHION</p>
                <p className="text-sm leading-relaxed max-w-[240px] text-neutral-600">
                  Explore curated collections, exclusive drops, and everyday essentials all thoughtfully designed in one stylish shopping destination.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[10px] md:text-xs tracking-tight text-neutral-500">/ New</p>
                  <p className="font-mono text-[10px] md:text-xs tracking-tight text-neutral-500">Collection 2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Central Image */}
          <div className="col-span-full md:col-span-4 flex justify-center z-10 md:-mx-32 pointer-events-none">
            <div className="relative w-full md:w-[130%] aspect-square md:aspect-auto group pointer-events-auto">
              <img 
                alt="High-fashion model" 
                className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-1000 ease-in-out" 
                style={{ 
                  maskImage: 'radial-gradient(circle, black 60%, transparent 95%)',
                  WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 95%)'
                }}
                src="/hero/model.png" 
              />
            </div>
          </div>

          {/* Right Side Text Content */}
          <div className="col-span-full md:col-span-4 z-20 flex flex-col justify-between h-full py-10 md:py-20 items-start md:items-end text-left md:text-right">
            <div className="space-y-12 md:space-y-24 w-full">
              <div className="flex flex-col items-start md:items-end w-full">
                <p className="font-mono text-[10px] md:text-xs tracking-widest text-neutral-500 uppercase font-bold mb-4 md:mb-8 leading-tight">// STYLED FOR<br />LIFE.</p>
                <div className="hero-text text-black">
                  lives<br />- now
                </div>
              </div>
              
              <div className="pt-6 md:pt-12 space-y-12 md:space-y-20">
                <div className="flex items-center justify-start md:justify-end gap-3">
                  <div className="flex -space-x-3">
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="/hero/avatar1.png" alt="Avatar" />
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="/hero/avatar2.png" alt="Avatar" />
                  </div>
                  <button className="w-10 h-10 rounded-full bg-primary-fixed text-white flex items-center justify-center shadow-lg hover:rotate-90 transition-transform duration-300">
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
                
                <div className="flex justify-start md:justify-end md:pr-12">
                  <span className="material-symbols-outlined text-primary-fixed text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>local_florist</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-4xl md:text-5xl font-black tracking-tighter">280K</p>
                  <p className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">PEOPLE WE INSPIRE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;
