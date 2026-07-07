import styles from './post.module.css'

export default function Post({ title, text, date, author }: { title: string, text: string, date: string, author: string }) {
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.header}>
                <span className={styles.date}>{date}</span>
                <span className={styles.author}>par {author}</span>
            </div>
            <div className={styles.text}>{text}</div>
        </div>
    )
}