
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
