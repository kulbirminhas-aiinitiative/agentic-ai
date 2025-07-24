import React from 'react';

const HeroVideo: React.FC = () => (
  <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center bg-black">
    <video
      className="absolute inset-0 w-full h-full object-cover opacity-70"
      autoPlay
      loop
      muted
      playsInline
      poster="/ai-recruitment-hero.svg"
    >
      <source src="/hero-bg.mp4" type="video/mp4" />
      {/* Fallback image if video not supported */}
    </video>
    <div className="relative z-10 text-center text-white px-4">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Agentic AI Platform</h1>
      <p className="text-lg md:text-2xl mb-8 font-medium drop-shadow-lg">
        Build, manage, and deploy intelligent agents with ease.
      </p>
      <a
        href="/agents"
        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold shadow-lg transition"
      >
        Get Started
      </a>
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
  </div>
);

export default HeroVideo;
