import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Trophy, AlertCircle, Users, ClipboardCheck, MessageSquare, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('Mei');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [userRole, setUserRole] = useState('');
  const [summary, setSummary] = useState({
    avgKPI: 0,
    totalStaff: 0,
    totalTickets: 0,
    needSupport: 0
  });

  useEffect(() => {
    const fetchSettingsAndData = async () => {
      try {
        // Fetch User Role
        const session = sessionStorage.getItem('msa_session');
        if (session) setUserRole(JSON.parse(session).role);

        // Fetch Global Settings
        const { data: settings } = await supabase
          .from('global_settings')
          .select('value')
          .eq('id', 'dashboard_period')
          .single();

        if (settings) {
          const activeMonth = settings.value.month;
          const activeYear = settings.value.year.toString();
          setSelectedMonth(activeMonth);
          setSelectedYear(activeYear);
          
          // Fetch data immediately using these values instead of waiting for state update
          await fetchDashboardDataInternal(activeMonth, activeYear);
        } else {
          fetchDashboardData();
        }
      } catch (err) {
        console.error('Error fetching global settings:', err);
        fetchDashboardData();
      }
    };

    fetchSettingsAndData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = () => {
    fetchDashboardDataInternal(selectedMonth, selectedYear);
  };

  const fetchDashboardDataInternal = async (month: string, year: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('v_staff_report')
        .select('*');
        
      if (month !== 'Semua') {
        query = query.eq('periode', month);
      }
      if (year !== 'Semua') {
        query = query.eq('tahun', parseInt(year));
      }

      const { data: staff, error } = await query;

      if (error) throw error;

      if (staff) {
        // Calculate Total KPI for each staff
        const calcPts = (val: number, params: any) => {
          for (const p of params) {
            if (val >= p.min && val <= p.max) return p.pts;
          }
          return 0;
        };

        const processedStaff = staff.map(s => {
          // Fix p_sg locally to override the faulty SQL view value
          const p_sg_fixed = calcPts(s.salah_generate || 0, [{min:0,max:0,pts:10},{min:1,max:1,pts:6},{min:2,max:3,pts:2},{min:4,max:5,pts:1},{min:6,max:999,pts:0}]);

          const totalKPI = (s.p_rv || 0) + (s.p_up || 0) + (s.p_rd || 0) + (s.p_tp || 0) + 
                           p_sg_fixed + (s.p_ppi || 0) + (s.p_val || 0) + (s.p_tpk || 0) + (s.p_ll || 0);
          
          let status = 'critical';
          if (totalKPI >= 90) status = 'on-track';
          else if (totalKPI >= 70) status = 'delayed';
          
          return { ...s, totalKPI, status };
        });

        setData(processedStaff);
        
        // Calculate Summary (Unique Staff Count)
        const uniqueStaffIds = new Set(processedStaff.map(s => s.id));
        const totalStaff = uniqueStaffIds.size;
        const avgKPI = Math.round(processedStaff.reduce((acc, curr) => acc + (curr.totalKPI || 0), 0) / (processedStaff.length || 1));
        const totalTickets = processedStaff.reduce((acc, curr) => acc + (curr.tpk || 0), 0);
        const needSupport = processedStaff.filter(s => s.status === 'critical' || s.status === 'delayed').length;

        setSummary({ avgKPI, totalStaff, totalTickets, needSupport });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...data].sort((a, b) => (b.totalKPI || 0) - (a.totalKPI || 0));
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
        <div className="dashboard-header-title">
          <h1>Ringkasan Beranda</h1>
          <p>Analisis capaian progress MSA</p>
        </div>
        {userRole === 'Administrator' && (
          <div className="dashboard-filters">
            <div className="filter-group">
              <Filter size={16} color="#6b7280" />
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="filter-select"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="Semua">Semua Tahun</option>
              </select>
            </div>
            <div className="filter-group">
              <Filter size={16} color="#6b7280" />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="filter-select"
              >
                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktober">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
                <option value="Semua">Semua Bulan</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="highlights-grid">
        {/* BEST PERFORMERS */}
        <Card className="highlight-card success-gradient">
          <div className="highlight-header">
            <Trophy size={20} className="icon-gold" />
            <div>
              <h3>Apresiasi Kinerja Terbaik</h3>
              <p className="welcome-msg">Selamat atas pencapaian luar biasa Anda!</p>
            </div>
          </div>
          <div className="highlight-list">
            {top2.map(staff => (
              <div key={staff.id} className="highlight-item">
                <div className="avatar-wrapper highlight-avatar">
                   <img 
                     src={staff.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=dcfce7&color=166534&bold=true`} 
                     alt={staff.name} 
                   />
                </div>
                <div className="item-info">
                  <span className="name">{staff.name}</span>
                </div>
                <div className="item-score">
                  <span className="score">{staff.totalKPI}%</span>
                  <ProgressBar progress={staff.totalKPI} color="#16a34a" height={6} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* NEEDS SUPPORT */}
        <Card className="highlight-card warning-gradient">
          <div className="highlight-header">
            <AlertCircle size={20} className="icon-amber" />
            <div>
              <h3>Butuh Fokus Tambahan</h3>
              <p className="welcome-msg">Tetap semangat, mari kita tingkatkan progres!</p>
            </div>
          </div>
          <div className="highlight-list">
            {bottom2.map(staff => (
              <div key={staff.id} className="highlight-item">
                <div className="avatar-wrapper highlight-avatar">
                   <img 
                     src={staff.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=fef3c7&color=92400e&bold=true`} 
                     alt={staff.name} 
                   />
                </div>
                <div className="item-info">
                  <span className="name">{staff.name}</span>
                </div>
                <div className="item-score">
                  <span className="score">{staff.totalKPI}%</span>
                  <ProgressBar progress={staff.totalKPI} color="#d97706" height={6} />
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
            <h3>Rata-rata Point Regional</h3>
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
            <h3>Butuh Support</h3>
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
