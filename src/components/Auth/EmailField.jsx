export default function EmailField({ value, onChange }) {
    return (
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          className="w-full bg-black/10 border border-[#24C8FF] rounded-lg px-2 py-1"
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>
    );
  }