interface InputProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  min?: number
  step?: number
}

export default function Input({ label, value, onChange, type = 'text', placeholder, required, min, step }: InputProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}