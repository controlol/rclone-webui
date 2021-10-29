const secondsToTimeString = (seconds, daystring = false) => {
  if (isNaN(seconds)) return (daystring ? "0 days, " : "") + "00:00:00"

  const days = Math.floor(seconds / 86400)
  seconds = seconds - days * 86400
  const hours = Math.floor(seconds / 3600)
  seconds = seconds - hours * 3600
  const minutes = Math.floor(seconds / 60)
  seconds = seconds - minutes * 60
  if (!daystring) {
    if (!hours) return String(minutes).padStart(2, '0') + ":" + String(Math.floor(seconds)).padStart(2, '0')
    return String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(Math.floor(seconds)).padStart(2, '0')
  }
  return days + " days, " + String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(Math.floor(seconds)).padStart(2, '0')
}

export default secondsToTimeString