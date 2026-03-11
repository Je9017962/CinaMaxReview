import { useState, useEffect } from "react";

// ─── Font Loader ──────────────────────────────────────────────────────────────
const loadFonts = () => {
  if (document.getElementById("cinamax-fonts")) return;
  const link = document.createElement("link");
  link.id = "cinamax-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
};

// ─── Brand colors (dark blue palette) ────────────────────────────────────────
const B = {
  primary: "#1a56db",   // vivid dark blue
  primaryDeep: "#1040b0",   // deeper blue for gradients
  accent: "#38bdf8",   // sky-blue accent
  heroGrad: "#0a0f1e",   // very dark navy background
  cardBg: "#0d1529",
  cardBg2: "#111e3a",
};

const BG_PRIMARY_LOW = "rgba(26,86,219,0.08)";

// ─── In-memory user store ─────────────────────────────────────────────────────
const USER_DB = {
  "FilmCritic99": { password: "pass123", email: "critic@mail.com" },
  "CinemaLover": { password: "pass123", email: "cinema@mail.com" },
  "OceanDreamer": { password: "pass123", email: "ocean@mail.com" },
  "AnimeFan2026": { password: "pass123", email: "anime@mail.com" },
  "KidAtHeart": { password: "pass123", email: "kid@mail.com" },
};

// ─── Sample Movies (real 2026 releases) ──────────────────────────────────────
const SAMPLE_MOVIES = [
  {
    id: 1, title: "Hamnet", year: 2026, genre: ["Drama", "Romance"],
    director: "Chloé Zhao",
    poster: "https://picsum.photos/seed/hamnet2026/400/600",
    synopsis: "From Academy Award-winning director Chloé Zhao, this lyrical adaptation of Maggie O'Farrell's novel follows Agnes (Jessie Buckley) and William Shakespeare (Paul Mescal) as they grapple with the devastating loss of their son to plague in 16th-century England — and how that grief quietly forged the greatest play ever written.",
    rating: 4.3,
    reviews: [
      { user: "FilmCritic99", stars: 5, text: "Jessie Buckley is thunderous. One of those rare performances that simply beggars belief. A film to shatter you.", date: "Jan 12, 2026" },
      { user: "CinemaLover", stars: 4, text: "Slow to start, but the final act is absolutely devastating. Zhao at her most poetic.", date: "Jan 18, 2026" },
    ],
  },
  {
    id: 2, title: "28 Years Later: The Bone Temple", year: 2026, genre: ["Horror", "Thriller"],
    director: "Nia DaCosta",
    poster: "https://picsum.photos/seed/28yearslater/400/600",
    synopsis: "The third chapter in Danny Boyle's landmark rage-virus saga. Director Nia DaCosta and writer Alex Garland take the series in a bolder, darker direction as Ralph Fiennes anchors a story of survival in a still-quarantined Britain — funnier, more stylish, and just as haunting as its predecessors.",
    rating: 4.1,
    reviews: [
      { user: "OceanDreamer", stars: 4, text: "DaCosta absolutely delivers. Fiennes is astonishing and the film finds new angles in a story I thought was exhausted.", date: "Jan 20, 2026" },
    ],
  },
  {
    id: 3, title: "Send Help", year: 2026, genre: ["Thriller", "Comedy"],
    director: "Sam Raimi",
    poster: "https://picsum.photos/seed/sendhelp2026/400/600",
    synopsis: "Sam Raimi returns to gleeful mayhem with this darkly comedic survival thriller. Two colleagues — a nightmare boss and a fed-up employee — are the sole survivors of a plane crash on a deserted island, forced to set aside their war to stay alive. Rachel McAdams and Dylan O'Brien are magnetic together.",
    rating: 3.8,
    reviews: [
      { user: "AnimeFan2026", stars: 4, text: "McAdams and O'Brien have insane chemistry. Raimi chaos, sharp script — genuinely one of January's best surprises.", date: "Jan 10, 2026" },
      { user: "KidAtHeart", stars: 3, text: "Fun for two thirds, then the third act goes completely off the rails. Still worth a watch.", date: "Jan 15, 2026" },
    ],
  },
  {
    id: 4, title: "The Bride!", year: 2026, genre: ["Horror", "Drama"],
    director: "Maggie Gyllenhaal",
    poster: "https://picsum.photos/seed/thebride2026/400/600",
    synopsis: "Maggie Gyllenhaal reimagines the classic Bride of Frankenstein through a radical feminist lens. Set in 1930s Chicago, a murdered young woman (Jessie Buckley) is reborn at the hands of Dr. Frankenstein (Christian Bale) — and quickly becomes not just a companion, but the catalyst for a social revolution.",
    rating: 3.1,
    reviews: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const reviewKey = (r, i) => `${r.user}-${r.date}-${i}`;
const avatarColor = name => `hsl(${(name || "?").charCodeAt(0) * 20 + 200},60%,38%)`;
const avatarLetter = name => (name || "?")[0].toUpperCase();

const inputStyle = (extra = {}) => ({
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
  padding: "12px 14px", color: "#fff", fontSize: 14,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.2s",
  ...extra,
});

// ─── CinaMax Logo SVG ─────────────────────────────────────────────────────────
// Film reel with a play arrow, rendered inline as SVG
// Bug fix 4+5: defs moved before shapes (spec-correct order); unique gradientId
// per instance prevents duplicate DOM ids when logo appears in header + auth + footer.
let _logoCount = 0;
const CinaMaxLogo = ({ size = 38 }) => {
  const [gradId] = useState(() => `logoGrad-${++_logoCount}`);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1040b0" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" fill={`url(#${gradId})`} />
      {/* Film reel inner rings */}
      <circle cx="24" cy="24" r="8" fill="rgba(255,255,255,0.12)" />
      <circle cx="24" cy="24" r="3" fill="rgba(255,255,255,0.9)" />
      {/* Reel holes at 4 cardinal points */}
      <circle cx="24" cy="10" r="3.2" fill="rgba(255,255,255,0.22)" />
      <circle cx="24" cy="38" r="3.2" fill="rgba(255,255,255,0.22)" />
      <circle cx="10" cy="24" r="3.2" fill="rgba(255,255,255,0.22)" />
      <circle cx="38" cy="24" r="3.2" fill="rgba(255,255,255,0.22)" />
      {/* Play triangle */}
      <polygon points="20,18 20,30 32,24" fill="white" opacity="0.95" />
    </svg>
  );
};

// ─── Brand Name ───────────────────────────────────────────────────────────────
const BrandName = ({ size = 22 }) => (
  <div style={{ fontSize: size, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>
    Cina<span style={{ color: B.accent }}>Max</span><span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400, fontSize: size * 0.65 }}>Review</span>
  </div>
);

// ─── StarRating ───────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange, size = 24 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            fontSize: size, cursor: onChange ? "pointer" : "default",
            color: star <= (hover || value) ? "#F5C518" : "#2a3050",
            transition: "color 0.15s", lineHeight: 1, userSelect: "none",
          }}
        >★</span>
      ))}
    </div>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: avatarColor(name),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.44, fontWeight: 700, color: "#fff",
  }}>{avatarLetter(name)}</div>
);

