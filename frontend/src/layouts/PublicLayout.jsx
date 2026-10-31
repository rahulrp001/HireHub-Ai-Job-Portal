import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import LoginDrawer from '../components/common/LoginDrawer'
import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f8]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LoginDrawer />
    </div>
  )
}
