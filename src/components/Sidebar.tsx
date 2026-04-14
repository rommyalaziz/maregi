import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, FileBarChart, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear the session from localStorage
    localStorage.removeItem('msa_session');
    // Force redirect back to login
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <div className="logo-icon"></div>
          <span className="logo-text">MAREGI</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} />
          <span>Beranda</span>
        </NavLink>
        <NavLink to="/branches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Building2 size={16} />
          <span>Progres Cabang</span>
        </NavLink>
        <NavLink to="/staff" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={16} />
          <span>Progres Staf</span>
        </NavLink>
        {/* Placeholder for future Reports view if needed */}
        <div className="nav-item disabled">
          <FileBarChart size={16} />
          <span>Laporan Detail</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
