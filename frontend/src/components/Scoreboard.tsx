import { Team } from '../types';
import { Trophy } from 'lucide-react';

interface ScoreboardProps {
  teams: Team[];
  currentTeamId: string | null;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ teams, currentTeamId }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-jeopardy-gold shadow-2xl">
      <h2 className="text-3xl font-bold text-jeopardy-gold mb-6 flex items-center gap-2">
        <Trophy className="w-8 h-8" />
        Scoreboard
      </h2>

      <div className="space-y-3">
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`scoreboard-item ${
              team.id === currentTeamId ? 'scoreboard-item-active' : ''
            }`}
            style={{
              borderLeftWidth: '6px',
              borderLeftColor: team.color,
            }}
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-2xl font-bold text-slate-400">
                #{index + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold" style={{ color: team.color }}>
                  {team.name}
                </h3>
                {team.id === currentTeamId && (
                  <p className="text-sm text-jeopardy-gold">Current Turn</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-jeopardy-gold">
                ${team.score.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
