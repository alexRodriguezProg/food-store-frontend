interface ButtonProps {
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'danger' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
}

export default function Button({ onClick, children, variant = 'primary', disabled, type = 'button' }: ButtonProps) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    danger: "text-red-500 hover:underline",
    ghost: "text-gray-600 hover:underline",
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}