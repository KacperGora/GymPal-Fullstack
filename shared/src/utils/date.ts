import dayjs, { type Dayjs } from "dayjs";

export function isToday(date: Dayjs | string): boolean {
  return dayjs(date).isSame(dayjs(), "day");
}

export function isYesterday(date: Dayjs | string): boolean {
  return dayjs(date).isSame(dayjs().subtract(1, "day"), "day");
}

export function canGoToNextDay(date: Dayjs | string): boolean {
  return !isToday(date);
}
