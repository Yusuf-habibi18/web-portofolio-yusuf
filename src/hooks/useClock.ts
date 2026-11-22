import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

/** Current time in Jakarta (WIB, UTC+7), ticking every second. */
export function useJakartaTime() {
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt.format(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
