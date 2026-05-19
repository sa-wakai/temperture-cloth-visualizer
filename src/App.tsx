import { lazy, Suspense, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { WardrobeProvider } from './context/WardrobeContext';

const OutdoorTab = lazy(() => import('./pages/OutdoorTab'));
const IndoorTab = lazy(() => import('./pages/IndoorTab'));
const SetupScreen = lazy(() => import('./pages/SetupScreen'));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Could log to an error service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            エラーが発生しました
          </p>
          <button
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 15,
              cursor: 'pointer',
            }}
            onClick={() => this.setState({ hasError: false })}
          >
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function TabsLayout() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="page-header">
        <button
          className="btn-icon"
          aria-label="セットアップ"
          onClick={() => navigate('/setup')}
          style={{ fontSize: 22 }}
        >
          ⚙️
        </button>
      </div>

      <nav className="tab-bar" aria-label="メインメニュー">
        <NavLink
          to="/outdoor"
          className={({ isActive }) => `tab-bar-btn${isActive ? ' active' : ''}`}
        >
          外出
        </NavLink>
        <NavLink
          to="/indoor"
          className={({ isActive }) => `tab-bar-btn${isActive ? ' active' : ''}`}
        >
          子供の室内
        </NavLink>
      </nav>

      <Suspense fallback={<div className="skeleton" style={{ marginTop: 32 }} />}>
        <Routes>
          <Route
            path="/outdoor"
            element={
              <ErrorBoundary>
                <OutdoorTab />
              </ErrorBoundary>
            }
          />
          <Route path="/indoor" element={<IndoorTab />} />
          <Route path="*" element={<Navigate to="/outdoor" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WardrobeProvider>
        <Routes>
          <Route
            path="/setup"
            element={
              <div className="app-shell">
                <Suspense fallback={<div className="skeleton" style={{ marginTop: 32 }} />}>
                  <SetupScreen />
                </Suspense>
              </div>
            }
          />
          <Route path="/*" element={<TabsLayout />} />
        </Routes>
      </WardrobeProvider>
    </BrowserRouter>
  );
}
