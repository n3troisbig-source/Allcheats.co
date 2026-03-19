import { ChevronDown, Zap, Shield, Eye } from 'lucide-react';

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-grid px-4 pt-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Status badge */}
        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-red-primary/30 bg-red-primary/10 px-4 py-1.5 text-sm text-red-light">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          All Systems Operational
        </div>

        <h1 className="animate-fade-in-up mb-4 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
          Welcome to{' '}
          <span className="glow-text text-red-light">Allcheats.co</span>
        </h1>

        <p className="animate-fade-in-up mx-auto mb-8 max-w-2xl text-lg text-gray-400 sm:text-xl" style={{ animationDelay: '0.2s' }}>
          Premium AI-powered gaming software. Dominate every lobby with our cutting-edge AI Aimbot, ESP, Recoil Control System, and more.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-in-up mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => scrollTo('products')}
            className="animate-pulse-glow rounded-xl bg-red-primary px-8 py-3.5 text-base font-bold text-white transition hover:bg-red-hover"
          >
            Browse Products
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="rounded-xl border border-dark-400 bg-dark-700 px-8 py-3.5 text-base font-semibold text-gray-300 transition hover:border-red-primary/50 hover:text-white"
          >
            Learn More
          </button>
        </div>

        {/* Quick stats */}
        <div className="animate-fade-in-up grid grid-cols-3 gap-4 sm:gap-8" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dark-500 bg-dark-800/60 p-4 backdrop-blur-sm">
            <Zap className="h-6 w-6 text-red-light" />
            <span className="text-lg font-bold text-white leading-tight text-center">AI Powered</span>
            <span className="text-xs text-gray-500">Aimbot</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dark-500 bg-dark-800/60 p-4 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-red-light" />
            <span className="text-2xl font-bold text-white">24/7</span>
            <span className="text-xs text-gray-500">Undetected</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dark-500 bg-dark-800/60 p-4 backdrop-blur-sm">
            <Eye className="h-6 w-6 text-red-light" />
            <span className="text-2xl font-bold text-white">ESP</span>
            <span className="text-xs text-gray-500">Visual</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => scrollTo('products')}>
        <ChevronDown className="h-6 w-6 text-gray-500" />
      </div>
    </section>
  );
}
