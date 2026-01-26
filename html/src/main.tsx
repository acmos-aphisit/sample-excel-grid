import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfirmDialog } from './components/common/index.tsx'

import './index.css'
// import App from './App.tsx'
import Router from './router.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // フォーカス外れた時リーレンダリングはオフにする
      refetchOnWindowFocus: false, // デフォルト：falseに設定
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <Router />
      <ConfirmDialog />
    </StrictMode>
  </QueryClientProvider>
)