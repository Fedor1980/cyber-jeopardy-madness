import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Play } from 'lucide-react';
import { gameService } from '../services/gameService';
import { CreateSessionRequest, SessionSettings } from '../types';
import { industryPacks } from '../utils/industryPacks';
import { teamColors } from '../utils/colors';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface TeamSetup {
  name: string;
  color: string;
}

export const SetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [selectedPack, setSelectedPack] = useState('federal-credit-union');
  const [teams, setTeams] = useState<TeamSetup[]>([
    { name: 'Team 1', color: teamColors[0] },
    { name: 'Team 2', color: teamColors[1] },
  ]);
  const [settings, setSettings] = useState<SessionSettings>({
    time_per_question: 60,
    show_explanations: true,
    enable_ai_hints: true,
    allow_negative_scores: false,
  });

  const addTeam = () => {
    if (teams.length >= 6) {
      toast.error('Maximum 6 teams allowed');
      return;
    }
    setTeams([
      ...teams,
      {
        name: `Team ${teams.length + 1}`,
        color: teamColors[teams.length % teamColors.length],
      },
    ]);
  };

  const removeTeam = (index: number) => {
    if (teams.length <= 2) {
      toast.error('Minimum 2 teams required');
      return;
    }
    setTeams(teams.filter((_, i) => i !== index));
  };

  const updateTeam = (index: number, field: keyof TeamSetup, value: string) => {
    const newTeams = [...teams];
    newTeams[index][field] = value;
    setTeams(newTeams);
  };

  const startGame = async () => {
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    if (teams.some((t) => !t.name.trim())) {
      toast.error('All teams must have names');
      return;
    }

    setLoading(true);
    try {
      const request: CreateSessionRequest = {
        name: sessionName,
        industry_pack: selectedPack,
        teams: teams.map((t) => ({ name: t.name, color: t.color })),
        settings,
      };

      const { session } = await gameService.createSession(request);
      toast.success('Game started!');
      navigate(`/game/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="max-w-4xl w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-4 border-jeopardy-gold shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bold text-jeopardy-gold mb-2 text-center">
          🔥 Cyber Jeopardy Madness
        </h1>
        <p className="text-center text-slate-300 mb-8">
          Federal Credit Union Cybersecurity Training System
        </p>

        {/* Session Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Session Name
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="input"
            placeholder="e.g., Q4 Security Training"
          />
        </div>

        {/* Industry Pack Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Industry Pack
          </label>
          <select
            value={selectedPack}
            onChange={(e) => setSelectedPack(e.target.value)}
            className="input"
          >
            {industryPacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.icon} {pack.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-400 mt-2">
            {industryPacks.find((p) => p.id === selectedPack)?.description}
          </p>
        </div>

        {/* Teams */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-slate-300">
              Teams ({teams.length})
            </label>
            <button onClick={addTeam} className="btn-secondary text-sm">
              <Plus className="w-4 h-4 inline mr-1" />
              Add Team
            </button>
          </div>

          <div className="space-y-3">
            {teams.map((team, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => updateTeam(index, 'name', e.target.value)}
                  className="input flex-1"
                  placeholder="Team name"
                />
                <input
                  type="color"
                  value={team.color}
                  onChange={(e) => updateTeam(index, 'color', e.target.value)}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <button
                  onClick={() => removeTeam(index)}
                  className="btn-danger text-sm"
                  disabled={teams.length <= 2}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-300 mb-4">
            Game Settings
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Time per Question (seconds)
              </label>
              <input
                type="number"
                value={settings.time_per_question}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    time_per_question: parseInt(e.target.value),
                  })
                }
                className="input"
                min="10"
                max="300"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.show_explanations}
                  onChange={(e) =>
                    setSettings({ ...settings, show_explanations: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span className="text-sm">Show Explanations</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enable_ai_hints}
                  onChange={(e) =>
                    setSettings({ ...settings, enable_ai_hints: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span className="text-sm">Enable AI Hints</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.allow_negative_scores}
                  onChange={(e) =>
                    setSettings({ ...settings, allow_negative_scores: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span className="text-sm">Allow Negative Scores</span>
              </label>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          disabled={loading}
          className="btn-primary w-full text-lg py-4"
        >
          <Play className="w-5 h-5 inline mr-2" />
          {loading ? 'Starting...' : 'Start Game'}
        </button>
      </motion.div>
    </div>
  );
};
