import { useState, useEffect } from "react";

// --- WORKING HOURS (Riyadh time, UTC+3) — edit these to change availability ---
const WORK_START = 8; // 08:00
const WORK_END = 17; // 17:00
// 0 = Sunday ... 6 = Saturday (JS getDay()); work Sun-Thu = 0..4
const WORK_DAYS: number[] = [0, 1, 2, 3, 4];

const TZ = "Asia/Riyadh";

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Formatters below always resolve to Riyadh time regardless of the device zone.
const riyadhTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const riyadhDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
});

// Local (visitor) time formatter — resolves to the device zone.
const localTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

interface RiyadhParts {
  hour24: number;
  minute: number;
  second: number;
  hour12: number;
  ampm: string;
  day: number;
}

function getRiyadhParts(date: Date): RiyadhParts {
  const timeParts = riyadhTimeFormatter.formatToParts(date);
  const get = (t: string) =>
    timeParts.find((p) => p.type === t)?.value ?? "";
  let hour = parseInt(get("hour"), 10) || 0;
  const minute = parseInt(get("minute"), 10) || 0;
  const second = parseInt(get("second"), 10) || 0;
  const dayPeriod = get("dayPeriod").toUpperCase(); // "AM" | "PM"
  const hour24 =
    dayPeriod === "PM" && hour < 12
      ? hour + 12
      : dayPeriod === "AM" && hour === 12
        ? 0
        : hour;

  const dateParts = riyadhDateFormatter.formatToParts(date);
  const weekday = dateParts.find((p) => p.type === "weekday")?.value ?? "";
  const day = WEEKDAY_INDEX[weekday] ?? 0;

  return {
    hour24,
    minute,
    second,
    hour12: hour === 0 ? 12 : hour,
    ampm: dayPeriod,
    day,
  };
}

function getZoneOffsetMs(tz: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second),
  );
  return asUTC - date.getTime();
}

function formatDiffHours(diff: number): string {
  const rounded = Math.round(diff * 2) / 2; // nearest 0.5
  if (rounded === 0) return "same time as Riyadh";
  const abs = Math.abs(rounded);
  const num = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return `${num} hrs ${rounded > 0 ? "ahead" : "behind"}`;
}

function isWorkingHour(parts: RiyadhParts): boolean {
  if (!WORK_DAYS.includes(parts.day)) return false;
  return parts.hour24 >= WORK_START && parts.hour24 < WORK_END;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nextWorkingStart(parts: RiyadhParts): { daysAhead: number; dayName: string } {
  let ahead = 1;
  for (;;) {
    const d = (parts.day + ahead) % 7;
    if (WORK_DAYS.includes(d)) {
      return { daysAhead: ahead, dayName: WEEKDAY_NAMES[d] };
    }
    ahead++;
  }
}

function formatStartTime(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${h12}:00 ${ampm}`;
}

interface LocalInfo {
  zone: string;
  diff: number | null;
}

export function ClockTile() {
  // `null` until first mount → renders a neutral placeholder (no flicker).
  const [now, setNow] = useState<Date | null>(null);
  const [localInfo, setLocalInfo] = useState<LocalInfo | null>(null);

  useEffect(() => {
    // Detect the visitor's zone once on mount.
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone && zone !== TZ) {
      const instant = new Date();
      const diff =
        (getZoneOffsetMs(zone, instant) - getZoneOffsetMs(TZ, instant)) /
        3_600_000;
      setLocalInfo({ zone, diff });
    } else {
      setLocalInfo({ zone: zone ?? "", diff: null });
    }

    setNow(new Date());

    let timer: number | undefined;
    const start = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = window.setInterval(() => setNow(new Date()), 1000);
    };
    const stop = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const parts = now ? getRiyadhParts(now) : null;
  const online = parts ? isWorkingHour(parts) : false;

  const startTime = formatStartTime(WORK_START);
  const awayInfo = parts && !online ? nextWorkingStart(parts) : null;
  const awayLine = awayInfo
    ? awayInfo.daysAhead === 1
      ? `Back tomorrow ${startTime}`
      : `Back ${awayInfo.dayName} ${startTime}`
    : "";
  const statusAria = online
    ? "Online"
    : `Away, back ${awayInfo && awayInfo.daysAhead === 1 ? "tomorrow" : `on ${awayInfo?.dayName}`} at ${startTime} Riyadh time`;

  const dateLine = now
    ? (() => {
        const dp = riyadhDateFormatter.formatToParts(now);
        const get = (t: string) =>
          dp.find((p) => p.type === t)?.value ?? "";
        return `${get("weekday").toUpperCase()} ${get("day").toUpperCase()} ${get(
          "month",
        ).toUpperCase()}`;
      })()
    : "";

  // Progress through the 24-hour Riyadh day (0..1).
  const dayProgress = parts
    ? Math.min(1, Math.max(0, (parts.hour24 * 60 + parts.minute) / (24 * 60)))
    : 0;

  const showLocalLine = !!(localInfo && localInfo.zone && localInfo.diff !== null);

  return (
    <div
      aria-label={`Current time in Riyadh. ${statusAria}`}
      className="h-full w-full bg-card border border-border rounded-[2rem] p-6 flex flex-col justify-between group hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Row: Labels & Status */}
      <div className="flex justify-between items-start gap-3 z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Riyadh, KSA · AST (UTC+3)
          </span>
          <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">
            {dateLine}
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {online && (
                <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-green opacity-60" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  online ? "bg-green" : "bg-amber"
                }`}
              />
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                online ? "text-green" : "text-amber"
              }`}
            >
              {online ? "Online" : "Away"}
            </span>
          </div>
          {!online && awayLine && (
            <span className="hidden min-[400px]:block text-[9px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              {awayLine}
            </span>
          )}
        </div>
      </div>

      {/* 24-hour progress bar */}
      <div className="relative z-10 my-3 w-full h-[3px] rounded-full bg-muted-foreground/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-linear"
          style={{ width: `${dayProgress * 100}%` }}
        />
      </div>

      {/* Main time: Riyadh */}
      <div className="relative z-10">
        <div className="flex items-baseline gap-1 text-card-foreground group-hover:text-primary transition-colors duration-300">
          <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none tabular-nums">
            {parts ? `${parts.hour12}:${String(parts.minute).padStart(2, "0")}` : "--:--"}
          </span>

          <span className="text-xl sm:text-2xl font-bold text-muted-foreground/60 w-[30px] tabular-nums">
            {parts ? String(parts.second).padStart(2, "0") : "--"}
          </span>

          <span className="text-lg sm:text-xl font-black uppercase tracking-widest ml-1">
            {parts ? parts.ampm : ""}
          </span>
        </div>

        {/* Visitor's local time (hidden when zone is Riyadh or undetectable) */}
        {showLocalLine && now && (
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2 truncate">
            Your time {localTimeFormatter.format(now)} · {formatDiffHours(localInfo!.diff!)}
          </p>
        )}
      </div>

      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
    </div>
  );
}