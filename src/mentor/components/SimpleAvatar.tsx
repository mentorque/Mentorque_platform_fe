import { User } from 'lucide-react'

interface SimpleAvatarProps {
  name: string
  email?: string
  size?: number
  className?: string
  imageUrl?: string | null
}

export default function SimpleAvatar({
  name,
  email,
  size = 40,
  className = '',
  imageUrl,
}: SimpleAvatarProps) {
  // If there's an uploaded image, show it
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const initials = getInitials(name)

  // Generate a consistent color based on the name
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const bgColor = getColorFromName(name || email || 'User')

  return (
    <div
      className={`${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initials}
    </div>
  )
}

