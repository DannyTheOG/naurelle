import React, { useState, useEffect, useRef } from 'react'
import { User, Calendar, LogOut } from 'lucide-react'
import type { UserProfile } from '../../types'

interface UserAvatarMenuProps {
  displayName: string
  email?: string
  profile: UserProfile | null
  onOpenProfile: () => void
  onOpenBookings: () => void
  onLogout: () => Promise<void> | void
}

function getInitials(name: string, email?: string): string {
  const trimmed = name.trim()
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return ''
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  displayName,
  email,
  profile,
  onOpenProfile,
  onOpenBookings,
  onLogout,
}) => {
  const [open, setOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const avatarUrl = profile?.avatarUrl?.trim() || ''
  const showImage = Boolean(avatarUrl) && !imgError
  const initials = getInitials(profile?.fullName || displayName, email || profile?.email)

  useEffect(() => {
    setImgError(false)
  }, [avatarUrl])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleAction = (callback: () => void) => {
    setOpen(false)
    callback()
  }

  return (
    <div ref={menuRef} className="avatar-menu-wrapper">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="avatar-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${profile?.fullName || displayName}`}
      >
        {showImage ? (
          <img
            src={avatarUrl}
            alt={profile?.fullName || displayName}
            className="avatar-menu-image"
            onError={() => setImgError(true)}
          />
        ) : initials ? (
          <span className="avatar-menu-initials">{initials}</span>
        ) : (
          <User size={18} aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="avatar-menu-dropdown" role="menu" aria-label="User account options">
          <div className="avatar-menu-header">
            <div className="avatar-menu-header-top">
              <span className="avatar-menu-name">{profile?.fullName || displayName}</span>
              {profile?.role && profile.role !== 'client' && (
                <span className="avatar-menu-role">{profile.role}</span>
              )}
            </div>
            {(email || profile?.email) && (
              <span className="avatar-menu-email">{email || profile?.email}</span>
            )}
          </div>

          <div className="avatar-menu-items">
            <button
              type="button"
              role="menuitem"
              className="avatar-menu-item"
              onClick={() => handleAction(onOpenProfile)}
            >
              <User size={16} aria-hidden="true" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="avatar-menu-item"
              onClick={() => handleAction(onOpenBookings)}
            >
              <Calendar size={16} aria-hidden="true" />
              <span>My Bookings</span>
            </button>

            <div className="avatar-menu-divider" role="separator" />

            <button
              type="button"
              role="menuitem"
              className="avatar-menu-item avatar-menu-item-danger"
              onClick={() => handleAction(() => void onLogout())}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

