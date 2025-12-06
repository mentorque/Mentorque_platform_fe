import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { avataaars, initials } from '@dicebear/collection'

interface GenderAwareAvatarProps {
  name: string
  email?: string
  size?: number
  gender?: 'male' | 'female' | 'neutral'
  className?: string
}

// Helper function to infer gender from name (simple heuristic)
function inferGenderFromName(name: string): 'male' | 'female' | 'neutral' {
  if (!name) return 'neutral'
  
  const lowerName = name.toLowerCase()
  
  // Common female name endings (Western + Indian)
  const femaleIndicators = [
    // Western patterns
    'a', 'ia', 'elle', 'ette', 'ine', 'anna', 'ella', 'sara', 'maria', 'lisa',
    // Indian female patterns
    'iya', 'ika', 'ita', 'ini', 'ani', 'ya', 'i', 'ika', 'ita', 'priya', 'anjali', 
    'kavya', 'meera', 'radha', 'sita', 'divya', 'neha', 'kiran', 'pooja', 'rashmi',
    'shweta', 'swati', 'aditi', 'aarti', 'deepika', 'katrina', 'alia', 'anushka'
  ]
  
  // Common male name endings (Western + Indian)
  const maleIndicators = [
    // Western patterns
    'o', 'er', 'on', 'en', 'an', 'john', 'mike', 'james', 'david', 'robert',
    // Indian male patterns
    'esh', 'raj', 'deep', 'nath', 'kumar', 'singh', 'pal', 'ant', 'an', 'ram',
    'krishna', 'arjun', 'vikram', 'rohan', 'aman', 'rahul', 'aditya', 'vishal',
    'mohit', 'suraj', 'nikhil', 'shyam', 'gaurav', 'aman', 'varun', 'akash',
    'anil', 'rajesh', 'mahesh', 'suresh', 'pramod', 'dinesh', 'mukesh', 'sachin'
  ]
  
  // Check if name ends with typical female indicators
  if (femaleIndicators.some(indicator => lowerName.endsWith(indicator) || lowerName.includes(indicator))) {
    return 'female'
  }
  
  // Check if name ends with typical male indicators
  if (maleIndicators.some(indicator => lowerName.endsWith(indicator) || lowerName.includes(indicator))) {
    return 'male'
  }
  
  return 'neutral'
}

export default function GenderAwareAvatar({
  name,
  email,
  size = 40,
  gender,
  className = '',
}: GenderAwareAvatarProps) {
  const inferredGender = gender || inferGenderFromName(name)
  const seed = email || name

  const avatarSvg = useMemo(() => {
    try {
      // Use Avataaars style which supports gender
      const avatar = createAvatar(avataaars, {
        seed: seed,
        size: size,
        // Style options for gender-aware generation
        style: ['circle'],
        // These options influence the generated avatar
        accessoriesProbability: 50,
        facialHairProbability: inferredGender === 'male' ? 30 : 0,
        // More customization can be added here
      })

      return avatar.toDataUri()
    } catch (error) {
      console.error('Error generating avatar:', error)
      // Fallback to initials
      const initialsAvatar = createAvatar(initials, {
        seed: seed,
        size: size,
        fontSize: size / 2,
      })
      return initialsAvatar.toDataUri()
    }
  }, [seed, size, inferredGender])

  return (
    <img
      src={avatarSvg}
      alt={name}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

