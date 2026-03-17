import { Crosshair, Eye, Cpu, Shield, Zap, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Crosshair,
    title: 'AI Aimbot',
    description: 'Advanced AI-powered aimbot that uses machine learning to provide natural and precise aim assistance.',
  },
  {
    icon: Eye,
    title: 'Visual ESP',
    description: 'Full visual ESP system including player outlines, health bars, distance markers, and item highlights.',
  },
  {
    icon: Cpu,
    title: 'Recoil Control (RCS)',
    description: 'AI-based recoil control system that automatically manages weapon recoil for pinpoint accuracy.',
  },
  {
    icon: Shield,
    title: 'Undetected',
    description: 'Our software uses advanced methods to remain undetected. Regular updates keep you safe from bans.',
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Receive your product key instantly after payment confirmation. No long wait times.',
  },
  {
    icon: RefreshCw,
    title: 'Regular Updates',
    description: 'We push frequent updates to ensure compatibility with the latest game patches and anti-cheat systems.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block rounded-full border border-red-primary/30 bg-red-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-red-light">
            Why Choose Us
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Powerful <span className="text-red-light">Features</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Our AI-powered tools give you the edge you need. Here's what makes Allcheats.co the best choice.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="card-hover group rounded-2xl border border-dark-500 bg-dark-800 p-6 transition hover:border-red-primary/30"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-primary/10 text-red-light transition group-hover:bg-red-primary/20">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
