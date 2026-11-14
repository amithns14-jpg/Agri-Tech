import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  Plus,
  MapPin,
  Maximize2,
  Droplets,
  Sprout,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button, Badge, LoadingSpinner, EmptyState } from '../components/common/Components';

const SOIL_TYPES = [
  'Sandy', 'Clay', 'Silty', 'Loamy', 'Black soil', 'Red soil', 'Alluvial soil', 'Laterite soil', 'Other / Unknown'
];

const WATER_TYPES = [
  'Low', 'Moderate', 'High', 'Rain-fed', 'Irrigation available'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const FarmPage: React.FC = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    farm_name: '',
    location: '',
    state: user?.state || 'Karnataka',
    district: user?.district || 'Dharwad',
    village: '',
    land_area: 2.5,
    land_unit: 'acre',
    soil_type: 'Black soil',
    water_availability: 'Irrigation available',
    farming_method: 'Integrated Crop Management'
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFarms();
  }, []);

  async function loadFarms() {
    setLoading(true);
    try {
      const res: any = await Api.getFarms();
      if (res.data) setFarms(res.data);
    } catch (err: any) {
      console.error('Failed to load farms:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormData({
      farm_name: '',
      location: '',
      state: user?.state || 'Karnataka',
      district: user?.district || 'Dharwad',
      village: '',
      land_area: 2.5,
      land_unit: 'acre',
      soil_type: 'Black soil',
      water_availability: 'Irrigation available',
      farming_method: 'Integrated Crop Management'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (farm: any) => {
    setEditingFarm(farm);
    setFormData({
      farm_name: farm.farm_name,
      location: farm.location,
      state: farm.state,
      district: farm.district,
      village: farm.village || '',
      land_area: farm.land_area,
      land_unit: farm.land_unit,
      soil_type: farm.soil_type || 'Black soil',
      water_availability: farm.water_availability || 'Irrigation available',
      farming_method: farm.farming_method || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this farm plot?')) return;
    try {
      await Api.deleteFarm(id);
      setFarms(farms.filter(f => f.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete farm');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingFarm) {
        const res: any = await Api.updateFarm(editingFarm.id, formData);
        setFarms(farms.map(f => (f.id === editingFarm.id ? res.data : f)));
      } else {
        const res: any = await Api.createFarm(formData);
        setFarms([res.data, ...farms]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save farm record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Tractor className="h-7 w-7 text-brand-600" />
            <span>Farm & Land Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register and manage your farm plots to auto-fill crop and soil advisory requests.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          leftIcon={<Plus className="h-4 w-4" />}
          size="md"
        >
          Add New Farm Plot
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your agricultural land plots..." />
      ) : farms.length === 0 ? (
        <EmptyState
          icon={<Tractor className="h-8 w-8 text-brand-600" />}
          title="No Farm Plots Registered"
          description="Register your first agricultural plot to enable personalized AI crop recommendations and water management."
          action={
            <Button onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
              Register Farm Now
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{farm.farm_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{farm.district}, {farm.state}</span>
                    </p>
                  </div>
                  <Badge variant="brand">{farm.land_area} {farm.land_unit}</Badge>
                </div>

                <div className="py-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">{farm.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Soil Type:</span>
                    <span className="font-semibold text-slate-800">{farm.soil_type || 'Unspecified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Water Source:</span>
                    <span className="font-semibold text-slate-800">{farm.water_availability || 'Rain-fed'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Farming Method:</span>
                    <span className="font-semibold text-slate-800">{farm.farming_method || 'Conventional'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(farm)}
                  className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  title="Edit Farm"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(farm.id)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Farm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-bold text-lg text-slate-900">
                {editingFarm ? 'Edit Farm Plot' : 'Add New Farm Plot'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm / Plot Name *</label>
                <input
                  type="text"
                  required
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  placeholder="Green Valley Plot 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Details *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Near Malaprabha River Canal, Navalgund"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Dharwad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Land Area *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.land_area}
                    onChange={(e) => setFormData({ ...formData, land_area: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit *</label>
                  <select
                    value={formData.land_unit}
                    onChange={(e) => setFormData({ ...formData, land_unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    <option value="acre">Acres</option>
                    <option value="hectare">Hectares</option>
                    <option value="bigha">Bigha</option>
                    <option value="guntha">Guntha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dominant Soil Type</label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Water Availability</label>
                  <select
                    value={formData.water_availability}
                    onChange={(e) => setFormData({ ...formData, water_availability: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    {WATER_TYPES.map((wt) => (
                      <option key={wt} value={wt}>{wt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farming Method</label>
                <input
                  type="text"
                  value={formData.farming_method}
                  onChange={(e) => setFormData({ ...formData, farming_method: e.target.value })}
                  placeholder="Organic, Conventional, IPM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingFarm ? 'Save Changes' : 'Create Farm Plot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
