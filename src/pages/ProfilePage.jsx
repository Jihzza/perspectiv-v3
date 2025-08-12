export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        <div className="max-w-2xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                JD
              </div>
              <div>
                <h3 className="text-xl font-semibold">John Doe</h3>
                <p className="text-gray-300">john.doe@example.com</p>
                <p className="text-sm text-gray-400">Member since 2024</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                  defaultValue="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea 
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">42</div>
                <div className="text-sm text-gray-300">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">156</div>
                <div className="text-sm text-gray-300">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">89%</div>
                <div className="text-sm text-gray-300">Completion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
