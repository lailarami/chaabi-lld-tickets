export default function Loader({ size = 'md', text }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin`}
        style={{ borderWidth: 3 }}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader size="lg" text="Chargement..." />
    </div>
  )
}
