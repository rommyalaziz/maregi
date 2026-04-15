import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Trophy, AlertCircle, Users, ClipboardCheck, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    avgKPI: 0,
    totalStaff: 0,
    totalTickets: 0,
    needSupport: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: staff, error } = await supabase
        .from('staff_progress')
        .select('*');

      if (error) throw error;

      if (staff) {
        setData(staff);
        
        // Calculate Summary
        const totalStaff = staff.length;
        const avgKPI = Math.round(staff.reduce((acc, curr) => acc + (curr.performance || 0), 0) / (totalStaff || 1));
        const totalTickets = staff.reduce((acc, curr) => acc + (curr.tiket_perbaikan || 0), 0);
        const needSupport = staff.filter(s => s.status === 'critical' || s.status === 'delayed' || s.status === 'need improve').length;

        setSummary({ avgKPI, totalStaff, totalTickets, needSupport });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...data].sort((a, b) => b.performance - a.performance);
  const top2 = sortedData.slice(0, 2);
  const bottom2 = [...sortedData].reverse().slice(0, 2);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Menyiapkan data performa...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Ringkasan Beranda</h1>
        <p>Analisis pencapaian dan dukungan untuk progres staf regional.</p>
      </div>

      <div className="highlights-grid">
        {/* BEST PERFORMERS */}
        <Card className="highlight-card success-gradient">
          <div className="highlight-header">
            <Trophy size={24} className="icon-gold" />
            <div>
              <h3>Apresiasi Kinerja Terbaik</h3>
              <p className="welcome-msg">Selamat atas pencapaian luar biasa Anda!</p>
            </div>
          </div>
          <div className="highlight-list">
            {top2.map(staff => (
              <div key={staff.id} className="highlight-item">
                <div className="item-info">
                  <span className="name">{staff.name}</span>
                  <span className="branch">{staff.branch}</span>
                </div>
                <div className="item-score">
                  <span className="score">{staff.performance}%</span>
                  <ProgressBar progress={staff.performance} color="#ffffff" height={6} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* NEEDS SUPPORT */}
        <Card className="highlight-card warning-gradient">
          <div className="highlight-header">
            <AlertCircle size={24} className="icon-white" />
            <div>
              <h3>Butuh Fokus Tambahan</h3>
              <p className="welcome-msg">Tetap semangat, mari kita tingkatkan progres!</p>
            </div>
          </div>
          <div className="highlight-list">
            {bottom2.map(staff => (
              <div key={staff.id} className="highlight-item">
                <div className="item-info">
                  <span className="name">{staff.name}</span>
                  <span className="branch">{staff.branch}</span>
                </div>
                <div className="item-score">
                  <span className="score">{staff.performance}%</span>
                  <ProgressBar progress={staff.performance} color="rgba(255,255,255,0.6)" height={6} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="section-title">Informasi Penting Performance Review</h2>
      <div className="metrics-grid">
        <Card className="metric-card">
          <div className="metric-header">
            <h3>Rata-rata KPI Regional</h3>
            <div className="metric-icon teal">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">{summary.avgKPI}%</div>
          <div className="metric-progress">
             <ProgressBar progress={summary.avgKPI} />
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-header">
            <h3>FSA/MSA Aktif</h3>
            <div className="metric-icon green-deep">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{summary.totalStaff}</div>
          <div className="metric-subtitle">Staf terdaftar di database</div>
        </Card>

        <Card className="metric-card">
          <div className="metric-header">
            <h3>Tiket Perbaikan</h3>
            <div className="metric-icon pink">
              <ClipboardCheck size={20} />
            </div>
          </div>
          <div className="metric-value">{summary.totalTickets}</div>
          <div className="metric-subtitle">Total anomali yang ditemukan</div>
        </Card>

        <Card className="metric-card">
          <div className="metric-header">
            <h3>Butuh Bimbingan</h3>
            <div className="metric-icon orange">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="metric-value">{summary.needSupport}</div>
          <div className="metric-subtitle">Staf dengan status Non-Track</div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
