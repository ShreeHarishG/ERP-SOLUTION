export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/10 to-transparent rounded-full animate-pulse"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Loading data...</p>
    </div>
  );
}
