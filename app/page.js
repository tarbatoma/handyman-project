import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import HowItWorks from '@/components/home/HowItWorks'
import BenefitsSection from '@/components/home/BenefitsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CtaSection from '@/components/home/CtaSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoriesSection />
        <HowItWorks />
        <BenefitsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
