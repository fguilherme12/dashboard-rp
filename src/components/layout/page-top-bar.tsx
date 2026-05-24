import { LiveClock } from "@/components/layout/live-clock";

export function PageTopBar() {
  return (
    <div className="mb-6 flex justify-end">
      <LiveClock />
    </div>
  );
}
