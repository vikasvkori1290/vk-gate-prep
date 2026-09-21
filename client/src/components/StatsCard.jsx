import React from 'react';

export default function StatsCard({ stats, totalCount = 104 }) {
  const completed = stats?.completed || 0;
  const total = stats?.total || totalCount;
  const pending = stats?.pending ?? (total - completed);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Milestones</div>
          <div className="stat-value">
            {total}
            <span className="stat-sub">topics</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">
            {completed}
            <span className="stat-sub">/ {total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Remaining Pending</div>
          <div className="stat-value">
            {pending}
            <span className="stat-sub">tasks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">
            {percentage}%
            <span className="stat-sub">achieved</span>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>SYLLABUS PROGRESS TRACKER</span>
          <span className="mono">
            {completed} of {total} Milestones Done ({percentage}%)
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </>
  );
}
