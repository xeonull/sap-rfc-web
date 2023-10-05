/* Convert date and time from UTC to Local */
export function UTC_to_local(date, time) {
  if (!date || !time) return '';
  if (date.substring(0, 4) == '0000') {
    return `${date} ${time}`;
  } else {
    let datetime = new Date(`${date} ${time} UTC`);
    // return datetime.toLocaleString().replace(',', '');
    const offset = datetime.getTimezoneOffset();
    datetime = new Date(datetime.getTime() - offset * 60 * 1000);
    const s = datetime.toISOString();
    return `${s.substring(0, 10)} ${s.substring(11, 19)}`;
  }
}

/* Convert SAP Timestamp to date time format string */
export function timestamp_to_datetime(timestamp) {
  timestamp = timestamp.replace(/(\d{2})\.(\d{2})(\d)\.(\d)(\d{2})\.(\d{2})(\d)\.(\d)(\d{2})/g, '$1$2-$3$4-$5 $6:$7$8:$9');
  const date = timestamp.substring(0, 10);
  const time = timestamp.substring(11, 19);
  return { date, time };
}
