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
import { ProfileProvider } from "./components/contexts/ProfileContext"
import ErrorBoundary from "./components/shared/ErrorBoundary"

function App() {

  return (
    <ProfileProvider>
      <main className='nebula-app w-full min-h-screen text-gray-100'>
        <Header />
        <ErrorBoundary>
        <Suspense fallback={<Preloader />}>
          <Routes>
            {routes.map(({ path, component: Component }, index) => (
              <Route key={index} index={path === "/"} path={path} element={<Component />} />
            ))}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
        <Footer />
        <ScrollToTop />
        <ScrollButton />
        <Toaster richColors />
      </main>
    </ProfileProvider>
  )
}

export default App
