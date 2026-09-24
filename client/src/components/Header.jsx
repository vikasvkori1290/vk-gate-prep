import React from 'react';
import { Target, Moon, Sun, KeyRound, Database } from 'lucide-react';

export default function Header({
  theme,
  toggleTheme,
  onOpenPasswordModal,
  dbStatus,
  stats
}) {
  // Calculate days remaining until 30 January 2027
  const calculateDaysLeft = () => {
    const today = new Date();
    const examDate = new Date(2027, 0, 30); // 30 Jan 2027
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft();

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="title-group">
          <h1>
            <Target size={28} strokeWidth={2.5} />
            Great Preparation 2027 Tracker of Vikas
          </h1>
          <p>
            Plain Black & White Milestone Log &bull; Target Exam Date: <strong>30 January 2027</strong> &bull;{' '}
            <span className="mono">{daysLeft} Days Remaining</span>
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={onOpenPasswordModal}
            title="Update confirmation password"
          >
            <KeyRound size={16} />
            Password
          </button>

          <button
            className="btn btn-outline"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'White BG' : 'Black BG'}
          </button>
        </div>
      </div>

      {/* Database Connection Status Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          padding: '0.4rem 0.75rem',
          border: '1px solid var(--border-strong)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={14} />
          <span>
            Storage: <strong>{dbStatus?.storageType || 'MongoDB Ready'}</strong>
          </span>
          {dbStatus?.isMongoConnected && (
            <span style={{ textDecoration: 'underline' }}>[LIVE CLUSTER]</span>
          )}
        </div>
        <div>
          <span>{stats?.total || 130} Daily Roadmap Milestones Loaded</span>
        </div>
      </div>
    </header>
  );
}
