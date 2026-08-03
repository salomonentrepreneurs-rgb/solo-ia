export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white/30">
            <span className="text-indigo-400">✦</span>
            <span>Solo IA — Propulsé par l&apos;IA Agentique</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition">Documentation</a>
            <a href="#" className="hover:text-white/60 transition">API</a>
            <a href="#" className="hover:text-white/60 transition">Conditions</a>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}