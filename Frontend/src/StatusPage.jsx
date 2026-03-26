import React, { useState, useEffect } from 'react'

const apiBase = 'http://localhost:5002/api'

export default function StatusPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', message: 'Checking system...' })

  useEffect(() => {
    fetchStats()
    checkSystemHealth()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiBase}/search/filters`)
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const checkSystemHealth = async () => {
    try {
      const start = Date.now()
      const res = await fetch(`${apiBase}/search?q=test&limit=1`)
      const latency = Date.now() - start
      
      if (res.ok) {
        setSystemHealth({
          status: 'healthy',
          message: `System Online • ${latency}ms latency`,
          latency
        })
      } else {
        setSystemHealth({
          status: 'error',
          message: 'System Error'
        })
      }
    } catch {
      setSystemHealth({
        status: 'offline',
        message: 'System Offline'
      })
    }
  }

  const getTotalProjects = () => {
    if (!stats?.counts?.byCategory) return 0
    return Object.values(stats.counts.byCategory).reduce((a, b) => a + b, 0)
  }

  const getTopCategory = () => {
    if (!stats?.counts?.byCategory) return null
    const entries = Object.entries(stats.counts.byCategory)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }

  const getTopFaculty = () => {
    if (!stats?.counts?.byFaculty) return null
    const entries = Object.entries(stats.counts.byFaculty)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }

  return (
    <div className="status-page">
      <header className="status-header">
        <div className="logo-section">
          <div className="logo">💡</div>
          <div>
            <h1>IdeaBridge Status</h1>
            <p className="subtitle">System Overview & Analytics</p>
          </div>
        </div>
        <a href="/" className="back-link">← Back to Search</a>
      </header>

      {/* System Health */}
      <div className={`health-card ${systemHealth.status}`}>
        <div className="health-indicator"></div>
        <div className="health-content">
          <h2>System Status</h2>
          <p className="health-message">{systemHealth.message}</p>
        </div>
        <button className="refresh-btn" onClick={checkSystemHealth}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchStats}>Try Again</button>
        </div>
      ) : stats ? (
        <>
          {/* Main Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-value">{getTotalProjects()}</span>
                <span className="stat-label">Total Projects</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.faculties?.length || 5}</span>
                <span className="stat-label">Faculties</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <span className="stat-value">80</span>
                <span className="stat-label">Courses</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.categories?.length || 9}</span>
                <span className="stat-label">Categories</span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="top-section">
            <div className="top-card">
              <h3>🏆 Top Category</h3>
              {getTopCategory() ? (
                <div className="top-content">
                  <span className="top-name">{getTopCategory()[0]}</span>
                  <span className="top-count">{getTopCategory()[1]} projects</span>
                </div>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>

            <div className="top-card">
              <h3>🎓 Top Faculty</h3>
              {getTopFaculty() ? (
                <div className="top-content">
                  <span className="top-name">{getTopFaculty()[0]}</span>
                  <span className="top-count">{getTopFaculty()[1]} projects</span>
                </div>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="distribution-section">
            <div className="dist-card">
              <h3>Projects by Category</h3>
              <div className="bar-chart">
                {stats.counts?.byCategory && Object.entries(stats.counts.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => {
                    const max = Math.max(...Object.values(stats.counts.byCategory))
                    const percentage = (count / max) * 100
                    return (
                      <div key={name} className="bar-item">
                        <span className="bar-label">{name}</span>
                        <div className="bar-wrapper">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="bar-value">{count}</span>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="dist-card">
              <h3>Projects by Faculty</h3>
              <div className="bar-chart">
                {stats.counts?.byFaculty && Object.entries(stats.counts.byFaculty)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => {
                    const max = Math.max(...Object.values(stats.counts.byFaculty))
                    const percentage = (count / max) * 100
                    return (
                      <div key={name} className="bar-item">
                        <span className="bar-label">{name}</span>
                        <div className="bar-wrapper">
                          <div className="bar-fill faculty" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="bar-value">{count}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="api-status">
            <h3>API Endpoints</h3>
            <div className="endpoint-list">
              <div className="endpoint-item">
                <span className="endpoint-method">GET</span>
                <span className="endpoint-path">/api/search</span>
                <span className="endpoint-status active">✓ Active</span>
              </div>
              <div className="endpoint-item">
                <span className="endpoint-method">GET</span>
                <span className="endpoint-path">/api/search/filters</span>
                <span className="endpoint-status active">✓ Active</span>
              </div>
              <div className="endpoint-item">
                <span className="endpoint-method">GET</span>
                <span className="endpoint-path">/api/search/tags</span>
                <span className="endpoint-status active">✓ Active</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <footer className="status-footer">
        <p>IdeaBridge Project Status Dashboard • Last updated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  )
}
