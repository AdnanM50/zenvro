

const Navbar = () => {
  return (
  <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 pointer-events-none">
    <div className="flex items-center pointer-events-auto">
      <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
        <span className="material-symbols-outlined text-xl">menu</span>
      </button>
    </div>
    
    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
      <h1 className="text-xl md:text-2xl font-black tracking-tight text-black italic">VELOUR</h1>
    </div>
    
    <div className="flex items-center gap-2 pointer-events-auto">
      <button className="hidden md:flex w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
        <span className="material-symbols-outlined text-xl">search</span>
      </button>
      <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
        <span className="material-symbols-outlined text-xl">shopping_bag</span>
      </button>
      <button className="hidden md:flex w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
        <span className="material-symbols-outlined text-xl">person</span>
      </button>
    </div>
  </header>

  )
}

export default Navbar