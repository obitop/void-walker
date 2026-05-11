import { useEffect, useRef } from "react";
import "../styles/mobile-controls.css";

export default function MobileControls({ engineRef, isPlaying }) {
  const leftBtnRef = useRef(null);
  const rightBtnRef = useRef(null);
  const jumpBtnRef = useRef(null);
  const shootBtnRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || !engineRef?.current) return;

    const engine = engineRef.current;
    const leftBtn = leftBtnRef.current;
    const rightBtn = rightBtnRef.current;
    const jumpBtn = jumpBtnRef.current;
    const shootBtn = shootBtnRef.current;

    const handleTouchStart = (e, inputKey) => {
      e.preventDefault();
      if (inputKey === "shoot") {
        engine.input.shoot = true;
      } else if (inputKey === "jump") {
        if (!engine.jumpHeld) {
          engine.input.up = true;
          engine.jumpHeld = true;
          engine.jumpBuffer = 5;
        }
      } else if (inputKey === "left") {
        engine.input.left = true;
      } else if (inputKey === "right") {
        engine.input.right = true;
      }
    };

    const handleTouchEnd = (e, inputKey) => {
      e.preventDefault();
      if (inputKey === "shoot") {
        engine.input.shoot = false;
      } else if (inputKey === "jump") {
        engine.input.up = false;
        engine.jumpHeld = false;
      } else if (inputKey === "left") {
        engine.input.left = false;
      } else if (inputKey === "right") {
        engine.input.right = false;
      }
    };

    if (leftBtn) {
      leftBtn.addEventListener("touchstart", (e) =>
        handleTouchStart(e, "left"),
      );
      leftBtn.addEventListener("touchend", (e) => handleTouchEnd(e, "left"));
    }

    if (rightBtn) {
      rightBtn.addEventListener("touchstart", (e) =>
        handleTouchStart(e, "right"),
      );
      rightBtn.addEventListener("touchend", (e) => handleTouchEnd(e, "right"));
    }

    if (jumpBtn) {
      jumpBtn.addEventListener("touchstart", (e) =>
        handleTouchStart(e, "jump"),
      );
      jumpBtn.addEventListener("touchend", (e) => handleTouchEnd(e, "jump"));
    }

    if (shootBtn) {
      shootBtn.addEventListener("touchstart", (e) =>
        handleTouchStart(e, "shoot"),
      );
      shootBtn.addEventListener("touchend", (e) => handleTouchEnd(e, "shoot"));
    }

    return () => {
      if (leftBtn) {
        leftBtn.removeEventListener("touchstart", (e) =>
          handleTouchStart(e, "left"),
        );
        leftBtn.removeEventListener("touchend", (e) =>
          handleTouchEnd(e, "left"),
        );
      }
      if (rightBtn) {
        rightBtn.removeEventListener("touchstart", (e) =>
          handleTouchStart(e, "right"),
        );
        rightBtn.removeEventListener("touchend", (e) =>
          handleTouchEnd(e, "right"),
        );
      }
      if (jumpBtn) {
        jumpBtn.removeEventListener("touchstart", (e) =>
          handleTouchStart(e, "jump"),
        );
        jumpBtn.removeEventListener("touchend", (e) =>
          handleTouchEnd(e, "jump"),
        );
      }
      if (shootBtn) {
        shootBtn.removeEventListener("touchstart", (e) =>
          handleTouchStart(e, "shoot"),
        );
        shootBtn.removeEventListener("touchend", (e) =>
          handleTouchEnd(e, "shoot"),
        );
      }
    };
  }, [isPlaying, engineRef]);

  if (!isPlaying) return null;

  return (
    <div className="mobile-controls">
      <div className="controls-left">
        <button ref={leftBtnRef} className="control-btn">
          ◀
        </button>
        <button ref={rightBtnRef} className="control-btn">
          ▶
        </button>
      </div>
      <div className="controls-right">
        <button ref={jumpBtnRef} className="control-btn">
          JUMP
        </button>
        <button ref={shootBtnRef} className="control-btn shoot-btn">
          FIRE
        </button>
      </div>
    </div>
  );
}
