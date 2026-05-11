import "../styles/hud.css";

export default function HUD({ gameState }) {
  const hpPercent = (gameState.hp / gameState.maxHp) * 100;
  const hpColor =
    gameState.hp > 2
      ? "linear-gradient(90deg,#00ff88,#00bbff)"
      : "linear-gradient(90deg,#ff2244,#ff8800)";

  return (
    <div id="hud">
      <div className="hud-item">
        <div className="hp-bar-bg">
          <div
            className="hp-bar-fill"
            style={{
              width: `${hpPercent}%`,
              background: hpColor,
            }}
          />
        </div>
        <span>{gameState.hp}</span>
      </div>
      <div className="hud-item">
        SECTOR <b>{String(gameState.sector).padStart(2, "0")}</b>
      </div>
      <div className="hud-item">
        SCORE <b>{String(gameState.score).padStart(6, "0")}</b>
      </div>
      <div className="hud-item">
        NRG <b>{gameState.energy}</b>
      </div>
    </div>
  );
}
