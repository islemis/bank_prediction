import { useState } from "react";

const API_URL = "http://localhost:8000/predict";

const SELECT_OPTIONS = {
  job: ["admin", "entrepreneur", "housemaid", "management",
        "retired", "self-employed", "services", "student", "technician",
        "unemployed", "unknown"],
  marital: ["divorced", "married", "single"],
  education: ["primary", "secondary", "tertiary", "unknown"],
  default: ["no", "yes"],
  housing: ["no", "yes"],
  loan: ["no", "yes"],
  contact: ["cellular", "telephone", "unknown"],
  poutcome: ["failure", "other", "success", "unknown"],
};

const LABELS = {
  age: "Âge",
  job: "Profession",
  marital: "Situation maritale",
  education: "Niveau d'éducation",
  default: "Défaut de crédit",
  balance: "Solde bancaire (€)",
  housing: "Prêt immobilier",
  loan: "Prêt personnel",
  contact: "Type de contact",
  campaign: "Nb appels (campagne actuelle)",
  previous: "Nb appels (campagne précédente)",
  poutcome: "Résultat campagne précédente",
};

const INITIAL_FORM = {
  age: 35,
  job: "admin.",
  marital: "married",
  education: "secondary",
  default: "no",
  balance: 1500,
  housing: "yes",
  loan: "no",
  contact: "cellular",
  campaign: 2,
  previous: 0,
  poutcome: "unknown",
};

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        balance: Number(form.balance),
        campaign: Number(form.campaign),
        previous: Number(form.previous),
      };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const prob = result ? Math.round(result.probability * 100) : 0;
  const subscribed = result?.prediction === 1;

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* ── Header ── */}
      <header style={styles.header}>
        <h1 style={styles.title}>
          Bank Subscription <span style={styles.accent}>Prediction</span>
        </h1>
        <p style={styles.subtitle}>Neural Network · Bank Marketing UCI · FastAPI</p>
      </header>

      <div style={styles.layout}>

        {/* ── Formulaire ── */}
        <div style={styles.card}>
          <p style={styles.sectionLabel}>Données client</p>

          {/* Champs numériques */}
          <div style={styles.gridNum}>
            {["age", "balance", "campaign", "previous"].map(key => (
              <div key={key} className="field" style={key === "balance" ? { gridColumn: "span 2" } : {}}>
                <label style={styles.label}>{LABELS[key]}</label>
                <input
                  type="number"
                  value={form[key]}
                  onChange={e => setField(key, e.target.value)}
                  style={styles.input}
                  className="inp"
                />
              </div>
            ))}
          </div>

          {/* Champs select */}
          <div style={styles.gridSel}>
            {Object.keys(SELECT_OPTIONS).map(key => (
              <div key={key} className="field" style={key === "job" ? { gridColumn: "span 2" } : {}}>
                <label style={styles.label}>{LABELS[key]}</label>

                {key === "job" ? (
                  <>
                    <input
                      list="job-options"
                      value={form.job}
                      onChange={e => setField("job", e.target.value)}
                      placeholder="Tapez ou choisissez…"
                      style={styles.input}
                      className="inp"
                    />
                    <datalist id="job-options">
                      {SELECT_OPTIONS.job.map(v => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                  </>
                ) : (
                  <select
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    style={styles.select}
                    className="inp"
                  >
                    {SELECT_OPTIONS[key].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Bouton */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.btn}
            className="btn"
          >
            {loading
              ? <><span className="spinner" /> Analyse en cours…</>
              : "Prédire la souscription →"
            }
          </button>

          {/* Erreur */}
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}
        </div>

        {/* ── Panneau résultat ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Placeholder */}
          {!result && !loading && (
            <div style={{ ...styles.card, textAlign: "center", padding: "40px 24px" }}>
              <div style={styles.placeholder}>?</div>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12 }}>
                Remplissez le formulaire<br />et lancez la prédiction
              </p>
            </div>
          )}

          {/* Résultat */}
          {result && (
            <div
              className="result-card"
              style={{
                ...styles.card,
                borderColor: subscribed ? "#1a3a2a" : "#3a1a1a",
                boxShadow: subscribed
                  ? "0 0 40px rgba(29,158,117,0.07)"
                  : "0 0 40px rgba(226,75,74,0.07)",
              }}
            >
              <p style={styles.sectionLabel}>Résultat</p>

              {/* Badge */}
              <div style={{
                ...styles.badge,
                background: subscribed ? "rgba(29,158,117,0.15)" : "rgba(226,75,74,0.12)",
                border: `1px solid ${subscribed ? "rgba(29,158,117,0.35)" : "rgba(226,75,74,0.3)"}`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: subscribed ? "#1D9E75" : "#E24B4A",
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: subscribed ? "#5DCAA5" : "#f09595",
                  letterSpacing: "0.04em",
                }}>
                  {subscribed ? "VA SOUSCRIRE" : "NE VA PAS SOUSCRIRE"}
                </span>
              </div>

              {/* Probabilité */}
              <p style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Probabilité de souscription
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 48, fontWeight: 800, lineHeight: 1,
                  color: subscribed ? "#5DCAA5" : "#f09595",
                }}>
                  {prob}
                </span>
                <span style={{ fontSize: 20, color: "#6b7280", fontWeight: 300 }}>%</span>
              </div>

              {/* Barre */}
              <div style={styles.barTrack}>
                <div
                  className="prob-fill"
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${prob}%`,
                    background: subscribed ? "#1D9E75" : "#E24B4A",
                  }}
                />
              </div>

              {/* Détails */}
              <div style={{ borderTop: "1px solid #2a2d3e", paddingTop: 14, marginTop: 6 }}>
                {[
                  ["Score brut", result.probability.toFixed(4)],
                  ["Classe prédite", result.prediction === 1 ? "yes (1)" : "no (0)"],
                  ["Seuil de décision", "0.50"],
                ].map(([k, v]) => (
                  <div key={k} style={styles.detailRow}>
                    <span style={{ color: "#6b7280" }}>{k}</span>
                    <span style={{ color: "#e8e6df", fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setResult(null)}
                style={styles.resetBtn}
                className="reset-btn"
              >
                Nouvelle prédiction
              </button>
            </div>
          )}

     
        </div>
      </div>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f1117",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    color: "#e8e6df",
    padding: "40px 20px",
  },
  header: { maxWidth: 900, margin: "0 auto 36px" },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 30, fontWeight: 800,
    letterSpacing: "-0.02em", color: "#fff", margin: 0,
  },
  accent: { color: "#4f6ef7" },
  subtitle: { fontSize: 12, color: "#6b7280", marginTop: 6, letterSpacing: "0.04em" },
  layout: {
    maxWidth: 900, margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr 300px", gap: 20,
    alignItems: "start",
  },
  card: {
    background: "#1a1d27",
    border: "1px solid #2a2d3e",
    borderRadius: 12,
    padding: 24,
  },
  sectionLabel: {
    fontSize: 11, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#4f6ef7", marginBottom: 18,
  },
  label: {
    display: "block", fontSize: 11,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#6b7280", marginBottom: 6,
  },
  input: {
    width: "100%", background: "#12141e",
    border: "1px solid #2a2d3e", color: "#e8e6df",
    padding: "10px 12px", borderRadius: 6,
    fontFamily: "'DM Mono', monospace", fontSize: 13,
    outline: "none", boxSizing: "border-box",
  },
  select: {
    width: "100%", background: "#12141e",
    border: "1px solid #2a2d3e", color: "#e8e6df",
    padding: "10px 12px", borderRadius: 6,
    fontFamily: "'DM Mono', monospace", fontSize: 13,
    outline: "none", appearance: "none", cursor: "pointer",
    boxSizing: "border-box",
  },
  gridNum: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12, marginBottom: 14,
  },
  gridSel: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 12, marginBottom: 20,
  },
  btn: {
    width: "100%", padding: "13px",
    background: "#4f6ef7", border: "none",
    borderRadius: 8, color: "#fff",
    fontFamily: "'DM Mono', monospace", fontSize: 13,
    fontWeight: 500, letterSpacing: "0.04em",
    cursor: "pointer", transition: "background 0.2s, transform 0.1s",
  },
  errorBox: {
    marginTop: 12, padding: "10px 14px",
    background: "rgba(226,75,74,0.1)",
    border: "1px solid rgba(226,75,74,0.3)",
    borderRadius: 6, fontSize: 12, color: "#f09595",
  },
  placeholder: {
    width: 48, height: 48, borderRadius: "50%",
    background: "#12141e", border: "1px dashed #2a2d3e",
    margin: "0 auto", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 22, color: "#6b7280",
  },
  badge: {
    display: "inline-flex", alignItems: "center",
    gap: 8, padding: "8px 14px",
    borderRadius: 100, marginBottom: 20,
  },
  barTrack: {
    height: 6, background: "#12141e",
    borderRadius: 3, overflow: "hidden", marginBottom: 16,
  },
  detailRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: 12, marginBottom: 7,
  },
  resetBtn: {
    marginTop: 14, width: "100%", padding: "8px",
    background: "transparent", border: "1px solid #2a2d3e",
    borderRadius: 6, color: "#6b7280",
    fontFamily: "'DM Mono', monospace", fontSize: 12,
    cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
  },
};

/* ── CSS dynamique (animations + focus) ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f1117; }

  .inp:focus {
    border-color: #4f6ef7 !important;
    box-shadow: 0 0 0 3px rgba(79,110,247,0.12);
  }
  .btn:hover:not(:disabled) { background: #3d5ce0 !important; }
  .btn:active:not(:disabled) { transform: scale(0.99); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .reset-btn:hover { border-color: #4f6ef7 !important; color: #e8e6df !important; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .result-card { animation: fadeUp 0.35s ease; }

  @keyframes fillBar { from { width: 0 !important; } }
  .prob-fill { animation: fillBar 0.8s cubic-bezier(.4,0,.2,1) forwards; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }

  @media (max-width: 680px) {
    div[style*="grid-template-columns: 1fr 300px"] {
      grid-template-columns: 1fr !important;
    }
  }
`;
