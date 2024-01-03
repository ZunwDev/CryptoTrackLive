export function convertUnixToDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function convertTimestampToDate(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function convertTimestampToFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} - ${hours}:${minutes}:${seconds}`;
}

export function convertDaysToDate(days: number) {
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const currentDate = new Date();
  const releaseTimestamp = currentDate.getTime() - days * millisecondsInADay;
  const releaseDate = new Date(releaseTimestamp);
  const formattedDate = `${releaseDate.getDate()}/${releaseDate.getMonth() + 1}/${releaseDate.getFullYear()}`;

  return formattedDate;
}

export function getUnixTimeXDaysAgo(days: number) {
  const today = new Date();
  const daysAgo = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return daysAgo.getTime();
}

export function getCurrentUnixTime() {
  const currentDate = new Date();
  return currentDate.getTime();
}

export function getCurrentYear() {
  const currentDate = new Date();
  return currentDate.getFullYear();
}

export function timeAgo(timestamp: string) {
  const now: any = new Date();
  const date: any = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
}
