import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, Routes as Router } from 'react-router-dom'
import { Home } from './components/pages/home'
import { Navigation } from './components/shared/Navigation'
import { ChainGuard } from './components/shared/ChainGuard'
import { MainLayout } from './components/shared/MainLayout'
import { MetadataProvider } from './context/MetadataContext'
import { DebugProvider } from './context/DebugContext'
import { Providers, Updaters } from './context'
import './style.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <Providers>
      <DebugProvider>
        <MetadataProvider>
          <Navigation showConnectButton={false}/>
          <ChainGuard>
            <MainLayout>
              <Router>
                <Route path="/" element={<Home />} />
              </Router>
            </MainLayout>
          </ChainGuard>
          <Updaters />
        </MetadataProvider>
      </DebugProvider>
    </Providers>
  </StrictMode>
)
