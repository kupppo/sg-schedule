import { Inter } from '@next/font/google'
import type { PropsWithChildren } from 'react'
import styles from './layout.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'

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

const Menu = () => {
  const router = useRouter()
  const pathname = router?.pathname
  return (
    <menu className={styles['menu']}>
      <ul>
        {MENU_ITEMS.map((item) => {
          const active = pathname.includes(item.href)
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

const Layout = (props: PropsWithChildren) => (
  <div className={inter.className}>
    <header className={`${styles['header']} container`}>
      <h1>
        Super Metroid Choozo Randomizer
        <br />
        2022 Schedule
      </h1>
      <Menu />
    </header>
    <main className="container">
      {props.children}
    </main>
  </div>
)

export default Layout
