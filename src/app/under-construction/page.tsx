export default function UnderConstruction() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-white/10 bg-white/5">
          <span className="material-symbols-outlined text-4xl text-white/40">construction</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">Under Construction</h1>
        <p className="text-neutral-500 text-lg font-light">expected to complete before 2027</p>
        <a
          href="/"
          className="inline-block mt-8 bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all"
        >
          Back Home
        </a>
      </div>
    </div>
  );
}
