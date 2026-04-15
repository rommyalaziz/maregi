import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Loader2, Save, RotateCcw } from 'lucide-react';

const AdminStaffUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('April');
  const [category, setCategory] = useState('release_voucher');
  const [value, setValue] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    { id: 'release_voucher', name: 'Release Voucher' },
    { id: 'unapprove_pengajuan', name: 'Unapprove Pengajuan' },
    { id: 'recalculate_delinquency', name: 'Recalculate Delinquency' },
    { id: 'transfer_pencairan', name: 'Transfer Pencairan S' },
    { id: 'salah_generate', name: 'Salah Generate' },
    { id: 'ppi_not_entry', name: 'PPI Not Entry' },
    { id: 'validasi', name: 'Validasi' },
    { id: 'tiket_perbaikan', name: 'Tiket Perbaikan' },
  ];

  useEffect(() => {
    fetchStaff();
  }, [selectedPeriode]);

  const fetchStaff = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('staff_progress')
        .select('id, name, branch')
        .eq('periode', selectedPeriode)
        .order('name');
      
      if (error) throw error;
      setStaffList(data || []);
      if (data && data.length > 0) setSelectedStaff(data[0].id);
      else setSelectedStaff('');
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || value < 0) return;

    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      // 1. Get current value
      const { data: currentData, error: fetchErr } = await supabase
        .from('staff_progress')
        .select(category)
        .eq('id', selectedStaff)
        .eq('periode', selectedPeriode)
        .single();

      if (fetchErr) throw fetchErr;

      const currentValue = (currentData as any)[category] || 0;
      const newValue = currentValue + value;

      // 2. Update with new value
      const { error: updateErr } = await supabase
        .from('staff_progress')
        .update({ [category]: newValue })
        .eq('id', selectedStaff)
        .eq('periode', selectedPeriode);

      if (updateErr) throw updateErr;

      setMessage({ type: 'success', text: `Berhasil menambah ${value} poin pada kategori ${categories.find(c => c.id === category)?.name}` });
      setValue(0);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui data' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin meriset SEMUA kesalahan staff menjadi 0 untuk periode ${selectedPeriode}?`)) return;

    setLoading(true);
    try {
      const resetData = {
        release_voucher: 0,
        unapprove_pengajuan: 0,
        recalculate_delinquency: 0,
        transfer_pencairan: 0,
        salah_generate: 0,
        ppi_not_entry: 0,
        validasi: 0,
        tiket_perbaikan: 0
      };

      const { error } = await supabase
        .from('staff_progress')
        .update(resetData)
        .eq('periode', selectedPeriode);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Seluruh data kesalahan berhasil direset ke 0.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal meriset data' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Update Kesalahan Staff</h1>
          <p>Kelola data harian kesalahan staff untuk perhitungan KPI.</p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <Card style={{ padding: '24px' }}>
          <form onSubmit={handleUpdate}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Pilih Periode</label>
              <select 
                className="btn btn-outline w-full" 
                style={{ textAlign: 'left', appearance: 'auto', padding: '10px' }}
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                required
              >
                <option value="April">April</option>
                <option value="Maret">Maret</option>
                <option value="Februari">Februari</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Pilih Staff</label>
              <select 
                className="btn btn-outline w-full" 
                style={{ textAlign: 'left', appearance: 'auto', padding: '10px' }}
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                required
              >
                {staffList.length === 0 ? (
                  <option value="">Tidak ada staff di periode ini</option>
                ) : (
                  staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.branch})</option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Kategori Kesalahan</label>
              <select 
                className="btn btn-outline w-full" 
                style={{ textAlign: 'left', appearance: 'auto', padding: '10px' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Jumlah Kesalahan Baru</label>
              <input 
                type="number" 
                className="btn btn-outline w-full" 
                style={{ textAlign: 'left', padding: '10px' }}
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                min="0"
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                *Sistem akan menambahkan angka ini ke total kesalahan saat ini.
              </p>
            </div>

            {message.text && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.type === 'success' ? '#16a34a' : '#dc2626',
                fontSize: '14px',
                border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span style={{ marginLeft: '8px' }}>Simpan Update</span>
              </button>
            </div>
          </form>
        </Card>

        <Card style={{ padding: '24px', marginTop: '24px', border: '1px border var(--color-danger-light)' }}>
          <h3 style={{ color: 'var(--color-danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} /> Area Berbahaya
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Gunakan tombol ini hanya di awal bulan baru untuk meriset semua data kesalahan staff menjadi nol. Tindakan ini tidak dapat dibatalkan.
          </p>
          <button 
            onClick={handleReset} 
            className="btn btn-outline" 
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            Reset Semua Data Bulanan
          </button>
        </Card>
      </div>
    </div>
  );
};

export default AdminStaffUpdate;
