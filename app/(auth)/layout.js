import Link from 'next/link'
import { Wrench } from 'lucide-react'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-10">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        Meșter<span className="text-primary">Hub</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
