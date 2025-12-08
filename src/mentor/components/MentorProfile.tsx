import { useState, useEffect, useMemo } from 'react'
import { UserCircle, Upload, Building2, Briefcase, User, Save, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface MentorProfileData {
  id: string
  name: string
  email: string
  company: string | null
  role: string | null
  picture: string | null
  expertise: string | null
  background: string | null
  availability: string | null
}

interface MentorProfileProps {
  adminInfo: any
  onUpdate?: () => void
}

export default function MentorProfile({ adminInfo, onUpdate }: MentorProfileProps) {
  const [profile, setProfile] = useState<MentorProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    expertise: '',
    background: '',
    availability: '',
  })

  useEffect(() => {
    loadProfile()
  }, [adminInfo])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/me`, {
        credentials: 'include',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        const mentorData = data.adminMentor
        setProfile(mentorData)
        setFormData({
          name: mentorData.name || '',
          company: mentorData.company || '',
          role: mentorData.role || '',
          expertise: mentorData.expertise || '',
          background: mentorData.background || '',
          availability: mentorData.availability || '',
        })
        if (mentorData.picture) {
          setPreviewImage(mentorData.picture)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('company', formData.company)
      formDataToSend.append('role', formData.role)
      formDataToSend.append('expertise', formData.expertise)
      formDataToSend.append('background', formData.background)
      formDataToSend.append('availability', formData.availability)

      if (selectedFile) {
        formDataToSend.append('picture', selectedFile)
      }

      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: formDataToSend,
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(data.adminMentor)
        setSelectedFile(null)
        toast.success('Profile updated successfully!')
        if (onUpdate) {
          onUpdate()
        }
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Calculate profile completion percentage
  const completionPercentage = useMemo(() => {
    const fields = [
      formData.name,
      previewImage || profile?.picture,
      formData.company,
      formData.role,
      formData.expertise,
      formData.background,
      formData.availability,
    ]
    const filledFields = fields.filter((field) => field && field.trim().length > 0).length
    return Math.round((filledFields / fields.length) * 100)
  }, [formData, previewImage, profile])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h2>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Completion</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{completionPercentage}%</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                className="text-blue-600 dark:text-blue-500 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            {completionPercentage === 100 && (
              <CheckCircle2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-500" />
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-20 h-20 text-gray-400 dark:text-gray-600" />
              )}
            </div>
            <label
              htmlFor="picture-upload"
              className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-colors shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <input
                id="picture-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
            Profile picture displayed to users. Recommended: Square image, 500x500px or larger.
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Your name as shown to users (e.g., John Doe)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Company name (e.g., Google, Microsoft, Amazon)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Role / Job Title
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Your job title (e.g., Senior Software Engineer, Product Manager)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Area of Expertise
          </label>
          <input
            type="text"
            value={formData.expertise}
            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
            placeholder="Your area of expertise (e.g., Software Engineering, System Design)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Professional Background
          </label>
          <textarea
            value={formData.background}
            onChange={(e) => setFormData({ ...formData, background: e.target.value })}
            rows={4}
            placeholder="Brief professional background and achievements visible to users"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Availability
          </label>
          <textarea
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            rows={3}
            placeholder="Your availability (e.g., Monday-Friday, 9 AM - 5 PM EST)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

