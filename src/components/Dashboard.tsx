import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DailyReport } from '../types';
import { TrendingUp, Users, CloudSun, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  reports: DailyReport[];
}

export default function Dashboard({ reports }: DashboardProps) {
  const latestReport = reports[0];

  if (!latestReport) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-200 border-dashed p-8 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Chưa có báo cáo nào</h3>
        <p className="text-slate-500">Hãy tạo báo cáo đầu tiên để xem dashboard.</p>
      </div>
    );
  }

  const financialData = [
    { name: 'Giá trị Hợp đồng', value: latestReport.financials.contractValue, color: '#3b82f6' },
    { name: 'Sản lượng tạm tính', value: latestReport.financials.temporaryOutput, color: '#10b981' },
    { name: 'Giá trị còn lại', value: latestReport.financials.remainingValue, color: '#f43f5e' },
  ];

  const civilProgressData = latestReport.civilItems.map(item => ({
    name: item.description,
    progress: item.progress,
  })).filter(item => item.progress > 0);

  const equipmentProgressData = latestReport.equipmentItems.map(item => ({
    name: item.description,
    progress: item.progress,
  })).filter(item => item.progress > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-600" />} 
          label="Nhân sự" 
          value={`${latestReport.personnel.total} người`} 
          subValue="Đang tại hiện trường"
        />
        <StatCard 
          icon={<CloudSun className="w-5 h-5 text-amber-500" />} 
          label="Thời tiết" 
          value={latestReport.weather.morning} 
          subValue={`Chiều: ${latestReport.weather.afternoon}`}
        />
        <StatCard 
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />} 
          label="Sản lượng" 
          value={formatCurrency(latestReport.financials.temporaryOutput)} 
          subValue={`${((latestReport.financials.temporaryOutput / latestReport.financials.contractValue) * 100).toFixed(1)}% tổng hợp đồng`}
        />
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />} 
          label="Tiến độ cọc" 
          value={`${latestReport.civilItems?.find(i => i.description.includes('cọc'))?.progress.toFixed(1) || 0}%`} 
          subValue="Hạng mục trọng điểm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Biểu đồ Sản lượng</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Progress Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Tiến độ thi công chính</h3>
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={civilProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} hide />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number) => `${value?.toFixed(1) || 0}%`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {civilProgressData?.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-500 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Field Photos */}
      {latestReport.photos && latestReport.photos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Hình ảnh hiện trường</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {latestReport.photos.map((photo, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.05 }}
                className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
              >
                <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <div className="space-y-1">
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-400 font-medium">{subValue}</p>
      </div>
    </motion.div>
  );
}
