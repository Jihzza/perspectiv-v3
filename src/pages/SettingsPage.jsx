export default function SettingsPage() {
  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>
        <div className="space-y-4">
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  className="ui-input"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notifications</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Email notifications
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Push notifications
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#33ccff]/15 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>Portuguese</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
