import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const triggerConfetti = (options = {}) => {
    const defaultOptions = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      ...options
    };

    confetti(defaultOptions);
  };

  const triggerSuccessConfetti = () => {
    triggerConfetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#10b981', '#4f46e5', '#f59e0b'],
      scalar: 1.2,
    });
  };

  const triggerMilestoneConfetti = () => {
    // More elaborate confetti for milestones
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
      });
    }, 250);
  };

  const triggerSimpleConfetti = () => {
    triggerConfetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return {
    triggerConfetti,
    triggerSuccessConfetti,
    triggerMilestoneConfetti,
    triggerSimpleConfetti,
  };
};