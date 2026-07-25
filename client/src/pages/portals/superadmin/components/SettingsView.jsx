import React from 'react';
import { Settings, LogOut } from 'lucide-react';

/**
 * SettingsView — Account & platform configuration (stub - to be expanded)
 */
const SettingsView = ({ logout }) => (
  <div>
    <div className="section-header">
      <div>
        <div className="section-title">Settings</div>
        <div className="section-sub">Account &amp; platform configuration</div>
      </div>
    </div>
    <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--sa-text3)' }}>
      <Settings style={{ width: 32, height: 32, margin: '0 auto 12px', opacity: 0.3 }} />
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Settings panel coming soon</div>
      <div style={{ fontSize: 12, marginBottom: 20 }}>Profile, notifications, and API key management will appear here.</div>
      <button className="btn btn-danger" onClick={logout}>
        <LogOut style={{ width: 13, height: 13 }} />Sign Out
      </button>
    </div>
  </div>
);

export default SettingsView;
