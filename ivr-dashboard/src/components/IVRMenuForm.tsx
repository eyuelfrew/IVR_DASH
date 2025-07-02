import { useState, useEffect } from 'react'
import axios from 'axios'
import IVROptionFields from './IVROptionFields'
import type { IVROption } from './types'

export default function IVRMenuForm() {
  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState('')
  const [recordings, setRecordings] = useState<string[]>([])
  const [options, setOptions] = useState<IVROption[]>([
    { number: '', queue: '', action: 'queue', description: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('http://localhost:3000/recordings')
      .then(res => setRecordings(res.data))
      .catch(() => setRecordings([]))
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSuccess('')
      setError('')
    }, 5000)
    return () => clearTimeout(timeout)
  }, [success, error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Please enter a menu name')
      return
    }

    if (options.some(opt => !opt.number || !opt.queue || !opt.action)) {
      setError('Please fill out all fields in each menu option')
      return
    }

    const ivrData = { name, greeting, options }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:3000/api/menus', ivrData)
      console.log(response.data)
      console.log(response.data)
      console.log(response.data)
      setSuccess('IVR Menu created successfully!')
      setName('')
      setGreeting('')
      setOptions([{ number: '', queue: '', action: 'queue', description: '' }])
    } catch (err) {
      setError('Failed to create IVR menu. Please try again.')
      console.error('Error creating IVR menu:', err)
    } finally {
      setLoading(false)
    }
  }

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
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Select Greeting Recording</label>
          <select
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">-- Select --</option>
            {recordings.map(rec => (
              <option key={rec} value={`${rec}`}>{rec}</option>
            ))}
          </select>
          {greeting && (
            <audio
              controls
              className="mt-2"
              src={`http://localhost:3000/recordings/${greeting}.wav`}
            />
          )}
        </div>

        <IVROptionFields options={options} setOptions={setOptions} />

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setName('')
              setGreeting('')
              setOptions([{ number: '', queue: '', action: 'queue', description: '' }])
              setSuccess('')
              setError('')
            }}
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
  )
}
