import React from 'react'
import type { IVROption } from './types'

export default function IVROptionFields({
  options,
  setOptions,
}: {
  options: IVROption[]
  setOptions: (opts: IVROption[]) => void
}) {
  const handleChange = (idx: number, field: keyof IVROption, value: string) => {
    const updated = [...options]
    updated[idx][field] = value
    setOptions(updated)
  }

  const addOption = () => setOptions([...options, { number: '', queue: '', action: 'queue', description: '' }])
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx))

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Menu Options</h3>
      {options.map((opt, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 mb-3">
          <input
            className="border rounded px-2 py-1"
            placeholder="Number (e.g. 1)"
            value={opt.number}
            onChange={e => handleChange(idx, 'number', e.target.value)}
            required
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Queue (e.g. Sales)"
            value={opt.queue}
            onChange={e => handleChange(idx, 'queue', e.target.value)}
            required
          />
          <select
            className="border rounded px-2 py-1"
            value={opt.action}
            onChange={e => handleChange(idx, 'action', e.target.value)}
          >
            <option value="queue">Queue</option>
            <option value="extension">Extension</option>
            <option value="voicemail">Voicemail</option>
          </select>
          <input
            className="border rounded px-2 py-1"
            placeholder="Description"
            value={opt.description}
            onChange={e => handleChange(idx, 'description', e.target.value)}
          />
        </div>
      ))}
      <button
        type="button"
        className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 mt-2"
        onClick={addOption}
      >
        + Add Option
      </button>
    </div>
  )
}
