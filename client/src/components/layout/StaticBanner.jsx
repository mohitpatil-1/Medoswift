import React from 'react';

export default function StaticBanner() {
  return (
    <div
      style={{
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        width: '100vw',
        boxSizing: 'border-box',
      }}
    >
      <section
        aria-label="site-stats"
        style={{
          background: 'linear-gradient(90deg, #117f6b 0%, #2bb49e 100%)',
        }}
        className="text-white"
      >
        <div className="max-w-screen-xl mx-auto px-6 py-10 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-white/10 mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="rgba(255,255,255,0.95)" />
                  <path d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7v1H4v-1z" fill="rgba(255,255,255,0.85)" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold">2M+</div>
              <div className="mt-2 font-semibold">Happy Patients</div>
              <div className="text-sm opacity-90 mt-1">Trust us with their health</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-white/10 mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M18 2v6a4 4 0 11-8 0V6" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12v3a4 4 0 108 0v-1" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold">500+</div>
              <div className="mt-2 font-semibold">Verified Doctors</div>
              <div className="text-sm opacity-90 mt-1">Across 40+ specializations</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-white/10 mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21.41 11.58l-9-9a4 4 0 00-5.66 0L3.34 6.99a4 4 0 000 5.66l9 9a4 4 0 005.66 0l3.41-3.41a4 4 0 000-5.66z" fill="rgba(255,255,255,0.95)" />
                  <path d="M7.5 7.5l9 9" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold">10K+</div>
              <div className="mt-2 font-semibold">Medicines</div>
              <div className="text-sm opacity-90 mt-1">Genuine & verified products</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-white/10 mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 .587l3.668 7.431L23.4 9.75l-5.6 5.463L19.335 24 12 19.897 4.665 24l1.535-8.787L.6 9.75l7.732-1.732L12 .587z" fill="rgba(255,255,255,0.95)" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold">4.9</div>
              <div className="mt-2 font-semibold">App Rating</div>
              <div className="text-sm opacity-90 mt-1">Based on 50K+ reviews</div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-slate-50 h-28" />
    </div>
  );
}
