import React from 'react';
import { Check, Clock, Calendar } from 'lucide-react';

export default function MilestoneTable({ milestones, onTriggerToggle, currentDateStr = '2026-09-21' }) {
  // Format Date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(year, parseInt(month) - 1, day);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format Timestamp when checked
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      // Format: 21 Sep 2026, 19:35:12
      const datePart = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timePart = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return String(timestamp);
    }
  };

  // Check date urgency
  const getDateUrgency = (targetDateStr) => {
    if (!targetDateStr) return null;
    if (targetDateStr === currentDateStr) {
      return { label: 'TODAY', className: 'today' };
    }
    if (targetDateStr < currentDateStr) {
      return { label: 'DUE', className: 'overdue' };
    }
    return null;
  };

  if (milestones.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          [ No milestones match the current filter or search query ]
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="milestone-table">
        <thead>
          <tr>
            <th className="col-serial">#</th>
            <th className="col-status">Status / Checkbox & Timestamp</th>
            <th className="col-subject">Subject</th>
            <th className="col-topic">Topics / Milestone</th>
            <th className="col-date">Target Date</th>
            <th className="col-remarks">Remarks & Notes</th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((milestone) => {
            const urgency = getDateUrgency(milestone.targetDate);
            const formattedCompletedAt = formatTimestamp(milestone.completedAt);

            return (
              <tr
                key={milestone.id || milestone.serialNumber}
                className={`milestone-row ${milestone.completed ? 'completed-row' : ''}`}
              >
                {/* S.No */}
                <td className="col-serial mono">
                  {String(milestone.serialNumber).padStart(2, '0')}
                </td>

                {/* Checkbox & Timestamp */}
                <td className="col-status">
                  <div className="status-cell-wrapper">
                    <button
                      type="button"
                      className={`custom-checkbox-btn ${milestone.completed ? 'checked' : ''}`}
                      onClick={() => onTriggerToggle(milestone)}
                      title={
                        milestone.completed
                          ? 'Click to uncheck (password confirmation required)'
                          : 'Click to mark completed (password confirmation required)'
                      }
                      aria-label={`Milestone #${milestone.serialNumber} status: ${
                        milestone.completed ? 'Completed' : 'Pending'
                      }`}
                    >
                      {milestone.completed && <Check size={16} strokeWidth={3} />}
                    </button>

                    {milestone.completed ? (
                      <div className="timestamp-badge">
                        <span className="timestamp-label">Checked On</span>
                        <span className="timestamp-time">
                          <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                          {formattedCompletedAt}
                        </span>
                      </div>
                    ) : (
                      <span className="pending-label">Pending</span>
                    )}
                  </div>
                </td>

                {/* Subject */}
                <td className="col-subject">
                  <span className="subject-badge">{milestone.subject}</span>
                </td>

                {/* Topic */}
                <td className="col-topic">
                  <span className={`topic-text ${milestone.completed ? 'completed-topic' : ''}`}>
                    {milestone.topic}
                  </span>
                </td>

                {/* Target Date */}
                <td className="col-date">
                  <div className="target-date">
                    <Calendar size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-1px' }} />
                    {formatDate(milestone.targetDate)}
                  </div>
                  {urgency && !milestone.completed && (
                    <span className={`date-status ${urgency.className}`}>
                      [{urgency.label}]
                    </span>
                  )}
                </td>

                {/* Remarks & Notes */}
                <td className="col-remarks">
                  {milestone.remarks ? (
                    <span className="remarks-badge">{milestone.remarks}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
