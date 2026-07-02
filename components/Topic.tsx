import styles from './Topic.module.css'

export default function Topic({ title, description }: { title: string, description: string }) {
    const subscribed = false;
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.description}>{description}</div>
            <div className={styles.buttonContainer} >
                <button disabled={subscribed} className={styles.button} >
                    {subscribed ? 'Déjà abonné' : 'S\'abonner'}
                </button>
            </div>
        </div>
    )
}