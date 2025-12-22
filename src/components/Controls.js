import { useState } from 'react';
import styles from '@/styles/ScoreUpdate.module.css';

export default function Controls({ score, onBallUpdate, onWicket, onOverChange }) {
  const [runs, setRuns] = useState(0);
  const [extras, setExtras] = useState({ type: '', runs: 0 });
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState('');

  const handleBall = () => {
    onBallUpdate({ runs, extras, isWicket, wicketType });
    setRuns(0);
    setExtras({ type: '', runs: 0 });
    setIsWicket(false);
    setWicketType('');
  };

  return (
    <div className={`${styles.section} ${styles.controls}`}>
      <h2>Record Ball</h2>
      <label>Runs</label>
      <input type="number" value={runs} onChange={e => setRuns(parseInt(e.target.value) || 0)} />
      
      <label>Extras</label>
      <select value={extras.type} onChange={e => setExtras({...extras, type: e.target.value})}>
        <option value="">None</option>
        <option value="wide">Wide</option>
        <option value="no-ball">No Ball</option>
        <option value="bye">Bye</option>
        <option value="leg-bye">Leg Bye</option>
      </select>
      <input type="number" value={extras.runs} onChange={e => setExtras({...extras, runs: parseInt(e.target.value) || 0})} placeholder="Extra runs" />

      <label>Wicket</label>
      <input type="checkbox" checked={isWicket} onChange={e => setIsWicket(e.target.checked)} />
      {isWicket && (
        <>
          <label>Type</label>
          <select value={wicketType} onChange={e => setWicketType(e.target.value)}>
            <option value="">Select</option>
            <option value="bowled">Bowled</option>
            <option value="caught">Caught</option>
            <option value="lbw">LBW</option>
            <option value="run out">Run Out</option>
            <option value="stumped">Stumped</option>
            <option value="hit wicket">Hit Wicket</option>
          </select>
        </>
      )}
      <button onClick={handleBall}>Record Ball</button>
    </div>
  );
}
