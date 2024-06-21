import { Suspense } from "react"
import routes from "./routes"
import { Route, Routes } from "react-router-dom"
import { Preloader } from "./utils/Preloader"
import Header from "./components/shared/Header"
import Footer from "./components/shared/Footer"
import ScrollButton from "./components/shared/ScrollButton"
import 'react-multi-carousel/lib/styles.css';
import { Toaster } from 'sonner';
import PageNotFound from "./utils/PageNotFound"
import ScrollToTop from "./utils/ScrollToTop"
function App() {

  return (
    <main className='w-full min-h-screen bg-bodyBg text-gray-100'>
      <Header />
      <Suspense fallback={<Preloader />}>
        <Routes>
          {routes.map(({ path, component: Component }, index) => (
            <Route key={index} index={path === "/"} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <ScrollToTop />
      <ScrollButton />
      <Toaster richColors />
    </main>
  )
}

export default App
