import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Loader2, Save, RotateCcw, ImagePlus } from 'lucide-react';

const AdminStaffUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('April');
  
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
        const { data, error } = await supabase
          .from('staff_progress')
          .select('*')
          .eq('id', selectedStaffId)
          .eq('periode', selectedPeriode)
          .single();

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
  }, [selectedStaffId, selectedPeriode]);

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
        .eq('periode', selectedPeriode);

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
    if (!window.confirm(`Hapus SEMUA data kesalahan di periode ${selectedPeriode}?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('staff_progress')
        .delete()
        .eq('periode', selectedPeriode);

      if (error) throw error;
      setMessage({ type: 'success', text: `Seluruh data periode ${selectedPeriode} telah dihapus.` });
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
    <div className="page-container" style={{ padding: '10px 20px' }}>
      <div className="page-header" style={{ marginBottom: '12px' }}>
        <div>
          <h1 style={{ fontSize: '18px', marginBottom: '2px' }}>Manajemen Staf & Poin</h1>
          <p style={{ fontSize: '11px' }}>Kelola profil dan total kesalahan secara absolut.</p>
        </div>
      </div>

      <div className="admin-update-content" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <Card style={{ padding: '16px' }}>
          {/* SELECTORS ROW */}
          <div className="selectors-row" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px', 
            marginBottom: '12px', 
            borderBottom: '1px solid var(--color-border)', 
            paddingBottom: '12px' 
          }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '12px' }}>Periode</label>
              <select 
                className="btn btn-outline w-full" 
                style={{ textAlign: 'left', appearance: 'auto', padding: '6px 10px', height: '44px', fontSize: '14px' }}
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
              >
                <option value="April">April</option>
                <option value="Maret">Maret</option>
                <option value="Februari">Februari</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '12px' }}>Pilih Staf</label>
              <select 
                className="btn btn-outline w-full" 
                style={{ textAlign: 'left', appearance: 'auto', padding: '6px 10px', height: '44px', fontSize: '14px' }}
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            {/* COMPACT AVATAR SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
               <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                    <img 
                      src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(staffList.find(s => s.id === selectedStaffId)?.name || 'Staf')}&background=random&color=fff&bold=true`} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    <ImagePlus size={12} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
               </div>
               <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0', fontSize: '14px', fontWeight: 600 }}>Foto Profil Staf</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)' }}>{avatarFile ? `Siap unggah: ${avatarFile.name}` : 'Ketuk ikon untuk mengubah foto'}</p>
               </div>
            </div>

            {/* ERROR/SUCCESS MESSAGE */}
            {message.text && (
              <div style={{ 
                padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px',
                backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: message.type === 'success' ? '#065F46' : '#991B1B',
                fontSize: '13px', border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Save size={16} />
                {message.text}
              </div>
            )}

            {/* CATEGORIES GRID - Fully Responsive */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
              gap: '12px', 
              marginBottom: '20px' 
            }}>
              {categories.map(c => (
                <div key={c.id} className="form-group">
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    {c.name}
                  </label>
                  <input 
                    type="number" 
                    className="btn btn-outline w-full" 
                    style={{ textAlign: 'left', padding: '10px 14px', fontSize: '15px', fontWeight: '700', height: '44px' }}
                    value={(formData as any)[c.id]}
                    onChange={(e) => handleInputChange(c.id, e.target.value)}
                    min="0"
                  />
                </div>
              ))}
            </div>

            <div className="admin-actions-row" style={{ display: 'flex', gap: '12px' }}>
               <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center', height: '48px', fontSize: '15px', fontWeight: 600 }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span style={{ marginLeft: '10px' }}>Simpan Perubahan</span>
              </button>
              
              <button 
                type="button"
                onClick={handleReset} 
                className="btn btn-outline" 
                style={{ width: '48px', padding: 0, color: 'var(--color-danger)', borderColor: '#FECACA', justifyContent: 'center', height: '48px' }}
                disabled={loading}
                title="Reset Periode"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminStaffUpdate;
