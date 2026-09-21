import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function FilterToolbar({
  search,
  setSearch,
  selectedSubject,
  setSelectedSubject,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  subjects,
  counts
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {/* Search input */}
        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search topic or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Subject filter */}
        <select
          className="filter-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="ALL">All Subjects ({subjects.length})</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        {/* Status Filter Buttons */}
        <div className="filter-pills">
          <button
            type="button"
            className={`pill-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            className={`pill-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending ({counts.pending})
          </button>
          <button
            type="button"
            className={`pill-btn ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completed ({counts.completed})
          </button>
        </div>
      </div>

      {/* Sort order toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Sort:
        </span>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          onClick={() => setSortBy(sortBy === 'serial' ? 'date' : 'serial')}
          title="Toggle sort order"
        >
          <ArrowUpDown size={14} />
          {sortBy === 'serial' ? 'By Serial #' : 'By Target Date'}
        </button>
      </div>
    </div>
  );
}
