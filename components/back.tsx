import Link from 'next/link'
import Image from 'next/image'
import styles from './back.module.css'

export default function Back({ url } : { url: string }) {
    return (
        <Link href={url} className={url === '/' ? styles.back : styles.back_alt}>
            <Image
                src='/images/arrow.png'
                alt='retour'
                width={41}
                height={23}
                className={styles.arrow}
            />
        </Link>
    )
}