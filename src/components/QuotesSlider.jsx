


import React, { useEffect, useState, useRef } from "react";

export default function QuotesSlider({ autoplay = true, interval = 7000 }) {
  const [quotes, setQuotes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    fetch("/quotes.json")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted.current) return;
        const sample = data
          .filter(Boolean)
          .slice(0, 50)
          .sort(() => Math.random() - 0.5)
          .slice(0, 8);
        setQuotes(sample);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!autoplay || quotes.length === 0) return;
    const t = setInterval(() => {
      setCurrent((c) => (quotes.length ? (c + 1) % quotes.length : 0));
    }, interval);
    return () => clearInterval(t);
  }, [quotes, autoplay, interval]);

  if (loading) {
    return (
      <section className="py-10 text-center">
        <div className="max-w-xl mx-auto p-6 text-white">Loading quotes…</div>
      </section>
    );
  }

  if (!quotes.length) return null;

  return (
    <section className="py-10 text-center">
      <div className="max-w-3xl mx-auto overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {quotes.map((q, i) => (
            <div key={i} className="w-full flex-shrink-0 px-4">
              <div
                className="
                  relative
                  max-w-xl mx-auto p-6 rounded-2xl
                  backdrop-blur-md bg-white/5
                  text-white
                  border border-transparent
                  before:absolute before:inset-0 before:rounded-2xl
                  before:p-[2px] before:bg-gradient-to-r
                  before:from-pink-500 before:via-purple-500 before:to-cyan-400
                  before:animate-[glow_5s_linear_infinite]
                  before:blur-sm
                  before:opacity-60
                  before:-z-10
                  shadow-[0_0_15px_rgba(255,255,255,0.2)]
                "
              >
                <p className="text-lg italic mb-3 text-gray-100">“{q.text}”</p>
                <p className="text-pink-300 font-medium">
                  - {q.author || "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-5 flex justify-center gap-3">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current
                  ? "bg-pink-500 shadow-[0_0_10px_#ec4899]"
                  : "bg-gray-500/50 hover:bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
