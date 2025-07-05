import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import IVRMenuForm from './components/IVRMenuForm'
import IVRMenus from './components/IVRMenus'
import SystemRecordingUpload from './components/SystemRecordingUpload'
import SystemRecordings from './pages/SystemRecordings'

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col space-y-6">
            <Routes>
              <Route path="/" element={<IVRMenus />} />
              <Route path="/create-flow" element={<IVRMenuForm />} />
              <Route path="/system-recordings" element={<SystemRecordings />} />
              <Route path="/system-recordings-upload" element={<SystemRecordingUpload />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App;