import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X, Check } from 'lucide-react';

export default function PasswordModal({ isOpen, onClose, onConfirm, milestone, actionType = 'complete' }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen || !milestone) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter confirmation password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onConfirm(password);
      onClose();
    } catch (err) {
      setError(err.message || 'Incorrect password. Confirmation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Lock size={18} />
            {actionType === 'complete' ? 'Confirm Milestone Completion' : 'Confirm Milestone Reset'}
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-info-box">
              <div className="modal-info-row">
                <span className="modal-info-label">S.No:</span>
                <span className="modal-info-val mono">#{milestone.serialNumber}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Subject:</span>
                <span className="modal-info-val">{milestone.subject}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Topic:</span>
                <span className="modal-info-val">{milestone.topic}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Target:</span>
                <span className="modal-info-val mono">{milestone.targetDate}</span>
              </div>
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="tracker-password">
                Enter Password for Confirmation:
              </label>
              <div className="password-input-wrapper">
                <input
                  id="tracker-password"
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  className="password-input"
                  placeholder="Enter confirmation password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="password-help-note">
                * Correct password confirmation is required to log the completion timestamp.
              </p>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '0 1.5rem 1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                'Verifying...'
              ) : (
                <>
                  <Check size={16} />
                  {actionType === 'complete' ? 'Verify & Check' : 'Verify & Uncheck'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
