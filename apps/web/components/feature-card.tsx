import type React from "react";
import { GlowingEffect } from "./ui/glowing-effect";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <li className="min-h-[14rem] list-none focus-within:ring-2 focus-within:ring-blue-500 rounded-3xl transition">
      <div className="relative h-full rounded-3xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={1.7}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-white p-4 md:p-6">
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="w-fit rounded-xl border border-gray-100 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm">
              {icon}
            </div>
            <div className="space-y-2">
              <h3 className="font-sans text-xl md:text-2xl font-semibold text-gray-800 tracking-tight">
                {title}
              </h3>
              <p className="font-sans text-sm md:text-base text-gray-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default FeatureCard;
