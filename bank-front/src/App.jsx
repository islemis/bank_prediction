import { useState } from "react";

const API_URL = "http://localhost:8000/predict";

const SELECT_OPTIONS = {
  job: [ "entrepreneur", "housemaid", "management", "retired", "self-employed", "services", "student", "technician", "unemployed", "unknown"],
  marital: ["divorced", "married", "single"],
  education: ["primary", "secondary", "tertiary", "other"],
  default: ["no", "yes"],
  housing: ["no", "yes"],
  loan: ["no", "yes"],
  contact: ["cellular", "telephone"],
  poutcome: ["failure", "other", "success"],
};

const LABELS = {
  age: "Âge",
  job: "Profession",
  marital: "Situation maritale",
  education: "Niveau d'éducation",
  default: "Défaut de crédit",
  balance: "Solde bancaire",
  housing: "Prêt immobilier",
  loan: "Prêt personnel",
  contact: "Type de contact",
  campaign: "Nb appels (campagne actuelle)",
  previous: "Nb appels (campagne précédente)",
  poutcome: "Résultat campagne précédente",
};

const INITIAL_FORM = {
  age: 35,
  job: "management",
  marital: "married",
  education: "secondary",
  default: "no",
  balance: 1500,
  housing: "yes",
  loan: "no",
  contact: "cellular",
  campaign: 2,
  previous: 0,
  poutcome: "failure",
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

      <header style={styles.header}>
        <h1 style={styles.title}>
          Bank Subscription <span style={styles.accent}>Prediction</span>
        </h1>
      </header>

      <div style={styles.layout}>
        <div style={styles.card}>
          <p style={styles.sectionLabel}>Données client</p>

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

          <div style={styles.gridSel}>
            {Object.keys(SELECT_OPTIONS).map(key => (
              <div key={key} className="field" style={key === "job" ? { gridColumn: "span 2" } : {}}>
                <label style={styles.label}>{LABELS[key]}</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    style={styles.select}
                    className="inp custom-select"
                  >
                    {SELECT_OPTIONS[key].map(v => (
                      <option key={v} value={v} style={styles.option}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div style={styles.selectArrow}>▾</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={styles.btn} className="btn">
            {loading ? <><span className="spinner" /> Analyse...</> : "Prédire la souscription →"}
          </button>

          {error && <div style={styles.errorBox}>{error}</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!result && !loading && (
            <div style={{ ...styles.card, textAlign: "center", padding: "40px 24px" }}>
              <div style={styles.placeholder}>?</div>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12 }}>
                Remplissez le formulaire<br />et lancez la prédiction
              </p>
            </div>
          )}

          {result && (
            <div className="result-card" style={{
              ...styles.card,
              borderColor: subscribed ? "#1a3a2a" : "#3a1a1a",
              boxShadow: subscribed ? "0 0 40px rgba(29,158,117,0.07)" : "0 0 40px rgba(226,75,74,0.07)",
            }}>
              <p style={styles.sectionLabel}>Résultat</p>
              <div style={{
                ...styles.badge,
                background: subscribed ? "rgba(29,158,117,0.15)" : "rgba(226,75,74,0.12)",
                border: `1px solid ${subscribed ? "rgba(29,158,117,0.35)" : "rgba(226,75,74,0.3)"}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: subscribed ? "#1D9E75" : "#E24B4A" }} />
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: subscribed ? "#5DCAA5" : "#f09595" }}>
                  {subscribed ? "VA SOUSCRIRE" : "NE VA PAS SOUSCRIRE"}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", marginBottom: 8 }}>Probabilité</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800, color: subscribed ? "#5DCAA5" : "#f09595" }}>{prob}</span>
                <span style={{ fontSize: 20, color: "#6b7280" }}>%</span>
              </div>
              <div style={styles.barTrack}>
                <div className="prob-fill" style={{ height: "100%", width: `${prob}%`, background: subscribed ? "#1D9E75" : "#E24B4A" }} />
              </div>
              <div style={{ borderTop: "1px solid #2a2d3e", paddingTop: 14 }}>
                {[["Score", result.probability.toFixed(4)], ["Classe", result.prediction === 1 ? "yes" : "no"]].map(([k, v]) => (
                  <div key={k} style={styles.detailRow}>
                    <span style={{ color: "#6b7280" }}>{k}</span>
                    <span style={{ color: "#e8e6df" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setResult(null)} style={styles.resetBtn} className="reset-btn">Nouvelle prédiction</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0f1117", fontFamily: "'DM Mono', monospace", color: "#e8e6df", padding: "40px 20px" },
  header: { maxWidth: 900, margin: "0 auto 36px" },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: "#fff" },
  accent: { color: "#4f6ef7" },
  layout: { maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 },
  card: { background: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: 12, padding: 24 },
  sectionLabel: { fontSize: 11, textTransform: "uppercase", color: "#4f6ef7", marginBottom: 18, letterSpacing: "0.1em" },
  label: { display: "block", fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" },
  input: { width: "100%", background: "#12141e", border: "1px solid #2a2d3e", color: "#e8e6df", padding: "10px 12px", borderRadius: 6, outline: "none", fontSize: 13, fontFamily: "inherit" },
  select: { width: "100%", background: "#12141e", border: "1px solid #2a2d3e", color: "#e8e6df", padding: "10px 12px", borderRadius: 6, outline: "none", appearance: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  selectArrow: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#4f6ef7", pointerEvents: "none" },
  option: { background: "#1a1d27", color: "#e8e6df" },
  gridNum: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 },
  gridSel: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
  btn: { width: "100%", padding: "13px", background: "#4f6ef7", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600 },
  errorBox: { marginTop: 12, padding: "10px", background: "rgba(226,75,74,0.1)", border: "1px solid #e24b4a", borderRadius: 6, color: "#f09595", fontSize: 12 },
  placeholder: { width: 48, height: 48, borderRadius: "50%", background: "#12141e", border: "1px dashed #2a2d3e", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" },
  badge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 100, marginBottom: 20 },
  barTrack: { height: 6, background: "#12141e", borderRadius: 3, overflow: "hidden", marginBottom: 16 },
  detailRow: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 },
  resetBtn: { marginTop: 14, width: "100%", padding: "8px", background: "transparent", border: "1px solid #2a2d3e", borderRadius: 6, color: "#6b7280", cursor: "pointer" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
  .inp:focus { border-color: #4f6ef7 !important; box-shadow: 0 0 0 3px rgba(79,110,247,0.1); }
  .custom-select:hover { border-color: #4f6ef7; }
  .btn:hover { background: #3d5ce0 !important; }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fillBar { from { width: 0; } }
  .prob-fill { animation: fillBar 1s ease-out forwards; }`;