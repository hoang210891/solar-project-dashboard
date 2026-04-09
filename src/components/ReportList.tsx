import React, { useState } from 'react';
import { DailyReport } from '../types';
import { Calendar, Users, CloudSun, ChevronRight, FileText, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import ReportView from './ReportView';

interface ReportListProps {
  reports: DailyReport[];
}

export default function ReportList({ reports }: ReportListProps) {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // In a real app, we'd use a custom modal. Removing confirm for now to avoid iframe issues.
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (error) {
      console.error("Delete Error: ", error);
    }
  };

  if (selectedReport) {
    return <ReportView report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Danh sách Báo cáo</h2>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
          {reports.length} báo cáo
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedReport(report)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Báo cáo ngày {new Date(report.date).toLocaleDateString('vi-VN')}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{report.personnel.total} người</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <CloudSun className="w-4 h-4" />
                        <span>{report.weather.morning}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sản lượng</p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.financials.temporaryOutput)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, report.id!)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reports.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có báo cáo nào được tạo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
