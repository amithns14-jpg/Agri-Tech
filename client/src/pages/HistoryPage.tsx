import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Api } from '../services/api';
import {
  History,
  Sprout,
  FlaskConical,
  Trees,
  Droplets,
  ScanLine,
  Trash2,
  ChevronRight,
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button, Badge, LoadingSpinner, EmptyState } from '../components/common/Components';

export const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ totalPages: 1, total: 0 });

  useEffect(() => {
    fetchHistory();
  }, [typeFilter, page]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res: any = await Api.getHistory({
        type: typeFilter || undefined,
        page,
        limit: 10
      });
      if (res.data) {
        setItems(res.data);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this advisory record?')) return;

    try {
      await Api.deleteHistoryItem(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete advisory');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'crop': return <Sprout className="h-5 w-5 text-emerald-600" />;
      case 'soil': return <FlaskConical className="h-5 w-5 text-amber-600" />;
      case 'fertilizer': return <Trees className="h-5 w-5 text-emerald-600" />;
      case 'irrigation': return <Droplets className="h-5 w-5 text-cyan-600" />;
      case 'disease': return <ScanLine className="h-5 w-5 text-rose-600" />;
      default: return <History className="h-5 w-5 text-brand-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="h-7 w-7 text-brand-600" />
            <span>Advisory & Recommendation History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and track all your past AI crop advisories, soil health scans, and disease diagnoses.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => { setTypeFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              typeFilter === '' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => { setTypeFilter('crop'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              typeFilter === 'crop' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Crops
          </button>
          <button
            type="button"
            onClick={() => { setTypeFilter('soil'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              typeFilter === 'soil' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Soil
          </button>
          <button
            type="button"
            onClick={() => { setTypeFilter('disease'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              typeFilter === 'disease' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Diseases
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving historical records from database..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<History className="h-8 w-8 text-brand-600" />}
          title="No Advisory Records Found"
          description="Your generated recommendations and disease inspections will be archived here for easy future reference."
          action={
            <Link to="/crop-recommendation">
              <Button leftIcon={<Sprout className="h-4 w-4" />}>Run Crop Advisory</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/history/${item.id}`}
              className="block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-700 transition-colors">
                        {item.title}
                      </h3>
                      <Badge variant="neutral">{item.type?.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xl">
                      {item.summary || 'Advisory details available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-500 font-medium">
                Page {page} of {meta.totalPages} ({meta.total} records)
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
