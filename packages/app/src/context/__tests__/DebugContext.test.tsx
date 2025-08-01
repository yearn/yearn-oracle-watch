import React from 'react'
import { render, screen } from '@testing-library/react'
import { DebugProvider, useDebugContext } from '../DebugContext'

describe('DebugContext', () => {
  function TestComponent() {
    const { isEnabled, logLevel, enabledModules, logs, addLog, clearLogs, setLogLevel, toggleModule } = useDebugContext()
    return (
      <div>
        <span data-testid="enabled">{String(isEnabled)}</span>
        <span data-testid="logLevel">{logLevel}</span>
        <span data-testid="modules">{enabledModules.join(',')}</span>
        <span data-testid="logs">{logs.length}</span>
        <button onClick={() => setLogLevel('warn')}>Set Warn</button>
        <button onClick={() => toggleModule('performance')}>Toggle Performance</button>
        <button onClick={() => addLog({ id: '1', timestamp: Date.now(), level: 'info', module: 'api', source: 'test', message: 'msg' })}>Add Log</button>
        <button onClick={clearLogs}>Clear Logs</button>
      </div>
    )
  }

  it('provides default values and allows updates', () => {
    render(
      <DebugProvider>
        <TestComponent />
      </DebugProvider>
    )
    expect(screen.getByTestId('enabled').textContent).toMatch(/true|false/)
    expect(screen.getByTestId('logLevel').textContent).toBe('info')
    expect(screen.getByTestId('modules').textContent).toBe('api,hooks')
    expect(screen.getByTestId('logs').textContent).toBe('0')

    screen.getByText('Set Warn').click()
    expect(screen.getByTestId('logLevel').textContent).toBe('warn')

    screen.getByText('Toggle Performance').click()
    expect(screen.getByTestId('modules').textContent).toContain('performance')

    screen.getByText('Add Log').click()
    expect(screen.getByTestId('logs').textContent).toBe('1')

    screen.getByText('Clear Logs').click()
    expect(screen.getByTestId('logs').textContent).toBe('0')
  })
})
