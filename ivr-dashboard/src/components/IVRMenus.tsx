import { useState, useEffect } from 'react'
import { FiEdit, FiTrash } from 'react-icons/fi'
import axios from 'axios'
import type { IVROption } from './types'

type IVRMenu = {
  _id: string
  name: string
  greeting: string
  options: IVROption[]
  createdAt: string
}

export default function IVRMenus() {
  const [menus, setMenus] = useState<IVRMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3000/api/menus')
      console.log(response.data)
      console.log(response.data)
      console.log(response.data)
      setMenus(response.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch menus')
    } finally {
      setLoading(false)
    }
  }

  const deleteMenu = async (id: string) => {
    if (!window.confirm(`${id}Are you sure you want to delete this menu?`)) return

    try {
      await axios.delete(`http://localhost:3000/api/menus/${id}`)
      setMenus(menus.filter(menu => menu._id !== id))
    } catch (err) {
      setError('Failed to delete menu')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">IVR Menus</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading menus...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <div key={menu._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{menu.name}</h3>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Edit menu"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete menu"
                      onClick={() => deleteMenu(menu._id)}
                    >
                      <FiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{menu.greeting}</p>
                <div className="text-sm text-gray-500">
                  Created: {new Date(menu.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
