import React, { useState } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DailyReport, ProgressItem } from '../types';
import { Save, Upload, X, Loader2, Plus, Trash2, Sparkles, FileText, Download, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ReportFormProps {
  onComplete: () => void;
}

export default function ReportForm({ onComplete }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState<Partial<DailyReport>>({
    date: new Date().toISOString().split('T')[0],
    weather: { morning: 'Nắng', afternoon: 'Nắng', evening: 'Nắng' },
    personnel: { total: 43, positions: {}, contractors: {} },
    financials: { contractValue: 568791724932, temporaryOutput: 15007900980, remainingValue: 553783823952 },
    civilItems: [
      { id: 1, description: 'Phát hoang mặt bằng', unit: 'm2', target: 298842, completedToday: 0, totalCompleted: 298842, progress: 100, planStart: '', planEnd: '', issues: '', notes: '' },
      { id: 2, description: 'Đúc cọc bê tông', unit: 'cọc', target: 12972, completedToday: 0, totalCompleted: 9931, progress: 76.6, planStart: '', planEnd: '', issues: '', notes: '' },
      { id: 3, description: 'Vận chuyển cọc bê tông', unit: 'cọc', target: 12972, completedToday: 160, totalCompleted: 1050, progress: 8.1, planStart: '', planEnd: '', issues: '', notes: '' },
    ],
    equipmentItems: [
      { id: 1, description: 'Máy biến áp', unit: 'máy', target: 1, completedToday: 0, totalCompleted: 0, progress: 0, planStart: '', planEnd: '', issues: '', notes: '' },
      { id: 2, description: 'Máy biến tần', unit: 'bộ', target: 12, completedToday: 0, totalCompleted: 0, progress: 0, planStart: '', planEnd: '', issues: '', notes: '' },
      { id: 3, description: 'Giá đỡ tấm pin', unit: 'line', target: 2606, completedToday: 0, totalCompleted: 0, progress: 0, planStart: '', planEnd: '', issues: '', notes: '' },
      { id: 4, description: 'Cáp siêu nhiệt Dz220KV', unit: 'm', target: 5130, completedToday: 0, totalCompleted: 0, progress: 0, planStart: '', planEnd: '', issues: '', notes: '' },
      { id: 5, description: 'Hệ BESS', unit: 'Bộ', target: 1, completedToday: 0, totalCompleted: 0, progress: 0, planStart: '', planEnd: '', issues: '', notes: '' },
      { id: 6, description: 'Tấm pin', unit: 'Tấm', target: 72968, completedToday: 0, totalCompleted: 0, progress: 0, planStart: '', planEnd: '', issues: '', notes: '' },
    ],
    dailyTasks: ['Gia công cốt thép', 'Thi công kho chứa pin'],
    nextDayPlan: ['Gia công ván khuôn cọc', 'Đổ bê tông cọc'],
    issues: ['Hồ sơ thiết kế thi công chưa ban hành'],
    proposals: ['Kính đề nghị CĐT sớm ban hành bản vẽ'],
    photos: [],
  });

  const handleInputChange = (field: string, value: any) => {
    setReport(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setReport(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof DailyReport] as any), [field]: value }
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if ((report.photos?.length || 0) + e.target.files.length > 10) {
      console.warn("Tối đa 10 ảnh.");
      return;
    }

    setUploading(true);
    const newPhotos = [...(report.photos || [])];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        newPhotos.push(url);
      } catch (error) {
        console.error("Upload Error: ", error);
      }
    }

    setReport(prev => ({ ...prev, photos: newPhotos }));
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    setReport(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        ...report,
        authorUid: auth.currentUser.uid,
        createdAt: Timestamp.now(),
      });
      onComplete();
    } catch (error) {
      console.error("Save Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const seedFromOCR = () => {
    setReport({
      date: '2026-04-06',
      weather: { morning: 'Nắng', afternoon: 'Nắng', evening: 'Nắng' },
      personnel: { 
        total: 43, 
        positions: { 'Giám đốc': 1, 'CHT': 1, 'Kỹ thuật': 10, 'Công nhân': 26, 'An toàn': 1, 'Kho': 2, 'Kế toán': 1, 'QC/QS': 1 },
        contractors: { 'Yên Phúc': 12, 'Xuân Sơn Hải Dương': 14, 'Mansa Vina': 0 }
      },
      financials: { contractValue: 568791724932, temporaryOutput: 15007900980, remainingValue: 553783823952 },
      civilItems: [
        { id: 1, description: 'Phát hoang mặt bằng', unit: 'm2', target: 298842, completedToday: 0, totalCompleted: 298842, progress: 100, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 2, description: 'Đúc cọc bê tông', unit: 'cọc', target: 12972, completedToday: 0, totalCompleted: 9931, progress: 76.6, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 3, description: 'Vận chuyển cọc bê tông', unit: 'cọc', target: 12972, completedToday: 160, totalCompleted: 1050, progress: 8.1, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 4, description: 'Thi công kho chứa pin', unit: 'hm', target: 1, completedToday: 0.05, totalCompleted: 0.8, progress: 80, planStart: '', planEnd: '', issues: '', notes: '' },
      ],
      equipmentItems: [
        { id: 1, description: 'Máy biến áp', unit: 'máy', target: 1, completedToday: 0, totalCompleted: 0, progress: 20, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 2, description: 'Máy biến tần', unit: 'bộ', target: 12, completedToday: 0, totalCompleted: 0, progress: 30, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 3, description: 'Giá đỡ tấm pin', unit: 'line', target: 2606, completedToday: 0, totalCompleted: 0, progress: 25, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 4, description: 'Cáp siêu nhiệt Dz220KV', unit: 'm', target: 5130, completedToday: 0, totalCompleted: 0, progress: 11, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 5, description: 'Hệ BESS', unit: 'Bộ', target: 1, completedToday: 0, totalCompleted: 0, progress: 25, planStart: '', planEnd: '', issues: '', notes: '' },
        { id: 6, description: 'Tấm pin', unit: 'Tấm', target: 72968, completedToday: 0, totalCompleted: 0, progress: 5, planStart: '', planEnd: '', issues: '', notes: '' },
      ],
      dailyTasks: ['Gia công cốt thép', 'Vận chuyển cọc', 'Thi công kho chứa pin'],
      nextDayPlan: ['Gia công ván khuôn cọc', 'Bảo dưỡng cọc', 'Đổ bê tông cọc'],
      issues: ['Hồ sơ thiết kế thi công chưa ban hành', 'Đường tạm chưa đủ điều kiện'],
      proposals: ['Kính đề nghị CĐT sớm ban hành bản vẽ thiết kế'],
      photos: [
        'https://picsum.photos/seed/solar1/800/600',
        'https://picsum.photos/seed/solar2/800/600',
        'https://picsum.photos/seed/solar3/800/600',
        'https://picsum.photos/seed/solar4/800/600'
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tạo Báo cáo Mới</h2>
          <p className="text-slate-500">Nhập thông tin chi tiết cho báo cáo ngày hôm nay.</p>
        </div>
        <button
          type="button"
          onClick={seedFromOCR}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-medium text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Nhập dữ liệu mẫu (OCR)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Ngày báo cáo</label>
                <input 
                  type="date" 
                  value={report.date} 
                  onChange={e => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Tổng nhân sự (Tự động tính)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={report.personnel?.total} 
                    onChange={e => handleNestedChange('personnel', 'total', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold uppercase">Người</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['morning', 'afternoon', 'evening'].map(time => (
                <div key={time} className="space-y-1">
                  <label className="text-sm font-medium text-slate-600 capitalize">Thời tiết {time === 'morning' ? 'Sáng' : time === 'afternoon' ? 'Chiều' : 'Tối'}</label>
                  <input 
                    type="text" 
                    value={(report.weather as any)[time]} 
                    onChange={e => handleNestedChange('weather', time, e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Personnel Details */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Chi tiết Nhân sự & Nhà thầu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PersonnelInput 
                label="Nhân sự theo Vị trí / Phòng ban" 
                items={report.personnel?.positions || {}} 
                onChange={positions => {
                  const total = Object.values(positions).reduce((a, b) => a + b, 0);
                  setReport(prev => ({
                    ...prev,
                    personnel: { ...prev.personnel!, positions, total }
                  }));
                }} 
              />
              <PersonnelInput 
                label="Nhân sự theo Nhà thầu" 
                items={report.personnel?.contractors || {}} 
                onChange={contractors => handleNestedChange('personnel', 'contractors', contractors)} 
              />
            </div>
          </section>

          {/* Financials */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Save className="w-4 h-4 text-emerald-600" />
              Giá trị hợp đồng & Sản lượng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Giá trị Hợp đồng</label>
                <input 
                  type="number" 
                  value={report.financials?.contractValue} 
                  onChange={e => handleNestedChange('financials', 'contractValue', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Sản lượng tạm tính</label>
                <input 
                  type="number" 
                  value={report.financials?.temporaryOutput} 
                  onChange={e => handleNestedChange('financials', 'temporaryOutput', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Giá trị còn lại</label>
                <input 
                  type="number" 
                  value={report.financials?.remainingValue} 
                  onChange={e => handleNestedChange('financials', 'remainingValue', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Hình ảnh hiện trường (Tối đa 10)
              </h3>
              <label className={cn(
                "cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold flex items-center gap-2",
                (report.photos?.length || 0) >= 10 && "opacity-50 cursor-not-allowed"
              )}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                  disabled={(report.photos?.length || 0) >= 10 || uploading}
                />
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tải ảnh lên
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {report.photos?.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 5 - (report.photos?.length || 0)) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-300" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Tasks */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900">Công việc & Kế hoạch</h3>
            
            <div className="space-y-4">
              <ListInput 
                label="Công việc thực hiện" 
                items={report.dailyTasks || []} 
                onChange={items => handleInputChange('dailyTasks', items)} 
              />
              <ListInput 
                label="Kế hoạch ngày mai" 
                items={report.nextDayPlan || []} 
                onChange={items => handleInputChange('nextDayPlan', items)} 
              />
              <ListInput 
                label="Vướng mắc, khó khăn" 
                items={report.issues || []} 
                onChange={items => handleInputChange('issues', items)} 
              />
            </div>
          </section>

          <div className="sticky bottom-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Lưu báo cáo
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function ListInput({ label, items, onChange }: { label: string, items: string[], onChange: (items: string[]) => void }) {
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    onChange([...items, input.trim()]);
    setInput('');
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Thêm nội dung..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          type="button" 
          onClick={add}
          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg group">
            <span className="text-xs text-slate-600">{item}</span>
            <button 
              type="button" 
              onClick={() => remove(i)}
              className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonnelInput({ label, items, onChange }: { label: string, items: { [key: string]: number }, onChange: (items: { [key: string]: number }) => void }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState<number | ''>('');

  const add = () => {
    if (!key.trim() || value === '') return;
    onChange({ ...items, [key.trim()]: Number(value) });
    setKey('');
    setValue('');
  };

  const remove = (k: string) => {
    const newItems = { ...items };
    delete newItems[k];
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={key} 
          onChange={e => setKey(e.target.value)}
          placeholder="Vị trí/Phòng..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input 
          type="number" 
          value={value} 
          onChange={e => setValue(e.target.value === '' ? '' : parseInt(e.target.value))}
          placeholder="SL"
          className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          type="button" 
          onClick={add}
          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        {Object.entries(items).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg group">
            <span className="text-xs text-slate-600 font-medium">{k}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-600">{v}</span>
              <button 
                type="button" 
                onClick={() => remove(k)}
                className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
