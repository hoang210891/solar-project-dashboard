import React from 'react';
import { DailyReport, ProgressItem } from '../types';
import { ArrowLeft, Calendar, Users, CloudSun, DollarSign, CheckCircle2, AlertCircle, HelpCircle, Image as ImageIcon, Save, FileText, Download, Briefcase } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ReportViewProps {
  report: DailyReport;
  onBack: () => void;
}

export default function ReportView({ report, onBack }: ReportViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['BÁO CÁO NGÀY', new Date(report.date).toLocaleDateString('vi-VN')],
      ['', ''],
      ['THÔNG TIN CHUNG', ''],
      ['Nhân sự tổng cộng', report.personnel.total],
      ['Thời tiết sáng', report.weather.morning],
      ['Thời tiết chiều', report.weather.afternoon],
      ['Sản lượng tạm tính', report.financials.temporaryOutput],
      ['', ''],
      ['CÔNG VIỆC THỰC HIỆN', ''],
      ...report.dailyTasks.map(t => [t]),
      ['', ''],
      ['KẾ HOẠCH NGÀY MAI', ''],
      ...report.nextDayPlan.map(p => [p])
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");

    // Personnel Sheet
    const personnelData = [
      ['VỊ TRÍ / CHỨC DANH', 'SỐ LƯỢNG'],
      ...Object.entries(report.personnel.positions || {}),
      ['', ''],
      ['NHÀ THẦU', 'SỐ LƯỢNG'],
      ...Object.entries(report.personnel.contractors || {})
    ];
    const wsPersonnel = XLSX.utils.aoa_to_sheet(personnelData);
    XLSX.utils.book_append_sheet(wb, wsPersonnel, "Nhân sự");

    // Progress Sheet
    const progressData = [
      ['HẠNG MỤC', 'ĐƠN VỊ', 'MỤC TIÊU', 'LŨY KẾ', 'TIẾN ĐỘ (%)'],
      ...report.civilItems.map(i => [i.description, i.unit, i.target, i.totalCompleted, i.progress]),
      ['', '', '', '', ''],
      ['VẬT TƯ THIẾT BỊ', 'ĐƠN VỊ', 'MỤC TIÊU', 'LŨY KẾ', 'TIẾN ĐỘ (%)'],
      ...report.equipmentItems.map(i => [i.description, i.unit, i.target, i.totalCompleted, i.progress])
    ];
    const wsProgress = XLSX.utils.aoa_to_sheet(progressData);
    XLSX.utils.book_append_sheet(wb, wsProgress, "Tiến độ");

    XLSX.writeFile(wb, `Bao_cao_ngay_${report.date}.xlsx`);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm border border-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Chi tiết Báo cáo</h2>
            <p className="text-slate-500">Ngày {new Date(report.date).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-100"
        >
          <Download className="w-4 h-4" />
          Xuất Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<Users className="w-5 h-5 text-blue-600" />} label="Nhân sự" value={`${report.personnel.total} người`} />
        <SummaryCard icon={<CloudSun className="w-5 h-5 text-amber-500" />} label="Thời tiết" value={report.weather.morning} />
        <SummaryCard icon={<DollarSign className="w-5 h-5 text-emerald-600" />} label="Sản lượng" value={formatCurrency(report.financials.temporaryOutput)} />
        <SummaryCard icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />} label="Hoàn thành" value={`${((report.financials.temporaryOutput / report.financials.contractValue) * 100).toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personnel Details */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Chi tiết Nhân sự & Nhà thầu
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Theo vị trí / Chức danh</h4>
                <div className="space-y-3">
                  {Object.entries(report.personnel.positions || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-700">{role}</span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600">{count}</span>
                    </div>
                  ))}
                  {(!report.personnel.positions || Object.keys(report.personnel.positions).length === 0) && (
                    <p className="text-sm text-slate-400 italic">Chưa có dữ liệu chi tiết</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Theo Nhà thầu</h4>
                <div className="space-y-3">
                  {Object.entries(report.personnel.contractors || {}).map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-600">{count}</span>
                    </div>
                  ))}
                  {(!report.personnel.contractors || Object.keys(report.personnel.contractors).length === 0) && (
                    <p className="text-sm text-slate-400 italic">Chưa có dữ liệu nhà thầu</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Progress Tables */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Tiến độ thi công phần xây dựng
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Hạng mục</th>
                    <th className="px-6 py-3">Đơn vị</th>
                    <th className="px-6 py-3">Mục tiêu</th>
                    <th className="px-6 py-3">Lũy kế</th>
                    <th className="px-6 py-3">Tiến độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.civilItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.description}</td>
                      <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{item.target.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{item.totalCompleted.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-10">{item.progress.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Equipment Table */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-600" />
                Vật tư thiết bị nhà máy
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Mô tả</th>
                    <th className="px-6 py-3">Đơn vị</th>
                    <th className="px-6 py-3">Mục tiêu</th>
                    <th className="px-6 py-3">Lũy kế</th>
                    <th className="px-6 py-3">Tiến độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.equipmentItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.description}</td>
                      <td className="px-6 py-4 text-slate-500">{item.unit}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{item.target.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{item.totalCompleted.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-10">{item.progress.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Photos */}
          {report.photos && report.photos.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Hình ảnh hiện trường
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {report.photos.map((photo, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <InfoCard title="Công việc thực hiện" items={report.dailyTasks} icon={<FileText className="w-4 h-4 text-blue-600" />} />
          <InfoCard title="Kế hoạch ngày mai" items={report.nextDayPlan} icon={<Calendar className="w-4 h-4 text-emerald-600" />} />
          <InfoCard title="Vướng mắc, khó khăn" items={report.issues} icon={<AlertCircle className="w-4 h-4 text-red-500" />} />
          <InfoCard title="Đề xuất phương án" items={report.proposals} icon={<HelpCircle className="w-4 h-4 text-purple-600" />} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoCard({ title, items, icon }: { title: string, items: string[], icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h3 className="font-bold text-slate-900 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
            <span className="text-blue-500 font-bold">•</span>
            {item}
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-slate-400 italic">Không có thông tin</li>}
      </ul>
    </div>
  );
}
