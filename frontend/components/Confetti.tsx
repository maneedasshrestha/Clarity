import React, { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  active: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  useEffect(() => {
    if (active) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
      });
    }
  }, [active]);
  return null;
};

export default Confetti;
