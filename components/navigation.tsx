'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import styles from './navigation.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { authService } from '@/service/auth.service'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  if(pathname === '/') return 

  const openMenu = () => {
    setIsOpen(true)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const logout = () => {
    authService.logout();
    router.push('/')
  }

  return (

   <nav className={(pathname !== '/login' && pathname !== '/register') ? styles.nav : styles.nav_alt }>
      <div className={styles.container}>
        <Image
            src="/images/logo.png"
            alt="logo MDD"
            width={412}
            height={238}
            className={styles.logo}
        />

        {/* Bouton burger pour mobile */}
        {(pathname !== '/login' && pathname !== '/register') ? (
            <div>
            <div className={isOpen ? styles.overlay : styles.hide } onClick={closeMenu}></div>
            <div>
                <button 
                    className={isOpen ? styles.hide : styles.burger }
                    onClick={openMenu}
                    aria-label="Menu"
                >
                    <span className={isOpen ? styles.burgerOpen : ''}></span>
                    <span className={isOpen ? styles.burgerOpen : ''}></span>
                    <span className={isOpen ? styles.burgerOpen : ''}></span>
                </button>


                <ul className={`${styles.menu} ${isOpen ? styles.menuOpen : ''}`}>
                    <li className={styles.logout} onClick={logout}>Se déconnecter</li>
                    <li>
                        <Link 
                            href="/home" 
                            className={pathname === '/home' ? `${styles.link} ${styles.active}` : styles.link}
                            >
                            Articles
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/topics" 
                            className={pathname === '/topics' ? `${styles.link} ${styles.active}` : styles.link}
                        >
                            Thèmes
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/profile" 
                            className={styles.userIcon}
                            >
                            <Image
                                src={pathname === '/profile' ? "/images/userIcon_active.png" : "/images/userIcon.png"}
                                alt="profil"
                                width={32}
                                height={32}
                                className={styles.profile}
                            />
                        </Link>
                    </li>
                </ul>
                </div>
                </div>
            ) : null }
     </div>
   </nav>
 )
}