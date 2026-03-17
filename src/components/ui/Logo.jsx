export default function Logo({ size = 32 }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%)',
        boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
      }}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Document */}
        <rect
          x="2" y="2" width="14" height="18" rx="2"
          fill="white" fillOpacity="0.2"
          stroke="white" strokeOpacity="0.5" strokeWidth="1.2"
        />
        {/* Resume text lines */}
        <rect x="5" y="7"  width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.85" />
        <rect x="5" y="11" width="5" height="1.5" rx="0.75" fill="white" fillOpacity="0.65" />
        <rect x="5" y="15" width="7" height="1.5" rx="0.75" fill="white" fillOpacity="0.55" />
        {/* Lightning bolt — AI transformation */}
        <path d="M18 2L13 12H17L12 22L23 10H19L18 2Z" fill="white" />
      </svg>
    </div>
  )
}
