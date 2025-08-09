
"use client";

import * as React from 'react';

const GoldenHourTimer: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
  const [timeLeft, setTimeLeft] = React.useState(3600);

  React.useEffect(() => {
    if (!isRunning) {
      // Reset timer when not running
      setTimeLeft(3600);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`text-2xl font-bold font-mono ${timeLeft < 600 ? 'text-destructive' : 'text-accent'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

export default GoldenHourTimer;
