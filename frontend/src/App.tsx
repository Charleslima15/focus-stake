import { Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { ShamePoolTicker } from './components/ShamePoolTicker'
import { Home } from './pages/Home'
import { FocusApp } from './pages/FocusApp'
import { Leaderboard } from './pages/Leaderboard'

function App() {
  return (
    <>
      <div className="site-backdrop" aria-hidden="true">
        <div className="scanline" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<FocusApp />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>

        <footer className="mt-8">
          <ShamePoolTicker />
        </footer>
      </div>
    </>
  )
}

export default App
