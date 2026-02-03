 import { useState } from "react";
import "./App.css";

const STYLES = [
  "Pixar", "Disney", "Ghibli", "Anime", "Cyberpunk", "Fantasy Art"
];

export default function App() {
  const [userStatus, setUserStatus] = useState("free");
  const [trialStart, setTrialStart] = useState(null);
  const [page, setPage] = useState("home"); 

  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState("Pixar");
  const [resultStory, setResultStory] = useState("");
  const [resultImage, setResultImage] = useState("");
  const [loading, setLoading] = useState(false);

  const isTrialActive = userStatus === "trial" && trialStart 
    ? (Date.now() - trialStart) < (7 * 24 * 60 * 60 * 1000) 
    : false;

  const hasProAccess = userStatus === "pro" || isTrialActive;

  const startTrial = () => {
    setUserStatus("trial");
    setTrialStart(Date.now());
    setPage("app");
    alert("🎉 تهانينا! لقد حصلت على حساب Pro لمدة 7 أيام مجاناً!");
  };

  const handleGenerate = async () => {
    if (!idea) return alert("اكتب فكرة أولاً");
    setLoading(true);

    try {
      const storyRes = await fetch("http://localhost:3001/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const storyData = await storyRes.json();
      setResultStory(storyData.story);

      if (hasProAccess) {
        const imgRes = await fetch("http://localhost:3001/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: idea, style }),
        });
        const imgData = await imgRes.json();
        setResultImage(imgData.image);
      } else {
        setResultImage(`https://picsum.photos/seed/${style}/400/300`);
      }
      
      setStep(3);
    } catch (err) {
      alert("حدث خطأ في الاتصال بالسيرفر - تأكد من تشغيل node server.js");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      {page === "home" && (
        <div className="hero">
          <h1>🧙‍♂️ Hakawati AI</h1>
          <p>حوّل أفكارك إلى قصص مذهلة وصور فنية</p>
          <button className="btn-primary" onClick={() => setPage("pricing")}>ابدأ الآن</button>
        </div>
      )}

      {page === "pricing" && (
        <div className="pricing-page">
          <h1>💳 اختر خطتك</h1>
          <div className="cards-container">
            <div className="card price-card">
              <h2>🆓 مجاني</h2>
              <ul>
                <li>قصة نصية فقط</li>
                <li>صورة عشوائية</li>
                <li>نمط Pixar فقط</li>
              </ul>
              <button onClick={() => { setUserStatus("free"); setPage("app"); }}>
                دخول مجاني
              </button>
            </div>

            <div className="card price-card pro-card">
              <div className="badge">الأكثر شيوعاً</div>
              <h2>⭐ تجربة Pro</h2>
              <p className="price">مجاناً لأسبوع واحد</p>
              <ul>
                <li>✅ توليد قصة كاملة</li>
                <li>✅ صور AI حقيقية</li>
                <li>✅ كل الأنماط (Disney, Ghibli...)</li>
              </ul>
              <button className="btn-pro" onClick={startTrial}>
                جرّب مجاناً الآن
              </button>
            </div>
          </div>
          <button className="btn-back" onClick={() => setPage("home")}>رجوع</button>
        </div>
      )}

      {page === "app" && (
        <div className="app-interface">
          <header>
            <div>
                <h1>Hakawati AI {hasProAccess && <span className="pro-tag">⭐ Pro</span>}</h1>
                {isTrialActive && <p className="trial-text">⏳ فترة التجربة نشطة</p>}
            </div>
            <button className="btn-small" onClick={() => setPage("pricing")}>الأسعار</button>
          </header>

          {step === 1 && (
            <div className="step-card">
              <h2>1. ما هي فكرتك؟</h2>
              <textarea> placeholder="مثال: صبي صغير يكتشف كنزاً في الغابة..." 
                value={idea} 
                onChange={e => setIdea(e.target.value)} </textarea>
               
              
              <button className="btn-primary" onClick={() => setStep(2)} disabled={!idea}>التالي ➡</button>
            </div>
          )}

          {step === 2 && (
            <div className="step-card">
              <h2>2. اختر النمط (Style)</h2>
              <div className="styles-grid">
                {STYLES.map(s => (
                  <div 
                    key={s} 
                    className={`style-box ${style === s ? "selected" : ""} ${!hasProAccess && s !== "Pixar" ? "locked" : ""}`}
                    onClick={() => {
                      if (!hasProAccess && s !== "Pixar") return; 
                      setStyle(s);
                    }}
                  >
                    {s}
                    {!hasProAccess && s !== "Pixar" && <span className="lock-icon">🔒</span>}
                  </div>
                ))}
              </div>
              <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
                {loading ? "⏳ جاري السحر..." : "✨ توليد القصة والصور"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="result-card">
              <div className="result-text">
                <h3>📖 القصة</h3>
                <p>{resultStory}</p>
              </div>
              
              <div className="result-image">
                <h3>🖼️ المشهد ({style})</h3>
                <img src={resultImage} alt="AI Generated" />
                {!hasProAccess && <p className="lock-msg">صورة توضيحية (للحصول على صور حقيقية اشترك في Pro)</p>}
              </div>

              <div className="actions">
                <button className="btn-primary" onClick={() => setStep(1)}>قصة جديدة 🔄</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}