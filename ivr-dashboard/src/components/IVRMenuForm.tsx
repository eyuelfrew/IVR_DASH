import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';


// Function to generate a unique ID

import { FiChevronUp, FiChevronDown, FiTrash2 } from 'react-icons/fi';
interface IVREntry {
  id: number;
  type: string;
  digit: string;
  value: string;
}

interface DTMFOptions {
  announcement: string;
  timeout: number;
  invalidRetries: number;
  invalidRetryRecording: string;
  timeoutRetries: number;
}

interface IVRState {
  name: string;
  description: string;
  dtmf: DTMFOptions;
  entries: IVREntry[];
}

interface ErrorState {
  name?: string;
  announcement?: string;
  timeout?: string;
  invalidRetries?: string;
  timeoutRetries?: string;
  [key: string]: string | undefined;
}

  const database = {
    extensions: [
      { id: 'ext101', name: 'Support Team (101)' },
      { id: 'ext102', name: 'Sales Team (102)' },
      { id: 'ext103', name: 'Billing (103)' },
    ],
    queues: [
      { id: 'q1', name: 'Customer Support Queue' },
      { id: 'q2', name: 'Sales Queue' },
    ],
    ivrs: [
      { id: 'ivr1', name: 'Main Menu IVR' },
      { id: 'ivr2', name: 'Support IVR' },
    ],
    recordings: [
      { id: 'rec1', name: 'Welcome Message' },
      { id: 'rec2', name: 'About INSA' },
    ],
  };

