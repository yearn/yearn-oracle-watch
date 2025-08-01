import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, Routes as Router } from 'react-router-dom'
import { Home } from './components/pages/home'
import { Navigation } from './components/shared/Navigation'
import { ChainGuard } from './components/shared/ChainGuard'
import { MainLayout } from './components/shared/MainLayout'
import { MetadataProvider } from './context/MetadataContext'
import { Providers, Updaters } from './context'
import './style.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <Providers>
      <MetadataProvider>
        <Navigation />
        <ChainGuard>
          <MainLayout>
            <Router>
              <Route path="/" element={<Home />} />
            </Router>
          </MainLayout>
        </ChainGuard>
        <Updaters />
      </MetadataProvider>
    </Providers>
  </StrictMode>
)
