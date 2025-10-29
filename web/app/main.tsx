import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app.tsx'
import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { CurrencyProvider } from './context/currency-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          refreshInterval: 0,
          revalidateIfStale: false,
          revalidateOnReconnect: false,
          revalidateOnMount: undefined,
        }}
      >
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </SWRConfig>
    </BrowserRouter>
  </StrictMode>,
)
