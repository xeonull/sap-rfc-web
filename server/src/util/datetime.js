/* Convert date and time from UTC to Local */
export function UTCtoLocal(date, time) {
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
