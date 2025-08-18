import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, Routes as Router } from 'react-router-dom'
import { Home } from './components/pages/home'
import { ChainGuard } from './components/shared/ChainGuard'
import { Navigation } from './components/shared/Navigation'
import { Providers, Updaters } from './context'
import './style.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <Providers>
      <Navigation showConnectButton={false} />
      <ChainGuard>
        <Router>
          <Route path="/" element={<Home />} />
        </Router>
      </ChainGuard>
      <Updaters />
    </Providers>
  </StrictMode>,
)
