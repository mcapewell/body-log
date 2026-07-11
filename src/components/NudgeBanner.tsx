import { Link } from 'react-router-dom';
import { relativeDays } from '../lib/dates';

interface Props {
  daysSinceLast: number | null;
}

export default function NudgeBanner({ daysSinceLast }: Props) {
  const message =
    daysSinceLast === null
      ? 'Log your first measurement to start tracking.'
      : `It's been ${relativeDays(daysSinceLast).replace('ago', 'since your last log')}. Time to measure?`;

  return (
    <Link to="/log" className="nudge" role="status">
      <span className="nudge__icon" aria-hidden="true">
        ⏰
      </span>
      <span className="nudge__text">{message}</span>
      <span className="nudge__cta">Log now →</span>
    </Link>
  );
}
