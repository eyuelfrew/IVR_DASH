import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import IVROptionFields from './IVROptionFields';
import type { IVROption } from './types';

export default function IVRMenuForm() {
  const [formData, setFormData] = useState({
    name: '',
    featureCode: '',
    greeting: '',
    options: [{ number: '', queue: '', action: 'queue', description: '' }],
  });
  const [recordings, setRecordings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available recordings
    axios
      .get('http://localhost:3000/recordings')
      .then((res) => setRecordings(res.data))
      .catch(() => setRecordings([]));
  }, []);

  useEffect(() => {
    // Clear success/error messages after 5 seconds
    const timeout = setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
    return () => clearTimeout(timeout);
  }, [success, error]);

  // Handle input changes for name, featureCode, and greeting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setSuccess('');
  };

  // Handle option updates from IVROptionFields
  const handleOptionsChange = (newOptions: IVROption[]) => {
    setFormData({ ...formData, options: newOptions });
    setError('');
    setSuccess('');
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.name.trim()) return 'Menu name is required';
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      return 'Menu name must be alphanumeric with underscore or hyphen';
    }
    if (!formData.featureCode) return 'Feature code is required';
    if (!/^\d+$/.test(formData.featureCode)) return 'Feature code must be numeric';
    if (!formData.greeting) return 'Greeting recording is required';
    if (formData.options.length === 0) return 'At least one option is required';
    for (const option of formData.options) {
      if (!option.number || isNaN(parseInt(option.number)) || parseInt(option.number) < 0) {
        return 'Each option must have a valid number';
      }
      if (!option.queue.trim()) return 'Each option must have a valid queue';
      if (option.action !== 'queue') return 'Action must be "queue"';
    }
    return null;
  };

  // Check feature code availability
  const checkFeatureCode = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/ivr/check-feature-code/${formData.featureCode}`
      );
      if (response.data.available) {
        setSuccess('Feature code is available');
      } else {
        setError('Feature code is already in use');
      }
    } catch (err) {
      setError('Failed to check feature code availability');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const ivrData = {
      name: formData.name,
      featureCode: formData.featureCode,
      greeting: formData.greeting,
      options: formData.options.map((opt) => ({
        number: parseInt(opt.number),
        queue: opt.queue,
      })),
    };

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/ivr/create', ivrData);
      setSuccess(response.data.message);
      setFormData({
        name: '',
        featureCode: '',
        greeting: '',
        options: [{ number: '', queue: '', action: 'queue', description: '' }],
      });
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        if ('response' in err) {
          const axiosError = err as AxiosError;
          console.error('Server responded with error:', axiosError.response?.data);
          // setError(axiosError.response?.data || 'Failed to create IVR menu. Please try again.');
        } else {
          setError(err.message || 'Failed to create IVR menu. Please try again.');
        }
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
      console.error('Error creating IVR menu:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New IVR Menu</h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-3">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Menu Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., main_menu"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Feature Code (Dial Number)</label>
          <div className="flex space-x-2">
            <input
              type="text"
              name="featureCode"
              value={formData.featureCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 9090"
              required
            />
            <button
              type="button"
              onClick={checkFeatureCode}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              disabled={loading || !formData.featureCode || !/^\d+$/.test(formData.featureCode)}
            >
              Check Availability
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Select Greeting Recording</label>
          <select
            name="greeting"
            value={formData.greeting}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">-- Select --</option>
            {recordings.map((rec) => (
              <option key={rec} value={rec}>
                {rec}
              </option>
            ))}
          </select>
          {formData.greeting && (
            <audio
              controls
              className="mt-2"
              src={`http://localhost:3000/recordings/${formData.greeting}.wav`}
            />
          )}
        </div>

        <IVROptionFields options={formData.options} setOptions={handleOptionsChange} />

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() =>
              setFormData({
                name: '',
                featureCode: '',
                greeting: '',
                options: [{ number: '', queue: '', action: 'queue', description: '' }],
              })
            }
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create IVR Menu'}
          </button>
        </div>
      </form>
    </div>
  );
}