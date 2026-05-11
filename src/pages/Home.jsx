import { Link } from "react-router-dom";
import "../App.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* Background Effects */}
      <div className="stars"></div>
      <div className="void-overlay"></div>

      {/* Main Content */}
      <main className="home-main">
        {/* Header Section */}
        <header className="home-header">
          <div className="logo-section">
            <div className="logo-icon">🚀</div>
            <h1 className="main-title">VOID WALKER</h1>
            <p className="subtitle">conquer the universe bitch</p>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Defeat the Abyss</h2>
            <p className="hero-description">
              Navigate fractured corridors, battle alien horrors, and survive
              the void's relentless pull. Every jump, every shot, every breath
              echoes in the darkness.
            </p>
            <div className="cta-buttons">
              <Link to="/game" className="btn-primary">
                Launch Game
              </Link>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>

          {/* Game Preview Visual */}
          <div className="hero-visual">
            <div className="game-preview">
              <div className="scanlines"></div>
              <div className="preview-content">
                <div className="preview-title">VOID WALKER</div>
                <div className="preview-stats">
                  <span>SECTOR: 001</span>
                  <span>SCORE: 000000</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h3>Game Features</h3>
          <div className="features-grid">
            {[
              {
                icon: "⚡",
                title: "Dynamic Platforming",
                desc: "Master low-gravity jumps and wall-running through shifting environments.",
              },
              {
                icon: "🔫",
                title: "Intense Combat",
                desc: "Face off against alien entities with precise shooting mechanics.",
              },
              {
                icon: "🌌",
                title: "Atmospheric Horror",
                desc: "Immerse yourself in a haunting sci-fi world filled with tension and mystery.",
              },
            ].map((feature, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <p>
            &copy; 2026 Void Walker. Created by Tarek denewar & Mohab Elgmmal
            Sha5a.
          </p>
        </footer>
      </main>
    </div>
  );
}