const IVRMenuCreator = () => {
  const [ivr, setIvr] = useState<IVRState>({
    name: '',
    description: '',
    dtmf: {
      announcement: '',
      timeout: 5,
      invalidRetries: 3,
      invalidRetryRecording: '',
      timeoutRetries: 3,
    },
    entries: [
      { id: Date.now(), type: '', digit: '', value: '' }
    ],
  });
  const [errors, setErrors] = useState<ErrorState>({});

  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIvr({ ...ivr, [name]: value });
    if (value.trim()) setErrors({ ...errors, [name]: '' });
  };

  const handleDTMFChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIvr({
      ...ivr,
      dtmf: {
        ...ivr.dtmf,
        [name]: name === 'timeout' || name === 'invalidRetries' || name === 'timeoutRetries' ? Number(value) : value,
      },
    });
    if (value.trim() || Number(value) >= 0) setErrors({ ...errors, [name]: '' });
  };



 
 

  const validateForm = () => {
    const newErrors: ErrorState = {};
    if (!ivr.name.trim()) newErrors.name = 'IVR name is required';
    if (!ivr.dtmf.announcement.trim()) newErrors.announcement = 'Announcement is required';
    if (ivr.dtmf.timeout < 1) newErrors.timeout = 'Timeout must be at least 1 second';
    if (ivr.dtmf.invalidRetries < 1) newErrors.invalidRetries = 'Invalid retries must be at least 1';
    if (ivr.dtmf.timeoutRetries < 1) newErrors.timeoutRetries = 'Timeout retries must be at least 1';
    ivr.entries.forEach((entry) => {
      if (!entry.digit) newErrors[`digit_${entry.id}`] = 'Digit is required';
      if (!entry.value) newErrors[`value_${entry.id}`] = 'Selection is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setTimeout(() => {
        alert('IVR Menu Saved Successfully!');
        console.log('IVR Data:', ivr);
      }, 500);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-800">Create IVR Menu</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row md:space-x-6">
          {/* General Options */}
          <div className="flex-1 bg-white shadow-md rounded-lg p-6 mb-6 md:mb-0 transform hover:scale-105 transition-transform">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">General Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IVR Name <span className="text-xs text-gray-500">(Required)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={ivr.name}
                  onChange={handleGeneralChange}
                  className={`mt-1 block w-full border rounded-md p-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter IVR name"
                  aria-label="IVR Name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={ivr.description}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter IVR description"
                  rows={4}
                  aria-label="IVR Description"
                />
              </div>
            </div>
          </div>

          {/* DTMF Options */}
          <div className="flex-1 bg-white shadow-md rounded-lg p-6 transform hover:scale-105 transition-transform">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">DTMF Options</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Announcement <span className="text-xs text-gray-500">(Required)</span>
                </label>
                <select
                  name="announcement"
                  value={ivr.dtmf.announcement}
                  onChange={handleDTMFChange}
                  className={`mt-1 block w-full border rounded-md p-2 ${errors.announcement ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                  aria-label="Announcement recording"
                >
                  <option value="">Select recording</option>
                  {database.recordings.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.name}
                    </option>
                  ))}
                </select>
                {errors.announcement && <p className="text-red-500 text-sm mt-1">{errors.announcement}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timeout (seconds) <span className="text-xs text-gray-500">(Min: 1)</span>
                </label>
                <input
                  type="number"
                  name="timeout"
                  value={ivr.dtmf.timeout}
                  onChange={handleDTMFChange}
                  className={`mt-1 block w-full border rounded-md p-2 ${errors.timeout ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                  min="1"
                  aria-label="Timeout in seconds"
                />
                {errors.timeout && <p className="text-red-500 text-sm mt-1">{errors.timeout}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invalid Retries <span className="text-xs text-gray-500">(Min: 1)</span>
                </label>
                <input
                  type="number"
                  name="invalidRetries"
                  value={ivr.dtmf.invalidRetries}
                  onChange={handleDTMFChange}
                  className={`mt-1 block w-full border rounded-md p-2 ${errors.invalidRetries ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                  min="1"
                  aria-label="Invalid retries"
                />
                {errors.invalidRetries && <p className="text-red-500 text-sm mt-1">{errors.invalidRetries}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Invalid Retry Recording</label>
                <select
                  name="invalidRetryRecording"
                  value={ivr.dtmf.invalidRetryRecording}
                  onChange={handleDTMFChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Invalid retry recording"
                >
                  <option value="">Select recording</option>
                  {database.recordings.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timeout Retries <span className="text-xs text-gray-500">(Min: 1)</span>
                </label>
                <input
                  type="number"
                  name="timeoutRetries"
                  value={ivr.dtmf.timeoutRetries}
                  onChange={handleDTMFChange}
                  className={`mt-1 block w-full border rounded-md p-2 ${errors.timeoutRetries ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                  min="1"
                  aria-label="Timeout retries"
                />
                {errors.timeoutRetries && <p className="text-red-500 text-sm mt-1">{errors.timeoutRetries}</p>}
              </div>
            </div>
          </div>
        </div>
                  <IVREntries
                    entries={ivr.entries}
                    setEntries={(newEntries: IVREntry[]) => setIvr((prev) => ({ ...prev, entries: newEntries }))}
                  />
        
        {/* Buttons */}
        <div className="flex justify-end space-x-4">

          <div className="relative group">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              aria-label="Save IVR"
            >
              Save IVR
            </button>
          </div>
        </div>
      </form>

      
    </div>
  );
};

export default IVRMenuCreator;




interface EntryErrors {
  [key: string]: string | null | undefined;
}

interface IVREntriesProps {
  entries: IVREntry[];
  setEntries: (entries: IVREntry[]) => void;
}

const IVREntries: React.FC<IVREntriesProps> = ({ entries, setEntries }) => {
  const [errors, setErrors] = useState<EntryErrors>({});

  const addEntry = () => {
    const newEntry: IVREntry = { id: Date.now(), type: '', digit: '', value: '' };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (id: number, field: keyof IVREntry, value: string) => {
    const usedDigits = entries
      .filter((entry) => entry.id !== id && entry.digit)
      .map((entry) => entry.digit);

    if (field === 'digit' && value && usedDigits.includes(value)) {
      setErrors((prev) => ({ ...prev, [`digit_${id}`]: 'Digit already in use.' }));
      return;
    }

    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
    setErrors((prev) => ({ ...prev, [`digit_${id}`]: undefined }));
  };

  const removeEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const getOptionsForType = (type: string) => {
    return (database as any)[type + 's'] || [];
  };

  return (
    <div className="p-4 sm:p-6 md:p-8  bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          IVR Configuration
        </h1>
        <div className="mb-4">
          <button
            type="button"
            onClick={addEntry}
            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            aria-label="Add new IVR entry"
          >
            + Add Entry
          </button>
        </div>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 sm:gap-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Digit Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={entry.digit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9]?$/.test(value)) {
                        updateEntry(entry.id, 'digit', value);
                      }
                    }}
                    className={`w-full bg-gray-100 border-2 rounded-md p-2 text-gray-800 placeholder-gray-500 transition-colors ${
                      errors[`digit_${entry.id}`]
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-transparent focus:border-indigo-500 focus:ring-indigo-400'
                    } focus:ring-1 focus:bg-white`}
                    placeholder="Digit"
                    aria-label="Digit for entry"
                  />
                  {errors[`digit_${entry.id}`] && (
                    <p className="text-red-600 text-xs mt-1 px-1 absolute">{errors[`digit_${entry.id}`]}</p>
                  )}
                </div>

                {/* Type Select */}
                <select
                  value={entry.type}
                  onChange={(e) => updateEntry(entry.id, 'type', e.target.value)}
                  className="w-full bg-gray-100 border-2 border-transparent rounded-md p-2 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-colors"
                  aria-label="Select type for entry"
                >
                  <option value="">Select Type</option>
                  {['extension', 'queue', 'ivr', 'recording'].map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Value Select */}
                <select
                  value={entry.value}
                  onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                  className="w-full bg-gray-100 border-2 border-transparent rounded-md p-2 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-colors"
                  aria-label="Select value for entry"
                  disabled={!entry.type}
                >
                  <option value="">
                    {entry.type ? `Select ${entry.type}` : 'Select Option'}
                  </option>
                  {getOptionsForType(entry.type).map((option: any) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="p-2 text-gray-500 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors"
                aria-label="Remove entry"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No entries. Click "+ Add Entry" to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
