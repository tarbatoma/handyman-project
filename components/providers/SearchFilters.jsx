'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SERVICE_CATEGORIES, SECTORS } from '@/lib/constants'
import { X } from 'lucide-react'

export default function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAll = () => {
    router.push(pathname)
  }

  const currentCategory = searchParams.get('category')
  const currentArea = searchParams.get('area')
  const currentSort = searchParams.get('sort')
  const hasFilters = currentCategory || currentArea || currentSort

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filtre</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Resetează
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Sortare</Label>
        <div className="space-y-2">
          {[
            { value: '', label: 'Cei mai noi' },
            { value: 'rating', label: 'Rating desc' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`sort-${opt.value}`}
                checked={currentSort === opt.value || (!currentSort && opt.value === '')}
                onCheckedChange={() => updateFilter('sort', opt.value || null)}
              />
              <label htmlFor={`sort-${opt.value}`} className="text-sm cursor-pointer">
                {opt.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Categorie</Label>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {SERVICE_CATEGORIES.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={currentCategory === cat.slug}
                onCheckedChange={(checked) =>
                  updateFilter('category', checked ? cat.slug : null)
                }
              />
              <label
                htmlFor={`cat-${cat.slug}`}
                className="text-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>{cat.icon}</span>
                {cat.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Areas */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Sector</Label>
        <div className="space-y-2">
          {SECTORS.map((sector) => (
            <div key={sector.slug} className="flex items-center gap-2">
              <Checkbox
                id={`area-${sector.slug}`}
                checked={currentArea === sector.slug}
                onCheckedChange={(checked) =>
                  updateFilter('area', checked ? sector.slug : null)
                }
              />
              <label htmlFor={`area-${sector.slug}`} className="text-sm cursor-pointer">
                {sector.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
