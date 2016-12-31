

export const formatSecondsAsHHMMSS = (seconds) => {
  let text: string = '';
  seconds = Math.floor(seconds);
  if (Math.floor(seconds / 3600) > 0) {
    let hours = Math.floor(seconds / 3600).toString();
    while (hours.length < 2) hours = '0' + hours;
    text += hours;
  }
  seconds = seconds % 3600;
  let minutes = Math.floor(seconds / 60).toString();
  while (minutes.length < 2) minutes = '0' + minutes;
  seconds = (seconds % 60).toString();
  while (seconds.length < 2) seconds = '0' + seconds;
  text += `${minutes}:${seconds}`;
  return text;
};

