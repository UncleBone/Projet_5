import styles from './comment.module.css'

export default function Comment({ author, text }: { author: string, text: string }) {
    return (
        <div className={styles.container}>
            <div className={styles.author}>{author}</div>
            <div className={styles.text}>{text}</div>
        </div>
    )
}