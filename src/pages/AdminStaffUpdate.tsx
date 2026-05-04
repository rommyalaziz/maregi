import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Loader2, Save, RotateCcw, ImagePlus } from 'lucide-react';

const AdminStaffUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('Mei');
  const [selectedTahun, setSelectedTahun] = useState('2026');
  
  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for the form data (all categories)
  const [formData, setFormData] = useState({
    release_voucher: 0,
    unapprove_pengajuan: 0,
    recalculate_delinquency: 0,
    transfer_pencairan: 0,
    salah_generate: 0,
    ppi_not_entry: 0,
    validasi: 0,
    tiket_perbaikan: 0,
    lain_lain: 0
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    { id: 'release_voucher', name: 'Release Voucher' },
    { id: 'unapprove_pengajuan', name: 'Unapprove Pengajuan' },
    { id: 'recalculate_delinquency', name: 'Recalculate Delinquency' },
    { id: 'transfer_pencairan', name: 'Transfer Pencairan' },
    { id: 'salah_generate', name: 'Salah Generate' },
    { id: 'ppi_not_entry', name: 'PPI Not Entry' },
    { id: 'validasi', name: 'Validasi' },
    { id: 'tiket_perbaikan', name: 'Tiket Perbaikan' },
    { id: 'lain_lain', name: 'Lain-lain' },
  ];

  // 1. Fetch staff names for the dropdown
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        setFetchLoading(true);
        const { data, error } = await supabase
          .from('staff_progress')
          .select('id, name, branch')
          .order('name');
        
        if (error) throw error;
        
        const uniqueStaff = Array.from(new Map(data.map(item => [item.id, item])).values());
        setStaffList(uniqueStaff);
        
        if (uniqueStaff.length > 0) {
          setSelectedStaffId(uniqueStaff[0].id);
        }
      } catch (err) {
        console.error('Error fetching staff list:', err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchStaffList();
  }, []);

  // 2. Fetch specific data when Staff or Periode changes
  useEffect(() => {
    if (!selectedStaffId || !selectedPeriode) return;

    const fetchCurrentValues = async () => {
      setLoading(true);
      try {
        let q = supabase
          .from('staff_progress')
          .select('*')
          .eq('id', selectedStaffId)
          .eq('periode', selectedPeriode)
          .eq('tahun', parseInt(selectedTahun));

        const { data, error } = await q.single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setFormData({
            release_voucher: data.release_voucher || 0,
            unapprove_pengajuan: data.unapprove_pengajuan || 0,
            recalculate_delinquency: data.recalculate_delinquency || 0,
            transfer_pencairan: data.transfer_pencairan || 0,
            salah_generate: data.salah_generate || 0,
            ppi_not_entry: data.ppi_not_entry || 0,
            validasi: data.validasi || 0,
            tiket_perbaikan: data.tiket_perbaikan || 0,
            lain_lain: data.lain_lain || 0
          });
          setAvatarPreview(data.avatar_url || null);
        } else {
          setFormData({
            release_voucher: 0, unapprove_pengajuan: 0, recalculate_delinquency: 0,
            transfer_pencairan: 0, salah_generate: 0, ppi_not_entry: 0,
            validasi: 0, tiket_perbaikan: 0, lain_lain: 0
          });
          setAvatarPreview(null);
        }
        setAvatarFile(null); // Reset pending file
      } catch (err) {
        console.error('Error fetching current values:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentValues();
  }, [selectedStaffId, selectedPeriode, selectedTahun]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [id]: numValue }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const staffInfo = staffList.find(s => s.id === selectedStaffId);
      let avatar_url = avatarPreview;

      console.log('Attempting update for:', selectedStaffId, selectedPeriode);

      // 1. Handle File Upload if there's a new file
      if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${selectedStaffId}_${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

          if (uploadError) {
             console.error('Storage Error:', uploadError);
             if (uploadError.message === 'Bucket not found') {
               throw new Error('Penyimpanan foto gagal: Anda belum membuat bucket "avatars" di Supabase Dashboard.');
             }
             throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          
          avatar_url = publicUrl;
      }
      
      const payload = {
        id: selectedStaffId,
        periode: selectedPeriode,
        tahun: parseInt(selectedTahun),
        name: staffInfo?.name,
        branch: staffInfo?.branch,
        avatar_url,
        ...formData
      };

      console.log('Sending payload:', payload);

      // Update process
      await supabase
        .from('staff_progress')
        .update(payload)
        .eq('id', selectedStaffId)
        .eq('periode', selectedPeriode)
        .eq('tahun', parseInt(selectedTahun));

      // Post-save: If an avatar was uploaded, sync it to ALL months for this staff
      if (avatar_url) {
        await supabase
          .from('staff_progress')
          .update({ avatar_url })
          .eq('id', selectedStaffId);
        console.log('Avatar synced globally for staff:', selectedStaffId);
      }

      setMessage({ type: 'success', text: `Data ${staffInfo?.name} berhasil diperbarui.` });
      setAvatarFile(null);
    } catch (err: any) {
      console.error('Final Caught Error:', err);
      // If it's the RLS error, give a more helpful instruction
      const errorMsg = err.message || 'Gagal memperbarui data';
      if (errorMsg.includes('row-level security')) {
        setMessage({ 
          type: 'error', 
          text: 'Database masih menolak akses (RLS). Pastikan Anda sudah menjalankan SQL Super Reset di Supabase Dashboard.' 
        });
      } else {
        setMessage({ type: 'error', text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Hapus SEMUA data kesalahan di periode ${selectedPeriode} ${selectedTahun}?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('staff_progress')
        .delete()
        .eq('periode', selectedPeriode)
        .eq('tahun', parseInt(selectedTahun));

      if (error) throw error;
      setMessage({ type: 'success', text: `Seluruh data periode ${selectedPeriode} ${selectedTahun} telah dihapus.` });
      setFormData({
        release_voucher: 0, unapprove_pengajuan: 0, recalculate_delinquency: 0,
        transfer_pencairan: 0, salah_generate: 0, ppi_not_entry: 0,
        validasi: 0, tiket_perbaikan: 0, lain_lain: 0
      });
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
    <div className="page-container" style={{ padding: '16px 20px' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', marginBottom: '4px' }}>Update Kesalahan Staf</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Panel entri cepat untuk manajemen performa dan poin absolut staf.</p>
        </div>
      </div>

      <div className="admin-update-content" style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
        <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          
          {/* HEADER SECTON: Avatar + Selectors in one row */}
          <div style={{ 
            padding: '16px', 
            background: 'var(--color-bg-alt)', 
            borderBottom: '1px solid var(--color-border)', 
            display: 'flex', 
            gap: '20px', 
            alignItems: 'center', 
            flexWrap: 'wrap' 
          }}>
            
            {/* Avatar Badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', background: '#e2e8f0' }}>
                <img 
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffList.find(s => s.id === selectedStaffId)?.name || 'Staf')}&background=random&color=fff&bold=true`} 
                  alt="Staf" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--color-primary)', color: 'white', border: '2px solid white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                title="Ubah Foto"
              >
                <ImagePlus size={12} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            </div>

            {/* Selectors */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pilih Staf</label>
                <select 
                  className="btn btn-outline w-full" 
                  style={{ height: '36px', padding: '0 10px', fontSize: '13px', background: 'white' }}
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tahun</label>
                <select 
                  className="btn btn-outline w-full" 
                  style={{ height: '36px', padding: '0 10px', fontSize: '13px', background: 'white' }}
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bulan</label>
                <select 
                  className="btn btn-outline w-full" 
                  style={{ height: '36px', padding: '0 10px', fontSize: '13px', background: 'white' }}
                  value={selectedPeriode}
                  onChange={(e) => setSelectedPeriode(e.target.value)}
                >
                  {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} style={{ padding: '20px' }}>
            
            {/* SUCCESS/ERROR MESSAGE */}
            {message.text && (
              <div style={{ 
                padding: '10px 14px', borderRadius: '6px', marginBottom: '16px',
                backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: message.type === 'success' ? '#065F46' : '#991B1B',
                fontSize: '13px', border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
              }}>
                <Save size={16} />
                {message.text}
              </div>
            )}

            {/* COMPACT 3-COLUMN GRID */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              {categories.map(c => (
                <div 
                  key={c.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    background: 'var(--color-bg-alt)', 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--color-border)',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.025em', maxWidth: '140px', lineHeight: '1.3' }}>
                    {c.name}
                  </label>
                  <input 
                    type="number" 
                    className="btn btn-outline" 
                    style={{ 
                      width: '64px', 
                      height: '32px', 
                      textAlign: 'center', 
                      fontSize: '15px', 
                      fontWeight: '700', 
                      padding: '0',
                      background: 'white',
                      color: 'var(--color-text)'
                    }}
                    value={(formData as any)[c.id]}
                    onChange={(e) => handleInputChange(c.id, e.target.value)}
                    min="0"
                  />
                </div>
              ))}
            </div>

            {/* ACTIONS ROW */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading} 
                style={{ flex: 1, justifyContent: 'center', height: '42px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.025em' }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span style={{ marginLeft: '8px' }}>Simpan Perubahan</span>
              </button>
              
              <button 
                type="button"
                onClick={handleReset} 
                className="btn btn-outline" 
                style={{ width: '42px', padding: 0, color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2', justifyContent: 'center', height: '42px' }}
                disabled={loading}
                title="Reset Periode Ini"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminStaffUpdate;
