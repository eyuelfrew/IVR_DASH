import { FiPhone, FiList, FiMusic, FiUpload, FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-sm flex flex-col">
      <div className="flex items-center gap-3 p-4 mb-4">
        <span className="bg-blue-600 text-white rounded-full p-2">
          <FiPhone className="h-6 w-6" />
        </span>
        <span className="text-xl font-bold">IVR Manager</span>
      </div>
      
      {/* Add New IVR Button */}
      <div className="px-4 mb-6">
        <Link 
          to="/create-flow" 
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New IVR</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
        <Link 
          to="/" 
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors"
        >
          <FiList className="w-5 h-5" />
          <span className="font-medium">IVR List</span>
        </Link>
        
        <Link 
          to="/misc-applications" 
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors"
        >
          <FiList className="w-5 h-5" />
          <span className="font-medium">Misc Application</span>
        </Link>

        <Link 
          to="/system-recordings" 
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors"
        >
          <FiMusic className="w-5 h-5" />
          <span className="font-medium">Recordings List</span>
        </Link>

        <Link 
          to="/system-recordings-upload" 
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors"
        >
          <FiUpload className="w-5 h-5" />
          <span className="font-medium">Upload Recordings</span>
        </Link>

        {/* <Link 
          to="#" 
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors"
        >
          <FiPhone className="w-5 h-5" />
          <span className="font-medium">Call Logs</span>
        </Link> */}
        {/* <Link 
          to="#" 
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded transition-colors"
        >
          <FiSettings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link> */}
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