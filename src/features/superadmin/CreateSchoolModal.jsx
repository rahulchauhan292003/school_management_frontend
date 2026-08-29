import React, { useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { CheckCircle2, Loader2, AlertCircle, Database, Server, ShieldCheck } from 'lucide-react';

const CreateSchoolModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    planName: 'Enterprise SaaS Plan',
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: input, 1: creating DB, 2: schema, 3: seeding, 4: complete
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'schoolName' && !formData.schoolCode) {
      const code = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_');
      setFormData((prev) => ({ ...prev, schoolCode: code }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCurrentStep(1);

    try {
      // Step simulation for visual feedback
      setTimeout(() => setCurrentStep(2), 600);
      setTimeout(() => setCurrentStep(3), 1200);

      const res = await api.post('/master/schools', formData);
      setCurrentStep(4);
      setTimeout(() => {
        setLoading(false);
        onSuccess(res.data);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setCurrentStep(0);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Provision New School Database" maxWidth="max-w-lg">
      <div className="space-y-4 text-xs">
        <p className="text-slate-500 dark:text-slate-400 -mt-2">
          Creates a dedicated MySQL database with schema migrations & default seeders.
        </p>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 space-y-6 text-center">
            <div className="relative inline-flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>

            <div className="space-y-3 max-w-xs mx-auto text-left text-xs font-semibold">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : <Server className="w-4 h-4 animate-bounce" />}
                <span>Creating MySQL DB <code className="font-mono text-indigo-600 dark:text-indigo-300">school_{formData.schoolCode}_db</code>...</span>
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                <span>Running 25+ base schema migrations...</span>
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Seeding default roles, permissions & initial admin...</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="e.g. Greenwood High"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Unique School Code</label>
                <input
                  type="text"
                  name="schoolCode"
                  value={formData.schoolCode}
                  onChange={handleChange}
                  placeholder="e.g. greenwood"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                Initial School Administrator Credentials
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="Admin Full Name"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admin Email</label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      placeholder="admin@school.com"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Admin Password</label>
                    <input
                      type="password"
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="Password@123"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Provision Database Now
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default CreateSchoolModal;
