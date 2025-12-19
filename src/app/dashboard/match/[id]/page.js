import MatchInfoClient from './MatchInfoClient';

export default function MatchInfoPage({ params }) {
  const matchId = params.id; // safe here

  return <MatchInfoClient matchId={matchId} />;
}
