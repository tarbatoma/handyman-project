import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPrice(price) {
  if (!price) return 'Negociabil'
  return `de la ${price} RON`
}

export function getInitials(name) {
  if (!name) return '??'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getAvatarUrl(supabase, path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export function getPortfolioUrl(supabase, path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('portfolio').getPublicUrl(path)
  return data.publicUrl
}
