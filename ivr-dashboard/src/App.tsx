import Sidebar from './components/Sidebar'
import { FiPlus } from 'react-icons/fi'
import { Routes, Route, Link } from 'react-router-dom'
import IVRMenuForm from './components/IVRMenuForm'
import IVRMenus from './components/IVRMenus'
import SystemRecordings from './components/SystemRecordingUpload'

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">IVR Flows</h1>
              <Link to="/create-flow" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                <FiPlus className="w-5 h-5" />
                <span>New Flow</span>
              </Link>
            </div>

            <Routes>
              <Route path="/" element={<IVRMenus />} />
              <Route path="/create-flow" element={<IVRMenuForm />} />
              <Route path="/system-recordings-upload" element={<SystemRecordings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App