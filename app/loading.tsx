export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="relative flex items-center justify-center mb-6">
        <div className="h-16 w-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 animate-pulse flex items-center justify-center shadow-2xl shadow-blue-500/20">
          <span className="font-extrabold text-lg text-blue-400 font-mono tracking-wider">PAS</span>
        </div>
        <div className="absolute -inset-2 rounded-2xl border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold tracking-wide text-slate-200">
          Passport Automation System
        </h3>
        <p className="text-xs text-slate-500 animate-pulse">
          Connecting to secure government servers...
        </p>
      </div>
    </div>
  );
}
