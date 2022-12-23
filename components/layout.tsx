import { Inter } from '@next/font/google'
import type { PropsWithChildren, ReactNode } from 'react'
import styles from './layout.module.css'
import Link from 'next/link'

const MENU_ITEMS = [
  {
    title: 'Upcoming',
    href: '/',
  },
  {
    title: 'Archive',
    href: '/archive',
  },
]

const Menu = ({ activeHref = '/' }) => {
  return (
    <menu className={styles['menu']}>
      <ul>
        {MENU_ITEMS.map((item) => {
          const active = activeHref === item.href
          return (
            <li key={item.href} className={active ? styles['active'] : ''}>
              <Link href={item.href}>
                {item.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </menu>
  )
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export type LayoutProps = {
  children: ReactNode
  activeHref?: string
}

const Layout = ({ activeHref = '/', children }: LayoutProps) => (
  <div className={inter.className}>
    <header className={`${styles['header']} container`}>
      <h1>
        Super Metroid Choozo Randomizer
        <br />
        2022 Schedule
      </h1>
      <Menu activeHref={activeHref} />
    </header>
    <main className="container">
      {children}
    </main>
  </div>
)

export default Layout
