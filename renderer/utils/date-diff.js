// Packages
import {
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears
} from 'date-fns'

export default (dateLeft, dateRight, unit) => {
  const func = {
    milliseconds: differenceInMilliseconds,
    seconds: differenceInSeconds,
    minutes: differenceInMinutes,
    hours: differenceInHours,
    days: differenceInDays,
    weeks: differenceInWeeks,
    months: differenceInMonths,
    years: differenceInYears
  }

  return func[unit](dateLeft, dateRight)
}
