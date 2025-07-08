import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiLoader } from 'react-icons/fi';

const DEST_TYPES = [
  { label: 'IVR', value: 'ivr', endpoint: '/api/ivr/menu' },
  { label: 'Extension', value: 'extension', endpoint: '/api/extensions' },
  { label: 'Queue', value: 'queue', endpoint: '/api/queues' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MiscApplicationForm = () => {
  const [formData, setFormData] = useState({
    description: '',
    featureCode: '',
    destination: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Destination dropdown states
  const [destType, setDestType] = useState('');
  const [destOptions, setDestOptions] = useState<any[]>([]);
  const [destLoading, setDestLoading] = useState(false);

  // Fetch destination options when type changes
  useEffect(() => {
    if (!destType) {
      setDestOptions([]);
      return;
    }
    const endpoint = DEST_TYPES.find(d => d.value === destType)?.endpoint;
    if (!endpoint) return;
    
    setDestLoading(true);
    axios.get(API_URL + endpoint)
      .then(res => {
        const data = res.data;
        setDestOptions(Array.isArray(data) ? data : data.data || []);
      })
      .catch(() => {
        setDestOptions([]);
        setError('Failed to load destination options');
      })
      .finally(() => setDestLoading(false));
  }, [destType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_URL}/api/misc`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      setSuccess('Misc Application created successfully!');
      setFormData({ description: '', featureCode: '', destination: '' });
      setDestType('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create application';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Create New Misc Application</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
            />
          </div>

          {/* Feature Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feature Code</label>
            <input
              type="text"
              name="featureCode"
              value={formData.featureCode}
              onChange={handleChange}
              required
              pattern="\d+"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 9091"
            />
            <p className="mt-1 text-xs text-gray-500">Numbers only</p>
          </div>

          {/* Destination Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={destType}
              onChange={e => {
                setDestType(e.target.value);
                setFormData(f => ({ ...f, destination: '' }));
              }}
              required
            >
              <option value="">Select type</option>
              {DEST_TYPES.map(dt => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
          </div>

          {/* Destination Item Dropdown */}
          {destType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select {DEST_TYPES.find(d => d.value === destType)?.label}
              </label>
              {destLoading ? (
                <div className="text-gray-500 py-2 flex items-center gap-2">
                  <FiLoader className="animate-spin" /> Loading...
                </div>
              ) : (
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.destination.replace(`${destType}/`, '')}
                  onChange={e => setFormData(f => ({
                    ...f,
                    destination: `${destType}/${e.target.value}`
                  }))}
                  required
                >
                  <option value="">Select {destType}</option>
                  {destOptions.map(opt => (
                    <option key={opt._id || opt.id || opt.extension || opt.name}
                      value={opt._id || opt.id || opt.extension || opt.name}>
                      {opt.name || opt.extension || opt.number || 'Unnamed'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-md text-white ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Create Application
                </>
              )}
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default MiscApplicationForm;