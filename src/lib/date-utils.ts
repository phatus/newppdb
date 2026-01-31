export const WIB_TIMEZONE = "Asia/Jakarta";

/**
 * Formats a date in the Indonesian timezone (WIB).
 * 
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatInWIB(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
    return new Date(date).toLocaleString("id-ID", {
        timeZone: WIB_TIMEZONE,
        ...options,
    });
}

/**
 * Returns a Date object representing the start of the current hour in WIB.
 */
export function getWIBStartOfHour() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: WIB_TIMEZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const find = (type: string) => parts.find(p => p.type === type)?.value;

    const year = find("year");
    const month = find("month")?.padStart(2, "0");
    const day = find("day")?.padStart(2, "0");
    const hour = find("hour")?.padStart(2, "0");

    const dateStr = `${year}-${month}-${day}T${hour}:00:00+07:00`;
    return new Date(dateStr);
}

/**
 * Returns a Date object representing the start of the current day (00:00) in WIB.
 */
export function getWIBStartOfDay() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: WIB_TIMEZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
    const parts = formatter.formatToParts(now);
    const find = (type: string) => parts.find(p => p.type === type)?.value;

    const year = find("year");
    const month = find("month")?.padStart(2, "0");
    const day = find("day")?.padStart(2, "0");

    const dateStr = `${year}-${month}-${day}T00:00:00+07:00`;
    return new Date(dateStr);
}
