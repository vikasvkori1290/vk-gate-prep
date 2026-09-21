import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import MilestoneTable from './components/MilestoneTable';
import PasswordModal from './components/PasswordModal';
import ChangePasswordModal from './components/ChangePasswordModal';

export default function App() {
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme state: 'dark' (pure black background) or 'light' (white background)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vk_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Modal states
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [modalAction, setModalAction] = useState('complete'); // 'complete' or 'uncheck'
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vk_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch initial data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [milestonesRes, statsRes, statusRes] = await Promise.all([
        fetch('/api/milestones'),
        fetch('/api/milestones/stats'),
        fetch('/api/milestones/status')
      ]);

      const milestonesJson = await milestonesRes.json();
      const statsJson = await statsRes.json();
      const statusJson = await statusRes.json();

      if (milestonesJson.success) {
        setMilestones(milestonesJson.data);
      }
      if (statsJson.success) {
        setStats(statsJson.data);
      }
      if (statusJson.success) {
        setDbStatus(statusJson.data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load milestones:', err);
      setError('Could not connect to backend server. Make sure server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sorted milestones by serial number
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => a.serialNumber - b.serialNumber);
  }, [milestones]);

  // Handle clicking checkbox on a milestone
  const handleTriggerToggle = (milestone) => {
    setActiveMilestone(milestone);
    setModalAction(milestone.completed ? 'uncheck' : 'complete');
    setIsPasswordModalOpen(true);
  };

  // Confirm password and execute toggle API
  const handleConfirmPassword = async (password) => {
    if (!activeMilestone) return;
    const newCompletedState = !activeMilestone.completed;
    const id = activeMilestone.id || activeMilestone.serialNumber;

    const res = await fetch(`/api/milestones/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        completed: newCompletedState
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Incorrect password.');
    }

    // Update local state with the returned updated milestone
    const updatedMilestone = data.data;
    setMilestones((prev) =>
      prev.map((m) =>
        (m.id === updatedMilestone.id || m.serialNumber === updatedMilestone.serialNumber)
          ? updatedMilestone
          : m
      )
    );

    // Refresh overall stats
    fetch('/api/milestones/stats')
      .then((r) => r.json())
      .then((s) => {
        if (s.success) setStats(s.data);
      })
      .catch(() => {});
  };

  return (
    <div className="app-container">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenPasswordModal={() => setIsSettingsModalOpen(true)}
        dbStatus={dbStatus}
        stats={stats}
      />

      {error && (
        <div className="error-message" style={{ marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      <StatsCard stats={stats} totalCount={milestones.length || 104} />

      {loading ? (
        <div className="table-wrapper">
          <div className="empty-state mono">
            [ Loading 104 GATE preparation milestones... ]
          </div>
        </div>
      ) : (
        <MilestoneTable
          milestones={sortedMilestones}
          onTriggerToggle={handleTriggerToggle}
        />
      )}

      {/* Confirmation Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleConfirmPassword}
        milestone={activeMilestone}
        actionType={modalAction}
      />

      {/* Settings / Change Password Modal */}
      <ChangePasswordModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>
            Great Preparation 2027 Tracker of Vikas &bull; Target: 30 Jan 2027 &bull; Total{' '}
            {sortedMilestones.length} Milestones
          </span>
        </div>
        <div className="mono">
          Strict Black & White Audit Mode
        </div>
      </footer>
    </div>
  );
}
