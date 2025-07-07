import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
const database = {
    extensions: [
      { id: '1002', name: 'Support Team (1002)' },
      { id: '1006', name: 'Sales Team (1006)' },
    ],
    queues: [
      { id: '2000', name: 'Customer Support Queue' },
      { id: '3000', name: 'Sales Queue' },
    ],

  };
interface EntryErrors {
    [key: string]: string | null | undefined;
  }
  interface IVREntry {
    id: number;
    type: string;
    digit: string;
    value: string;
  }
  

  interface IVREntriesProps {
    entries: IVREntry[];
    setEntries: (entries: IVREntry[]) => void;
    systemRecordings: Array<{_id: string, name: string}>;
  }
  
  const IVREntries: React.FC<IVREntriesProps> = ({ entries, setEntries, systemRecordings }) => {
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
      if (type === 'recording') {
        return systemRecordings;
      }
      return (database as any)[type + 's'] || [];
    };
  
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-gray-50">
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
                    <option value="recording">Recording</option>
                    <option value="extension">Extension</option>
                    <option value="queue">Queue</option>
                    <option value="ivr">IVR</option>
                  </select>

                  {/* Value Select - Conditionally render based on type */}
                  {entry.type === 'recording' ? (
                    <select
                      value={entry.value}
                      onChange={(e) => {
                        const selected = systemRecordings.find(r => r._id === e.target.value);
                        if (selected) {
                          updateEntry(entry.id, 'value', selected._id);
                        }
                      }}
                      className="w-full bg-gray-100 border-2 border-transparent rounded-md p-2 text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-colors"
                      aria-label="Select recording"
                    >
                      <option value="">Select Recording</option>
                      {systemRecordings.map((recording) => (
                        <option key={recording._id} value={recording._id}>
                          {recording.name}
                        </option>
                      ))}
                    </select>
                  ) : (
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
                  )}
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
  

  export default IVREntries;