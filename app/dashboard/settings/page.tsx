export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">
          Settings
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <section>
          <h2 className="font-playfair text-lg font-medium text-[#1a1a2e] mb-4">
            Company Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Company Name", value: "Nepal Treks Pvt. Ltd." },
              { label: "Email", value: "admin@nepaltreks.com" },
              { label: "Phone", value: "+977 1 4444444" },
              { label: "Location", value: "Kathmandu, Nepal" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs text-gray-500 mb-1.5">
                  {f.label}
                </label>
                <input
                  defaultValue={f.value}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1A5276]"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-gray-100 pt-4">
          <button className="px-5 py-2 bg-[#1A5276] text-white rounded-lg text-sm font-medium hover:bg-[#154360] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
