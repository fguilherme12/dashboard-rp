"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-accent-green font-mono text-lg font-semibold">
      <Clock className="h-5 w-5" />
      {time}
    </div>
  );
}
