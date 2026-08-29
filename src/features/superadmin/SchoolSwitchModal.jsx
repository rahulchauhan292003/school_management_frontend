import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import { Building2, Database, ArrowRight, Check, RefreshCw } from 'lucide-react';

const SchoolSwitchModal = ({ isOpen, onClose }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const { targetSchoolCode, setTargetSchool } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const fetchActiveSchools = async () => {
        setLoading(true);
        try {
          const res = await api.get('/master/schools?status=ACTIVE');
          setSchools(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchActiveSchools();
    }
  }, [isOpen]);

  const handleSelect = (code) => {
    setTargetSchool(code);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Switch Tenant Database Context">
      <div className="space-y-4 text-xs">
        <p className="text-slate-500 dark:text-slate-400 -mt-2">
          Select a school database context to inspect as Super Admin
        </p>

        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          <button
            onClick={() => handleSelect('')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between font-semibold ${
              !targetSchoolCode
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div>
              <div className="font-bold text-xs">Master SaaS Dashboard (No Tenant Filter)</div>
              <div className="text-[11px] opacity-80 mt-0.5">Platform Administration View</div>
            </div>
            {!targetSchoolCode && <Check className="w-4 h-4" />}
          </button>

          {loading ? (
            <div className="text-center py-8 text-xs text-indigo-500 font-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading registered school databases...
            </div>
          ) : (
            schools.map((sch) => {
              const isSelected = targetSchoolCode?.toLowerCase() === sch.school_code.toLowerCase();
              return (
                <button
                  key={sch.id}
                  onClick={() => handleSelect(sch.school_code)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{sch.school_name}</div>
                    <div className="text-[11px] opacity-80 flex items-center gap-1 font-mono mt-0.5">
                      <Database className="w-3.5 h-3.5" /> {sch.database_name}
                    </div>
                  </div>
                  {isSelected ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 opacity-40" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SchoolSwitchModal;
