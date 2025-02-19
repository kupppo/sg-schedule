import 'normalize.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
