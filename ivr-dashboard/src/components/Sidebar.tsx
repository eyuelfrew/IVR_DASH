import { FiPhone, FiGrid, FiList, FiSettings, FiLogOut, FiMusic, FiUpload } from 'react-icons/fi'

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 mb-10">
        <span className="bg-blue-600 text-white rounded-full p-2">
          <FiPhone className="h-6 w-6" />
        </span>
        <span className="text-xl font-bold">IVR Manager</span>
      </div>
      <nav className="flex flex-col gap-2">
        {/* <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors">
          <FiGrid className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </a> */}
        <a href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors">
          <FiList className="w-5 h-5" />
          <span className="font-medium">IVR List</span>
        </a>
        <a href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors">
          <FiList className="w-5 h-5" />
          <span className="font-medium">Mics Application</span>
        </a>

        <a href="/system-recordings" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors">
          <FiMusic className="w-5 h-5" />
          <span className="font-medium">Recordings List</span>
        </a>

        <a href="/system-recordings-upload" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors">
          <FiUpload className="w-5 h-5" />
          <span className="font-medium">Upload Recordings</span>
        </a>

        {/* <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors">
          <FiPhone className="w-5 h-5" />
          <span className="font-medium">Call Logs</span>
        </a> */}
        {/* <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors">
          <FiSettings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </a> */}
      </nav>
      {/* <div className="mt-auto p-4 border-t">
        <button className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors">
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div> */}
    </aside>
  )
}

export default Sidebar