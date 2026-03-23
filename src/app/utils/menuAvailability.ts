type AvailabilityMenu = {
  isPublic: boolean;
  hasSchedule: boolean;
  activeFromDateIso: string;
  activeToDateIso: string;
  activeFromTime24h: string;
  activeToTime24h: string;
  activeWeekdays: number[];
};

type AvailabilityOptions = {
  now?: Date;
  timeZone?: string;
};

const DEFAULT_TIMEZONE = "Europe/Rome";
const WEEKDAY_MAP: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function toIsoDateKey(year: string, month: string, day: string): string {
  return `${year}-${month}-${day}`;
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseTime24hToMinutes(value: string): number | null {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

function getZonedNow(now: Date, timeZone: string) {
  let parts: Intl.DateTimeFormatPart[] = [];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
  } catch (error) {
    console.error("Invalid timezone for menu availability check:", timeZone, error);
    return null;
  }

  const partMap = new Map(parts.map((part) => [part.type, part.value]));
  const year = partMap.get("year");
  const month = partMap.get("month");
  const day = partMap.get("day");
  const weekdayShort = partMap.get("weekday");
  const hour = Number(partMap.get("hour"));
  const minute = Number(partMap.get("minute"));

  if (!year || !month || !day || !weekdayShort || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const weekday = WEEKDAY_MAP[weekdayShort];
  if (!weekday) {
    return null;
  }

  return {
    dateIso: toIsoDateKey(year, month, day),
    weekday,
    minutes: hour * 60 + minute,
  };
}

function minusOneDay(dateIso: string): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function isDateInRange(dateIso: string, fromIso: string, toIso: string): boolean {
  return dateIso >= fromIso && dateIso <= toIso;
}

export function isMenuAvailableNow(menu: AvailabilityMenu, options?: AvailabilityOptions): boolean {
  if (!menu.isPublic) {
    return false;
  }

  if (!menu.hasSchedule) {
    return true;
  }

  const fromDateIso = menu.activeFromDateIso;
  const toDateIso = menu.activeToDateIso;
  const fromTimeMin = parseTime24hToMinutes(menu.activeFromTime24h);
  const toTimeMin = parseTime24hToMinutes(menu.activeToTime24h);
  const weekdays = menu.activeWeekdays.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);

  if (
    !isValidIsoDate(fromDateIso) ||
    !isValidIsoDate(toDateIso) ||
    fromTimeMin === null ||
    toTimeMin === null ||
    weekdays.length === 0
  ) {
    return false;
  }

  const now = options?.now || new Date();
  const timeZone = options?.timeZone || DEFAULT_TIMEZONE;
  const zonedNow = getZonedNow(now, timeZone);

  if (!zonedNow) {
    return false;
  }

  const isOvernight = fromTimeMin > toTimeMin;

  if (!isOvernight) {
    return (
      isDateInRange(zonedNow.dateIso, fromDateIso, toDateIso) &&
      weekdays.includes(zonedNow.weekday) &&
      zonedNow.minutes >= fromTimeMin &&
      zonedNow.minutes <= toTimeMin
    );
  }

  const inEveningWindow =
    isDateInRange(zonedNow.dateIso, fromDateIso, toDateIso) &&
    weekdays.includes(zonedNow.weekday) &&
    zonedNow.minutes >= fromTimeMin;

  const previousWeekday = zonedNow.weekday === 1 ? 7 : zonedNow.weekday - 1;
  const previousDateIso = minusOneDay(zonedNow.dateIso);
  const inAfterMidnightWindow =
    isDateInRange(previousDateIso, fromDateIso, toDateIso) &&
    weekdays.includes(previousWeekday) &&
    zonedNow.minutes <= toTimeMin;

  return inEveningWindow || inAfterMidnightWindow;
}
