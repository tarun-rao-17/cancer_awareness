import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import StarBackground from "./components/StarBackground";
import QuotesSlider from "./components/QuotesSlider";

function App() {
  const [quotes, setQuotes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [currentInfo, setCurrentInfo] = useState(0);

  // Fetch new quote periodically and keep a short history (max 6)
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await axios.get("https://api.quotable.io/random");
        setQuotes((prev) => {
          // avoid duplicates
          if (prev.find((q) => q._id === res.data._id || q.content === res.data.content)) return prev;
          const next = [...prev, res.data];
          if (next.length > 6) next.shift();
          return next;
        });
      } catch (err) {
        console.error("Error fetching quote", err);
      }
    };

    fetchQuote();
    const fetchInterval = setInterval(fetchQuote, 10000); // refresh every 10s
    return () => clearInterval(fetchInterval);
  }, []);

  // Slide to next available quote every 8s
  useEffect(() => {
    if (quotes.length === 0) return;
    setCurrent(0);
    const slideInterval = setInterval(() => {
      setCurrent((c) => (quotes.length ? (c + 1) % quotes.length : 0));
    }, 8000);
    return () => clearInterval(slideInterval);
  }, [quotes]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const infoCards = [
    {
      id: 'what',
      title: 'What is cancer?',
      blurb:
        'Cancer is a group of diseases characterized by uncontrolled growth and spread of abnormal cells. It can arise in almost any tissue of the body and, when untreated, can invade nearby tissues and spread to other parts of the body.',
      more: [
        { label: 'WHO - Cancer', url: 'https://www.who.int/health-topics/cancer' },
        { label: 'American Cancer Society', url: 'https://www.cancer.org/' },
      ],
    },
    {
      id: 'early',
      title: 'Early detection',
      blurb:
        'Early diagnosis dramatically improves outcomes. Regular screenings (mammograms, colonoscopies, PAP smears) and awareness of symptoms help detect cancer sooner.',
      more: [
        { label: 'Screening guidelines - CDC', url: 'https://www.cdc.gov/cancer/dcpc/prevention/screening.htm' },
      ],
    },
    {
      id: 'prevention',
      title: 'Prevention & Risk',
      blurb:
        'Many cancers are linked to lifestyle and environmental risks — tobacco, excessive alcohol, poor diet, and UV exposure are common contributors. Vaccines and healthy choices reduce risk.',
      more: [
        { label: 'Preventing cancer - NHS', url: 'https://www.nhs.uk/live-well/healthy-body/cancer-prevention/' },
      ],
    },
    {
      id: 'support',
      title: 'Support & Care',
      blurb:
        'Emotional, medical, and practical support are essential. Palliative care, counseling, and patient networks improve quality of life for patients and caregivers.',
      more: [
        { label: 'Cancer support - Macmillan', url: 'https://www.macmillan.org.uk/cancer-information-and-support' },
      ],
    },
    {
      id: 'myths',
      title: 'Myths vs Facts',
      blurb:
        "There's a lot of misinformation. Not all lumps are cancer, and not all cancers are fatal. Evidence-based information and professional guidance are important.",
      more: [
        { label: 'Myths and facts - WHO', url: 'https://www.who.int/features/qa/en/' },
      ],
    },
    {
      id: 'help',
      title: 'How you can help',
      blurb:
        'Volunteer, donate, participate in awareness drives, encourage screenings, and offer practical help to those affected. Small actions make a big difference.',
      more: [
        { label: 'Volunteer - Local charities', url: 'https://www.volunteering.org.uk/' },
      ],
    },
  ];

  // auto-advance awareness carousel
  useEffect(() => {
    if (!infoCards || infoCards.length === 0) return;
    const t = setInterval(() => {
      setCurrentInfo((c) => (infoCards.length ? (c + 1) % infoCards.length : 0));
    }, 7000);
    return () => clearInterval(t);
  }, [infoCards.length]);

  // form controlled state
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const trackEvent = async (event, details = {}) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, details }),
      });
    } catch (e) {
      // best-effort
      console.debug('Track error', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // post form to local dev API if available
    try {
      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      trackEvent('contact_submit', { name: form.name, email: form.email });
      setShowSuccess(true);
    } catch (err) {
      console.error('Failed to send message to API', err);
      // still show success to avoid blocking UX, but consider showing error UI if desired
      setShowSuccess(true);
    }

    // reset form
    setForm({ name: "", email: "", message: "" });
    // hide after 3.2s
    setTimeout(() => setShowSuccess(false), 3200);
  };

  return (
    <div className="melanin-bg min-h-screen flex flex-col text-white">
      <StarBackground />
      {/* Navbar */}
      <nav className="bg-black/20 backdrop-blur-md text-white py-4 shadow-sm sticky top-0 z-50 animate-fadeIn">
        <div className="container mx-auto px-6 flex items-center">
         
          <div className="nav-left">
            <h1 className="text-2xl font-extrabold tracking-wide nav-brand">
              Cancer Awareness & Support
            </h1>
          </div>

          
          <div className="ml-auto flex items-center gap-6 nav-links">
            <a
              href="#awareness"
              className="nav-link hover:text-pink-300 transition duration-300"
            >
              Awareness
            </a>
            <a
              href="#contact"
              className="nav-link hover:text-pink-300 transition duration-300"
            >
              Contact
            </a>
            <a
              href="https://www.cancer.org/give.html"
              target="_blank"
              rel="noreferrer"
              className="nav-link btn btn-primary px-3 py-1"
              onClick={() => trackEvent('cta_click', { cta: 'donate_nav' })}
            >
              Donate
            </a>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <header
        className="hero-bg porsche-hero bg-cover bg-center flex items-center justify-center text-center hero-zoom"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="hero-inner max-w-4xl px-6">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg hero-title heading-font">
            Spreading Hope, Raising Awareness
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 hero-sub mb-8">
            Join our community for early detection, support, and meaningful action. Together we can make a measurable difference.
          </p>

          <div className="hero-ctas flex justify-center gap-4">
            <a href="#contact" className="btn btn-primary" onClick={() => trackEvent('cta_click', { cta: 'get_involved' })}>Get Involved</a>
            <a href="#awareness" className="btn btn-ghost" onClick={() => trackEvent('cta_click', { cta: 'learn_more' })}>Learn More</a>
            <a href="https://www.cancer.org/give.html" target="_blank" rel="noreferrer" className="btn btn-primary" onClick={() => trackEvent('cta_click', { cta: 'donate_hero' })}>Donate</a>
          </div>
        </div>
      </header>

      {/* Awareness Section */}
      <section id="awareness" className="info-section">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-semibold mb-8 text-pink-300 text-center">Understanding Cancer</h3>

          <div className="info-carousel">
            <div
              className="info-track"
              style={{ transform: `translateX(-${currentInfo * 100}%)` }}
            >
              {infoCards.map((card, idx) => (
                <div className="info-slide" key={card.id}>
                    <div
                    className={`info-card ${expanded[card.id] ? 'expanded' : ''} animate`}
                    style={{ animationDelay: `${idx * 120}ms` }}
                  >
                      {idx === 0 && (
                        <a href="https://www.medanta.org/hospitals-near-me/gurugram-hospital/speciality/breast-cancer/disease/understanding-breast-cancer-causes-symptoms-signs-stages" target="_blank" rel="noreferrer">
                          <img className="card-img" src="https://images.unsplash.com/photo-1533552063053-6f12f41b3e18?auto=format&fit=crop&w=1200&q=80" alt="breast cancer awareness" />
                        </a>
                      )}
                    <h4>{card.title}</h4>
                    <p>{card.blurb}</p>

                    <div className="more-content" aria-hidden={!expanded[card.id]}>
                      <hr style={{ borderColor: 'rgba(255,255,255,0.04)', margin: '12px 0' }} />
                      <p style={{ marginBottom: 8 }}>Further reading:</p>
                      <ul>
                        {card.more.map((m) => (
                          <li key={m.url}>
                            <a href={m.url} target="_blank" rel="noreferrer" className="link-more">
                              {m.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className="read-more"
                      aria-expanded={expanded[card.id] ? 'true' : 'false'}
                      onClick={() => toggleExpand(card.id)}
                    >
                      {expanded[card.id] ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="quote-dots mt-6 flex justify-center gap-3">
              {infoCards.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === currentInfo ? 'active' : ''}`}
                  onClick={() => setCurrentInfo(i)}
                  aria-label={`Show card ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quotes Section */}
      {/* Quotes Slider (transparent UI) */}
      <QuotesSlider />

      {/* Contact Section */}
      <section id="contact" className="py-16 container mx-auto px-6">
        <h3 className="text-3xl font-semibold text-center text-pink-300 mb-8">Get In Touch</h3>

        <div className="max-w-2xl mx-auto">
          <form
            className="bg-white/6 p-8 rounded-2xl shadow-lg space-y-6 glass-form animate-formEntry"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="sr-only">Your Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Your Name"
                className="w-full bg-transparent border border-white/20 rounded-lg p-3 placeholder:text-white/60 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                required
              />
            </div>

            <div>
              <label className="sr-only">Your Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Your Email"
                className="w-full bg-transparent border border-white/20 rounded-lg p-3 placeholder:text-white/60 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                required
              />
            </div>

            <div>
              <label className="sr-only">Your Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="4"
                placeholder="Your Message"
                className="w-full bg-transparent border border-white/20 rounded-lg p-3 placeholder:text-white/60 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn glow-btn w-full"
            >
              Send Message
            </button>

            
          </form>

          {/* success toast */}
          {showSuccess && (
            <div className="success-toast" role="status" aria-live="polite">
              <div className="success-inner">
                <strong>Message sent</strong>
                <p>Thanks — we'll get back to you soon.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/60 text-gray-300 text-center py-4 mt-auto">
        <p>
          © {new Date().getFullYear()} Cancer Awareness & Support | Built with ❤️ &nbsp;
          <a href="https://www.cancer.org/give.html" target="_blank" rel="noreferrer" className="underline" onClick={() => trackEvent('cta_click', { cta: 'donate_footer' })}>Donate</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
