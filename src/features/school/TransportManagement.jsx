import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Bus, Plus, Route, UserCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TransportManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form states
  const [busForm, setBusForm] = useState({
    busNumber: '',
    capacity: 40,
    vehicleModel: 'Volvo Commercial Bus',
  });

  const [routeForm, setRouteForm] = useState({
    name: '',
    code: '',
    startPoint: '',
    endPoint: '',
    fare: '150.00',
  });

  const [assignForm, setAssignForm] = useState({
    studentId: '',
    routeId: '',
    busId: '',
  });

  const fetchTransport = async () => {
    setLoading(true);
    try {
      const [rRes, bRes, sRes] = await Promise.all([
        api.get('/school/transport/routes'),
        api.get('/school/transport/buses'),
        api.get('/school/students'),
      ]);
      setRoutes(rRes.data);
      setBuses(bRes.data);
      setStudents(sRes.data);
      if (sRes.data.length > 0) setAssignForm((prev) => ({ ...prev, studentId: sRes.data[0].id }));
      if (rRes.data.length > 0) setAssignForm((prev) => ({ ...prev, routeId: rRes.data[0].id }));
      if (bRes.data.length > 0) setAssignForm((prev) => ({ ...prev, busId: bRes.data[0].id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransport();
  }, []);

  const handleCreateBus = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/transport/buses', busForm);
      toast.success('Bus registered successfully!');
      setIsBusModalOpen(false);
      setBusForm({ busNumber: '', capacity: 40, vehicleModel: 'Volvo Commercial Bus' });
      fetchTransport();
    } catch (err) {
      toast.error(err.message || 'Failed to register bus');
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/transport/routes', routeForm);
      toast.success('Transport route created successfully!');
      setIsRouteModalOpen(false);
      setRouteForm({ name: '', code: '', startPoint: '', endPoint: '', fare: '150.00' });
      fetchTransport();
    } catch (err) {
      toast.error(err.message || 'Failed to create route');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/school/transport/assign', assignForm);
      toast.success('Student assigned to transport route successfully!');
      setIsAssignModalOpen(false);
      fetchTransport();
    } catch (err) {
      toast.error(err.message || 'Failed to assign student');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <Bus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> School Transport & Route Network
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bus fleets, drivers, route stops & student assignments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsBusModalOpen(true)}>
            Register Bus
          </Button>
          <Button variant="secondary" size="sm" icon={Route} onClick={() => setIsRouteModalOpen(true)}>
            Add Bus Route
          </Button>
          <Button variant="primary" size="sm" icon={UserCheck} onClick={() => setIsAssignModalOpen(true)}>
            Assign Student
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchTransport}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Registered Bus Fleet
            </h3>
            <Badge variant="indigo">{buses.length} Buses</Badge>
          </div>
          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading fleet...
            </div>
          ) : buses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No bus fleet registered</div>
          ) : (
            buses.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{b.bus_number}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{b.vehicle_model || 'School Bus'}</span>
                </div>
                <Badge variant="success">{b.capacity} Seats</Badge>
              </div>
            ))
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Route className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Active Bus Routes
            </h3>
            <Badge variant="neutral">{routes.length} Routes</Badge>
          </div>
          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading routes...
            </div>
          ) : routes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No active routes registered</div>
          ) : (
            routes.map((r) => (
              <div
                key={r.id}
                className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
              >
                <div className="font-bold text-indigo-600 dark:text-indigo-300">
                  {r.name} ({r.code})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {r.start_point} &rarr; {r.end_point} | Fare: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">${r.fare}</strong>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Register Bus Modal */}
      <Modal isOpen={isBusModalOpen} onClose={() => setIsBusModalOpen(false)} title="Register New Bus Fleet">
        <form onSubmit={handleCreateBus} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Bus Vehicle Number *</label>
            <input
              type="text"
              required
              value={busForm.busNumber}
              onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
              placeholder="e.g. BUS-101"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Seating Capacity</label>
              <input
                type="number"
                required
                value={busForm.capacity}
                onChange={(e) => setBusForm({ ...busForm, capacity: parseInt(e.target.value) || 40 })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Vehicle Model</label>
              <input
                type="text"
                value={busForm.vehicleModel}
                onChange={(e) => setBusForm({ ...busForm, vehicleModel: e.target.value })}
                placeholder="Volvo Commercial Bus"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsBusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Bus Fleet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Bus Route Modal */}
      <Modal isOpen={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} title="Create Transport Bus Route">
        <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Route Name *</label>
              <input
                type="text"
                required
                value={routeForm.name}
                onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                placeholder="e.g. Route Alpha Express"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Route Code *</label>
              <input
                type="text"
                required
                value={routeForm.code}
                onChange={(e) => setRouteForm({ ...routeForm, code: e.target.value })}
                placeholder="e.g. R-01"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Start Stop Point</label>
              <input
                type="text"
                required
                value={routeForm.startPoint}
                onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                placeholder="Central Bus Station"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">End Stop Point</label>
              <input
                type="text"
                required
                value={routeForm.endPoint}
                onChange={(e) => setRouteForm({ ...routeForm, endPoint: e.target.value })}
                placeholder="Main Campus Gate"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Monthly Fare ($)</label>
            <input
              type="number"
              required
              value={routeForm.fare}
              onChange={(e) => setRouteForm({ ...routeForm, fare: e.target.value })}
              placeholder="150.00"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsRouteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Route
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Student Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Student to Bus Route">
        <form onSubmit={handleAssignStudent} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Student *</label>
            <select
              required
              value={assignForm.studentId}
              onChange={(e) => setAssignForm({ ...assignForm, studentId: parseInt(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.admission_number})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Route *</label>
              <select
                required
                value={assignForm.routeId}
                onChange={(e) => setAssignForm({ ...assignForm, routeId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (${r.fare})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Bus *</label>
              <select
                required
                value={assignForm.busId}
                onChange={(e) => setAssignForm({ ...assignForm, busId: parseInt(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bus_number} ({b.capacity} Seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Assign Transport Route
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransportManagement;
