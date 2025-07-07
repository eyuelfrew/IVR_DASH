import { useState, useEffect } from 'react'
import { FiEdit, FiTrash, FiPlus, FiClock } from 'react-icons/fi'
import axios from 'axios'
import type { IVROption } from './types'

type IVRMenu = {
  _id: string
  name: string
  greeting: string
  description: string
  options: IVROption[]
  createdAt: string
}

export default function IVRMenus() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [menus, setMenus] = useState<IVRMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API}/api/ivr/menu`)
      setMenus(response.data)
    } catch (err) {
      setError('Failed to fetch IVR menus')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteMenu = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu?')) return
    try {
      await axios.delete(`${API}/api/ivr/menu/${id}`)
      setMenus(menus.filter(menu => menu._id !== id))
    } catch (err) {
      setError('Failed to delete menu')
      console.error(err)
    }
  }

  const handleEdit = (id: string) => {
    // Add edit logic here
  }

  const handleDelete = (id: string) => {
    deleteMenu(id)
  }

  if (loading) return <div className="flex justify-center p-8">Loading IVR menus...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">IVR Menus</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FiPlus /> Create New IVR
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {menus.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No IVR menus found. Create your first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menus.map((menu) => (
                  <tr key={menu._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{menu.name}</div>
                      <div className="text-sm text-gray-500">
                        {menu.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(menu._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(menu._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}