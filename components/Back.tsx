import Link from 'next/link'
import Image from 'next/image'
import styles from './Back.module.css'

export default function Back() {
    return (
        <Link href='/' className={styles.back}>
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