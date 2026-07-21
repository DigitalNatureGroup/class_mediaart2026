import { HashRouter, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '../components/Layout/SiteLayout'
import { ScrollManager } from '../components/Navigation/ScrollManager'
import { RouteEffects } from '../components/Navigation/RouteEffects'
import { HomePage } from '../pages/HomePage'
import { WorksPage } from '../pages/WorksPage'
import { WorkDetailPage } from '../pages/WorkDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRouter() {
  return (
    <HashRouter>
      <ScrollManager />
      <RouteEffects />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:slug" element={<WorkDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