// ─── Auth Modal ───────────────────────────────────────────────────────────────
const AuthModal = ({ onClose, onAuth }) => {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const setField = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError(""); };

  const handleSubmit = () => {
    setError("");
    if (loading) return;

    if (mode === "signin") {
      const u = form.username.trim();
      const p = form.password;
      if (!u || !p) { setError("Please fill in all fields."); return; }
      const record = USER_DB[u];
      if (!record) { setError("Username not found."); return; }
      if (record.password !== p) { setError("Incorrect password."); return; }
      setLoading(true);
      try {
        setTimeout(() => {
          try { onAuth({ username: u, email: record.email }); }
          finally { setLoading(false); }
        }, 600);
      } catch { setLoading(false); }
    } else {
      const u = form.username.trim();
      const em = form.email.trim();
      const p = form.password;
      const c = form.confirm;
      if (!u || !em || !p || !c) { setError("Please fill in all fields."); return; }
      if (/\s/.test(u)) { setError("Username cannot contain spaces."); return; }
      if (u.length < 3) { setError("Username must be at least 3 characters."); return; }
      if (!/\S+@\S+\.\S+/.test(em)) { setError("Enter a valid email address."); return; }
      if (p.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (p !== c) { setError("Passwords do not match."); return; }
      if (USER_DB[u]) { setError("Username already taken."); return; }
      setLoading(true);
      try {
        setTimeout(() => {
          try {
            USER_DB[u] = { password: p, email: em };
            onAuth({ username: u, email: em });
          } finally { setLoading(false); }
        }, 700);
      } catch { setLoading(false); }
    }
  };

  const handleKey = e => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,4,20,0.92)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div style={{
        background: `linear-gradient(160deg,${B.cardBg} 0%,#080e1f 100%)`,
        border: "1px solid rgba(56,189,248,0.15)", borderRadius: 24,
        maxWidth: 440, width: "100%",
        animation: "slideUp 0.3s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
        boxShadow: `0 0 60px rgba(26,86,219,0.2)`,
      }}>
        {/* Shimmer accent bar — blue */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg,${B.primary},${B.accent},${B.primary},${B.accent},${B.primary})`,
          backgroundSize: "300% 100%",
          backgroundRepeat: "repeat",
          animation: "shimmer 2.5s linear infinite",
        }} />

        <div style={{ padding: "36px 36px 32px" }}>
          {/* Logo + name */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
              <CinaMaxLogo size={34} />
              <BrandName size={24} />
            </div>
            <div style={{ fontSize: 11, color: "#4a6080", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginTop: 4 }}>
              {mode === "signin" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.04)",
            borderRadius: 12, padding: 4, marginBottom: 28,
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {["signin", "signup"].map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError(""); setForm({ username: "", email: "", password: "", confirm: "" }); }}
                style={{
                  flex: 1, padding: "10px 0", border: "none", borderRadius: 9, cursor: "pointer",
                  background: mode === m ? `linear-gradient(135deg,${B.primary},${B.primaryDeep})` : "transparent",
                  color: mode === m ? "#fff" : "#566",
                  fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace",
                  letterSpacing: 1, transition: "all 0.2s",
                }}
              >{m === "signin" ? "SIGN IN" : "SIGN UP"}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#4a6080", fontFamily: "'DM Mono',monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>USERNAME</label>
              <input value={form.username} onChange={setField("username")} onKeyDown={handleKey}
                placeholder="e.g. CinemaLover42" autoFocus style={inputStyle()} />
            </div>
            {mode === "signup" && (
              <div>
                <label style={{ fontSize: 11, color: "#4a6080", fontFamily: "'DM Mono',monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>EMAIL</label>
                <input value={form.email} onChange={setField("email")} onKeyDown={handleKey}
                  placeholder="you@example.com" type="email" style={inputStyle()} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, color: "#4a6080", fontFamily: "'DM Mono',monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>PASSWORD</label>
              <input value={form.password} onChange={setField("password")} onKeyDown={handleKey}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                type="password" style={inputStyle()} />
            </div>
            {mode === "signup" && (
              <div>
                <label style={{ fontSize: 11, color: "#4a6080", fontFamily: "'DM Mono',monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>CONFIRM PASSWORD</label>
                <input value={form.confirm} onChange={setField("confirm")} onKeyDown={handleKey}
                  placeholder="Repeat password" type="password" style={inputStyle()} />
              </div>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: 14, padding: "10px 14px", borderRadius: 8,
              background: "rgba(26,86,219,0.12)", border: `1px solid rgba(26,86,219,0.35)`,
              color: B.accent, fontSize: 13, fontFamily: "'DM Mono',monospace",
            }}>⚠ {error}</div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", marginTop: 20,
              background: loading
                ? `rgba(26,86,219,0.35)`
                : `linear-gradient(135deg,${B.primary},${B.primaryDeep})`,
              border: "none", borderRadius: 12, color: "#fff",
              padding: "14px 0", fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono',monospace", letterSpacing: 1, transition: "all 0.2s",
              boxShadow: loading ? "none" : `0 4px 20px rgba(26,86,219,0.4)`,
            }}
          >{loading ? "…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}</button>

          {mode === "signin" && (
            <p style={{ textAlign: "center", fontSize: 12, color: "#3a4a60", marginTop: 16, fontFamily: "'DM Mono',monospace" }}>
              Demo accounts: any username above with password <span style={{ color: B.accent }}>pass123</span>
            </p>
          )}

          <button onClick={onClose}
            style={{
              width: "100%", marginTop: 12, background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#445",
              padding: "11px 0", fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Mono',monospace", letterSpacing: 1,
            }}
          >CANCEL</button>
        </div>
      </div>
    </div>
  );
};

// ─── Movie Card ───────────────────────────────────────────────────────────────
const MovieCard = ({ movie, onOpenById, posterLoading }) => {
  const avgRating = movie.reviews.length
    ? (movie.reviews.reduce((s, r) => s + r.stars, 0) / movie.reviews.length).toFixed(1)
    : movie.rating.toFixed(1);
  return (
    <div onClick={() => onOpenById(movie.id)}
      style={{
        background: `linear-gradient(160deg,${B.cardBg} 0%,${B.cardBg2} 100%)`,
        border: "1px solid rgba(56,189,248,0.08)", borderRadius: 16,
        overflow: "hidden", cursor: "pointer",
        transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s",
        boxShadow: "0 4px 30px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 20px 60px rgba(26,86,219,0.3)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 4px 30px rgba(0,0,0,0.5)";
      }}
    >
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        {posterLoading
          ? <PosterSkeleton height={280} />
          : <div style={{
            width: "100%", height: "100%",
            backgroundImage: `url(${movie.poster})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }} />
        }
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${B.cardBg} 0%,transparent 60%)` }} />
        {/* Rating badge — blue */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: `rgba(26,86,219,0.88)`, backdropFilter: "blur(8px)",
          borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, color: "#fff",
          fontFamily: "'DM Mono',monospace", letterSpacing: 1,
          boxShadow: `0 2px 10px rgba(26,86,219,0.4)`,
        }}>★ {avgRating}</div>
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {movie.genre.map(g => (
            <span key={g} style={{
              fontSize: 11, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(56,189,248,0.2)", borderRadius: 20, padding: "2px 10px",
              color: "#aac8e8", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5,
            }}>{g}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontSize: 11, color: "#4a6a8a", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>{movie.year} · {movie.director}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#eef2ff", lineHeight: 1.2, marginBottom: 8, fontFamily: "'Playfair Display',serif" }}>{movie.title}</div>
        <div style={{ fontSize: 13, color: "#607090", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{movie.synopsis}</div>
        <div style={{ marginTop: 12, fontSize: 12, color: "#3a5070", fontFamily: "'DM Mono',monospace" }}>{movie.reviews.length} review{movie.reviews.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
};

// ─── AI Review Helper ─────────────────────────────────────────────────────────
const AIReviewHelper = ({ movieTitle, onInsert }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  // Bug fix 6: clear stale suggestion whenever the movie being reviewed changes
  useEffect(() => { setSuggestion(""); }, [movieTitle]);

  const generate = async () => {
    setLoading(true); setSuggestion("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Write a short, honest, opinionated movie review (2-3 sentences) for a fictional recent release called "${movieTitle}". Be specific and vivid. Don't say it's fictional. Just write the review naturally.` }],
        }),
      });
      const data = await res.json();
      setSuggestion(data.content?.find(b => b.type === "text")?.text || "");
    } catch {
      setSuggestion("Couldn't generate a suggestion right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: BG_PRIMARY_LOW, border: "1px solid rgba(26,86,219,0.25)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: suggestion ? 12 : 0 }}>
        <span style={{ fontSize: 13, color: B.accent, fontFamily: "'DM Mono',monospace", letterSpacing: 0.5 }}>✦ AI REVIEW STARTER</span>
        <button onClick={generate} disabled={loading}
          style={{
            background: loading ? `rgba(26,86,219,0.2)` : `rgba(26,86,219,0.75)`,
            border: "none", borderRadius: 8, color: "#fff", padding: "6px 14px",
            fontSize: 12, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Mono',monospace",
          }}>
          {loading ? "Generating…" : "Get Suggestion"}
        </button>
      </div>
      {suggestion && (
        <div>
          <p style={{ fontSize: 13, color: "#b0c8e8", lineHeight: 1.7, margin: "0 0 10px" }}>{suggestion}</p>
          <button onClick={() => onInsert(suggestion)}
            style={{
              background: "transparent", border: `1px solid rgba(56,189,248,0.4)`,
              borderRadius: 8, color: B.accent, padding: "5px 14px", fontSize: 12,
              cursor: "pointer", fontFamily: "'DM Mono',monospace",
            }}>
            Use This →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Movie Modal ──────────────────────────────────────────────────────────────
const MovieModal = ({ movie, currentUser, onClose, onAddReview, onRequireAuth, posterLoading }) => {
  const [form, setForm] = useState({ stars: 0, text: "" });
  const [submitted, setSubmitted] = useState(false);

  // Reset form when switching movies
  useEffect(() => {
    setForm({ stars: 0, text: "" });
    setSubmitted(false);
  }, [movie.id]);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const avgRating = movie.reviews.length
    ? (movie.reviews.reduce((s, r) => s + r.stars, 0) / movie.reviews.length).toFixed(1)
    : movie.rating.toFixed(1);

  const userAlreadyReviewed = currentUser && movie.reviews.some(r => r.user === currentUser.username);
  const canSubmit = currentUser && form.stars > 0 && form.text.trim().length > 0 && !userAlreadyReviewed;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAddReview(movie.id, {
      user: currentUser.username, stars: form.stars, text: form.text.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
    setForm({ stars: 0, text: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,4,20,0.88)", backdropFilter: "blur(12px)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.2s ease",
      }}
    >
      <div style={{
        background: `linear-gradient(160deg,${B.cardBg},#080e1f)`,
        border: "1px solid rgba(56,189,248,0.12)", borderRadius: 24,
        maxWidth: 780, width: "100%", maxHeight: "90vh", overflowY: "auto",
        animation: "slideUp 0.3s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: `0 0 80px rgba(26,86,219,0.25)`,
      }}>
        {/* Poster hero */}
        <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
          {posterLoading
            ? <PosterSkeleton height={220} />
            : <div style={{
              width: "100%", height: "100%",
              backgroundImage: `url(${movie.poster})`,
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
          }
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${B.cardBg} 0%,rgba(0,4,20,0.3) 100%)` }} />
          <button onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16, background: "rgba(0,4,20,0.65)",
              border: "1px solid rgba(56,189,248,0.2)", borderRadius: "50%",
              width: 36, height: 36, color: "#fff", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          <div style={{ position: "absolute", bottom: 20, left: 28 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {movie.genre.map(g => (
                <span key={g} style={{
                  fontSize: 11, background: `rgba(26,86,219,0.75)`, borderRadius: 20,
                  padding: "3px 10px", color: "#fff", fontFamily: "'DM Mono',monospace",
                }}>{g}</span>
              ))}
            </div>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display',serif", lineHeight: 1.1 }}>{movie.title}</h2>
            <div style={{ marginTop: 4, fontSize: 13, color: "#7090b0", fontFamily: "'DM Mono',monospace" }}>{movie.year} · Directed by {movie.director}</div>
          </div>
        </div>

        <div style={{ padding: "24px 28px 32px" }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#F5C518", fontFamily: "'DM Mono',monospace" }}>★ {avgRating}</div>
              <div style={{ fontSize: 11, color: "#607090", fontFamily: "'DM Mono',monospace" }}>AVG RATING</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#eef2ff", fontFamily: "'DM Mono',monospace" }}>{movie.reviews.length}</div>
              <div style={{ fontSize: 11, color: "#607090", fontFamily: "'DM Mono',monospace" }}>REVIEWS</div>
            </div>
          </div>

          <p style={{ color: "#8090b0", lineHeight: 1.8, fontSize: 15, marginBottom: 24 }}>{movie.synopsis}</p>

          {/* Reviews list */}
          <h3 style={{ color: "#eef2ff", fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 16, borderBottom: "1px solid rgba(56,189,248,0.1)", paddingBottom: 12 }}>
            Reviews
          </h3>
          {movie.reviews.length === 0 && (
            <p style={{ color: "#3a5070", fontStyle: "italic", fontSize: 14, marginBottom: 20 }}>No reviews yet. Be the first!</p>
          )}
          {movie.reviews.map((r, i) => (
            <div key={reviewKey(r, i)} style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, marginBottom: 12,
              border: `1px solid ${currentUser && r.user === currentUser.username ? `rgba(26,86,219,0.35)` : "rgba(56,189,248,0.07)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.user} size={32} />
                  <div>
                    <span style={{ color: "#d0dff5", fontWeight: 600, fontSize: 14 }}>{r.user}</span>
                    {currentUser && r.user === currentUser.username && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, color: B.accent,
                        fontFamily: "'DM Mono',monospace", background: BG_PRIMARY_LOW,
                        padding: "2px 7px", borderRadius: 10,
                      }}>YOU</span>
                    )}
                  </div>
                </div>
                <StarRating value={r.stars} size={16} />
              </div>
              <p style={{ color: "#8090b0", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{r.text}</p>
              <div style={{ marginTop: 8, fontSize: 11, color: "#3a5070", fontFamily: "'DM Mono',monospace" }}>{r.date}</div>
            </div>
          ))}

          {/* Write review section */}
          <h3 style={{ color: "#eef2ff", fontFamily: "'Playfair Display',serif", fontSize: 20, marginTop: 28, marginBottom: 16, borderBottom: "1px solid rgba(56,189,248,0.1)", paddingBottom: 12 }}>
            Write a Review
          </h3>

          {!currentUser ? (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(56,189,248,0.15)", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
              <p style={{ color: "#607090", fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
                Sign in to share your review<br />
                <span style={{ fontSize: 13, color: "#3a5070" }}>Join thousands of cinephiles rating the latest films</span>
              </p>
              <button onClick={onRequireAuth}
                style={{
                  background: `linear-gradient(135deg,${B.primary},${B.primaryDeep})`,
                  border: "none", borderRadius: 12, color: "#fff", padding: "13px 32px",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Mono',monospace", letterSpacing: 1,
                  boxShadow: `0 4px 20px rgba(26,86,219,0.4)`,
                }}>
                SIGN IN TO REVIEW
              </button>
            </div>
          ) : userAlreadyReviewed ? (
            <div style={{ background: "rgba(0,200,100,0.05)", border: "1px solid rgba(0,200,100,0.18)", borderRadius: 16, padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
              <p style={{ color: "#5fdf9b", fontSize: 14, margin: 0, fontFamily: "'DM Mono',monospace" }}>You've already reviewed this film.</p>
            </div>
          ) : (
            <div>
              {/* "Reviewing as" banner */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(56,189,248,0.08)" }}>
                <Avatar name={currentUser.username} size={28} />
                <span style={{ fontSize: 13, color: "#7090b0" }}>Reviewing as <strong style={{ color: "#eef2ff" }}>{currentUser.username}</strong></span>
              </div>

              <AIReviewHelper movieTitle={movie.title} onInsert={text => setForm(f => ({ ...f, text }))} />

              {submitted && (
                <div style={{ background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#5fdf9b", fontFamily: "'DM Mono',monospace", fontSize: 13 }}>
                  ✓ Review submitted! Thank you, {currentUser.username}.
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: "#4a6080", marginBottom: 8, fontFamily: "'DM Mono',monospace" }}>YOUR RATING</div>
                <StarRating value={form.stars} onChange={v => setForm(f => ({ ...f, stars: v }))} size={34} />
              </div>
              <textarea
                placeholder="Share your thoughts on this film..."
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                rows={4}
                style={inputStyle({ marginBottom: 16, resize: "vertical", lineHeight: 1.7 })}
              />
              <button onClick={handleSubmit} disabled={!canSubmit}
                style={{
                  background: canSubmit
                    ? `linear-gradient(135deg,${B.primary},${B.primaryDeep})`
                    : "rgba(255,255,255,0.06)",
                  border: "none", borderRadius: 12,
                  color: canSubmit ? "#fff" : "#334",
                  padding: "14px 28px", fontSize: 15, fontWeight: 700,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "all 0.2s", fontFamily: "'DM Mono',monospace", letterSpacing: 1,
                  boxShadow: canSubmit ? `0 4px 20px rgba(26,86,219,0.4)` : "none",
                }}>
                SUBMIT REVIEW
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── User Menu Dropdown ───────────────────────────────────────────────────────
const UserMenu = ({ user, onSignOut }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleSignOut = () => { setOpen(false); onSignOut(); };

  return (
    <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(26,86,219,0.1)",
          border: "1px solid rgba(56,189,248,0.2)", borderRadius: 12, padding: "8px 14px",
          cursor: "pointer", transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(26,86,219,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(26,86,219,0.1)"}
      >
        <Avatar name={user.username} size={28} />
        <span style={{ color: "#c8ddf5", fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{user.username}</span>
        <span style={{ color: "#4a6080", fontSize: 10, marginLeft: 2 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          background: `linear-gradient(160deg,${B.cardBg2},${B.cardBg})`,
          border: "1px solid rgba(56,189,248,0.15)", borderRadius: 12,
          minWidth: 200, overflow: "hidden",
          boxShadow: `0 20px 50px rgba(0,0,0,0.7)`,
          animation: "fadeIn 0.15s ease", zIndex: 200,
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(56,189,248,0.08)" }}>
            <div style={{ fontSize: 13, color: "#eef2ff", fontWeight: 700 }}>{user.username}</div>
            <div style={{ fontSize: 12, color: "#3a5070", marginTop: 2 }}>{user.email}</div>
          </div>
          <button onClick={handleSignOut}
            style={{
              width: "100%", padding: "12px 16px", background: "transparent",
              border: "none", color: B.accent, fontSize: 13, cursor: "pointer",
              textAlign: "left", fontFamily: "'DM Mono',monospace", letterSpacing: 0.5,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = BG_PRIMARY_LOW}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >⟵ Sign Out</button>
        </div>
      )}
    </div>
  );
};

// ─── Web Poster Hook ──────────────────────────────────────────────────────────
// Uses the Claude API with web_search to find a real, publicly accessible
// poster-style image URL for each movie based on its title, genre and synopsis.
// Runs automatically on mount — no API key needed from the user.
function useWebPosters(movies) {
  const [posterMap, setPosterMap] = useState({});
  const [loadingIds, setLoadingIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoadingIds(movies.map(m => m.id));

    const fetchPoster = async (movie) => {
      try {
        const prompt = `Find a real, publicly accessible image URL that would work as a movie poster for a film called "${movie.title}" (${movie.year}), genres: ${movie.genre.join(", ")}. Synopsis: ${movie.synopsis}

Search the web for a high-quality portrait-oriented (poster-style) image that visually fits this film's themes. It could be from a similar real movie, a stock photo, or any thematically fitting image.

Respond with ONLY a single raw image URL (must end in .jpg, .jpeg, .png, or .webp). No explanation, no markdown, just the URL.`;

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 200,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        // Extract the final text block which contains the URL
        const textBlock = (data.content || []).filter(b => b.type === "text").pop();
        const raw = textBlock?.text?.trim() || "";
        // Pull out the first URL-looking string
        const match = raw.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|webp)[^\s"]*/i);
        const url = match?.[0];
        if (!cancelled && url) {
          setPosterMap(prev => ({ ...prev, [movie.id]: url }));
        }
      } catch {
        // Silently fall back to placeholder on any error
      } finally {
        if (!cancelled) {
          setLoadingIds(prev => prev.filter(id => id !== movie.id));
        }
      }
    };

    // Fetch sequentially to avoid rate limits
    (async () => {
      for (const movie of movies) {
        if (cancelled) break;
        await fetchPoster(movie);
      }
    })();

    return () => { cancelled = true; };
  }, []); // Run once on mount

  return { posterMap, loadingIds };
}

// ─── Poster Skeleton ──────────────────────────────────────────────────────────
const PosterSkeleton = ({ height }) => (
  <div style={{
    width: "100%", height,
    background: "linear-gradient(90deg,#0d1a3a 25%,#1a2d50 50%,#0d1a3a 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s linear infinite",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" opacity="0.2">
      <circle cx="24" cy="24" r="20" stroke="#38bdf8" strokeWidth="2" />
      <polygon points="20,16 20,32 34,24" fill="#38bdf8" />
    </svg>
  </div>
);



// Bug fix 8: defined outside App so it's a stable constant, not recreated each render
const GENRES = ["All", "Drama", "Romance", "Horror", "Thriller", "Comedy"];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [movies, setMovies] = useState(SAMPLE_MOVIES);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const { posterMap, loadingIds } = useWebPosters(SAMPLE_MOVIES);

  // Merge web-fetched posters into movies list
  const moviesWithPosters = movies.map(m =>
    posterMap[m.id] ? { ...m, poster: posterMap[m.id] } : m
  );

  useEffect(() => { loadFonts(); }, []);

  const filtered = moviesWithPosters.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.director.toLowerCase().includes(search.toLowerCase());
    const matchGenre = filter === "All" || m.genre.includes(filter);
    return matchSearch && matchGenre;
  });

  const selectedMovie = selectedId != null ? moviesWithPosters.find(m => m.id === selectedId) ?? null : null;

  const addReview = (movieId, review) =>
    setMovies(prev => prev.map(m => m.id === movieId ? { ...m, reviews: [...m.reviews, review] } : m));

  const handleAuth = user => { setCurrentUser(user); setShowAuth(false); };
  const handleSignOut = () => setCurrentUser(null);
  const handleRequireAuth = () => { setSelectedId(null); setShowAuth(true); };

  const totalReviews = movies.reduce((s, m) => s + m.reviews.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: B.heroGrad, fontFamily: "'Georgia','Times New Roman',serif", color: "#eef2ff" }}>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${B.heroGrad}; }
        ::-webkit-scrollbar-thumb { background: #1a3060; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #2a3a55; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid rgba(56,189,248,0.08)",
        background: "rgba(8,12,28,0.97)",
        backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100, padding: "0 32px",
        boxShadow: "0 1px 30px rgba(0,0,0,0.5)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CinaMaxLogo size={40} />
            <div>
              <BrandName size={21} />
              <div style={{ fontSize: 10, color: "#2a4060", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginTop: 2 }}>MOVIE REVIEWS</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 12, color: "#2a4060", fontFamily: "'DM Mono',monospace" }}>
              {totalReviews} REVIEWS · {movies.length} FILMS
            </div>
            {currentUser
              ? <UserMenu user={currentUser} onSignOut={handleSignOut} />
              : (
                <button onClick={() => setShowAuth(true)}
                  style={{
                    background: `linear-gradient(135deg,${B.primary},${B.primaryDeep})`,
                    border: "none", borderRadius: 10,
                    color: "#fff", padding: "9px 20px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'DM Mono',monospace", letterSpacing: 1,
                    transition: "opacity 0.2s",
                    boxShadow: `0 4px 16px rgba(26,86,219,0.4)`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >SIGN IN</button>
              )
            }
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{
        background: `linear-gradient(160deg,#080f24 0%,${B.heroGrad} 65%)`,
        borderBottom: "1px solid rgba(26,86,219,0.2)",
        padding: "60px 32px 48px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Blue radial glow */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%,rgba(26,86,219,0.18) 0%,transparent 70%)`, pointerEvents: "none" }} />
        {/* Subtle horizontal lines for cinematic feel */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(56,189,248,0.02) 60px,rgba(56,189,248,0.02) 61px)`, pointerEvents: "none" }} />

        <h1 style={{
          fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, margin: "0 0 12px",
          fontFamily: "'Playfair Display',serif", lineHeight: 1.1,
          background: `linear-gradient(135deg,#fff 30%,${B.accent})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>What's Worth Watching?</h1>
        <p style={{ color: "#3a5070", fontSize: 16, maxWidth: 480, margin: "0 auto 36px" }}>
          Real reviews from real cinephiles. Discover, rate, and discuss the latest releases.
        </p>
        {!currentUser && (
          <button onClick={() => setShowAuth(true)}
            style={{
              background: "transparent", border: `1px solid rgba(56,189,248,0.4)`, borderRadius: 10,
              color: B.accent, padding: "10px 24px", fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 36, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = BG_PRIMARY_LOW; e.currentTarget.style.borderColor = B.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; }}
          >Create a free account to write reviews ↗</button>
        )}

        {/* Search */}
        <div style={{ maxWidth: 480, margin: "0 auto 28px", position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#2a4060", fontSize: 16 }}>⌕</span>
          <input placeholder="Search films or directors…" value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", background: "rgba(26,86,219,0.07)",
              border: "1px solid rgba(56,189,248,0.12)", borderRadius: 14,
              padding: "14px 16px 14px 44px", color: "#eef2ff", fontSize: 15,
              outline: "none", fontFamily: "inherit",
            }} />
        </div>

        {/* Genre filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => setFilter(g)}
              style={{
                background: filter === g ? `linear-gradient(135deg,${B.primary},${B.primaryDeep})` : "rgba(26,86,219,0.07)",
                border: filter === g ? `1px solid ${B.primary}` : "1px solid rgba(56,189,248,0.1)",
                borderRadius: 20, padding: "8px 18px",
                color: filter === g ? "#fff" : "#3a6080",
                fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'DM Mono',monospace", letterSpacing: 0.5,
                boxShadow: filter === g ? `0 2px 12px rgba(26,86,219,0.4)` : "none",
              }}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* ── Movie Grid ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 60px" }}>
        {filtered.length === 0
          ? <div style={{ textAlign: "center", color: "#2a4060", padding: "60px 0", fontSize: 16 }}>No movies match your search.</div>
          : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
              {filtered.map(movie => <MovieCard key={movie.id} movie={movie} onOpenById={setSelectedId} posterLoading={loadingIds.includes(movie.id)} />)}
            </div>
          )
        }
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(56,189,248,0.07)", padding: "24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CinaMaxLogo size={24} />
            <BrandName size={14} />
          </div>
          <div style={{ fontSize: 12, color: "#1a3050", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>
            AI-ASSISTED REVIEWS · {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* ── Movie Modal ── */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          currentUser={currentUser}
          onClose={() => setSelectedId(null)}
          onAddReview={addReview}
          onRequireAuth={handleRequireAuth}
          posterLoading={loadingIds.includes(selectedMovie.id)}
        />
      )}

      {/* ── Auth Modal ── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
    </div>
  );
}
