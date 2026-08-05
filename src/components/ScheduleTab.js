"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Play } from 'lucide-react';

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export default function ScheduleTab() {
  const [schedules, setSchedules] = useState([]);
  const [queries, setQueries] = useState('');
  const [type, setType] = useState('weekly');
  const [day, setDay] = useState(1);
  const [isRunning, setIsRunning] = useState(null);
  const [runResults, setRunResults] = useState(null);

  useEffect(() => { fetchSchedules(); }, []);

  const fetchSchedules = async () => {
    const res = await axios.get('/api/schedules');
    setSchedules(res.data || []);
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    const queryList = queries.split('\n').map(q => q.trim()).filter(Boolean);
    if (!queryList.length) return;
    await axios.post('/api/schedules', { queries: queryList, schedule_type: type, schedule_day: day });
    setQueries('');
    fetchSchedules();
  };

  const deleteSchedule = async (id) => {
    await axios.delete('/api/schedules', { data: { id } });
    fetchSchedules();
  };

  const toggleSchedule = async (schedule) => {
    await axios.put('/api/schedules', { id: schedule.id, is_active: !schedule.is_active });
    fetchSchedules();
  };

  const runNow = async (schedule) => {
    setIsRunning(schedule.id);
    setRunResults(null);
    try {
      const res = await axios.post('/api/search/batch', { queries: schedule.queries });
      setRunResults({ id: schedule.id, count: res.data.total, error: null });
    } catch (err) {
      setRunResults({ id: schedule.id, count: 0, error: 'Çalıştırma başarısız.' });
    } finally {
      setIsRunning(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Add New Schedule */}
      <div className="glass-panel">
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>⏰ Yeni Otomatik Tarama Planla</h2>
        <form onSubmit={addSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Arama Sorguları (Her satıra bir tane)</label>
            <textarea className="glass-input" rows={5} value={queries}
              onChange={e => setQueries(e.target.value)}
              placeholder={"Kadıköy oto yıkama\nBeşiktaş halı yıkama\nŞişli oto yıkama"}
              required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Tekrarlama Tipi</label>
              <select className="glass-select" value={type} onChange={e => setType(e.target.value)}>
                <option value="once">Bir Kez</option>
                <option value="daily">Her Gün</option>
                <option value="weekly">Her Hafta</option>
              </select>
            </div>
            {type === 'weekly' && (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Hangi Gün?</label>
                <select className="glass-select" value={day} onChange={e => setDay(parseInt(e.target.value))}>
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Plus size={18} /> Planı Kaydet
          </button>
        </form>
      </div>

      {/* Existing Schedules */}
      <div className="glass-panel">
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Kayıtlı Planlar ({schedules.length})</h2>
        {schedules.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Henüz kayıtlı plan yok.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {schedules.map(s => (
              <div key={s.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {s.queries.slice(0, 2).join(' / ')}{s.queries.length > 2 ? ` + ${s.queries.length - 2} tane daha` : ''}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {s.schedule_type === 'weekly' ? `Her ${DAYS[s.schedule_day]}` :
                     s.schedule_type === 'daily' ? 'Her Gün' : 'Bir Kez'}
                    {s.last_run ? ` · Son çalışma: ${new Date(s.last_run).toLocaleDateString('tr-TR')}` : ''}
                  </div>
                  {runResults?.id === s.id && (
                    <div style={{ marginTop: '6px', fontSize: '13px', color: runResults.error ? '#f87171' : '#34d399' }}>
                      {runResults.error || `✓ ${runResults.count} firma bulundu ve CRM'e eklendi!`}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`status-badge ${s.is_active ? 'status-success' : 'status-danger'}`}>
                    {s.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                  <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}
                    onClick={() => runNow(s)} disabled={isRunning === s.id}>
                    <Play size={14} /> {isRunning === s.id ? 'Çalışıyor...' : 'Şimdi Çalıştır'}
                  </button>
                  <button className="btn btn-outline" style={{ padding: '8px 12px', borderColor: s.is_active ? '#f59e0b' : '#10b981', color: s.is_active ? '#fbbf24' : '#34d399' }}
                    onClick={() => toggleSchedule(s)}>
                    {s.is_active ? 'Durdur' : 'Aktifleştir'}
                  </button>
                  <button className="btn btn-outline" style={{ padding: '8px 12px', borderColor: '#ef4444', color: '#f87171' }}
                    onClick={() => deleteSchedule(s.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
