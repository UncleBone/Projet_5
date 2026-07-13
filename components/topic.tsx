import styles from './topic.module.css'

export default function Topic({ title, description, subscribed, profile, handleClick }: 
    { title: string, description: string, subscribed: boolean, profile: boolean, handleClick: () => void }) {
    let buttonDisabled;
    let buttonText;
    if(profile){
        buttonText = "Se désabonner";
        buttonDisabled = false;
    }else{
        buttonText = subscribed ? 'Déjà abonné' : 'S\'abonner';
        buttonDisabled = subscribed;
    }
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.description}>{description}</div>
            <div className={styles.buttonContainer} >
                <button 
                disabled={buttonDisabled} 
                className={buttonDisabled ? "button_disabled" : "button"} 
                onClick={handleClick}
                 >
                    {buttonText}
                </button>
            </div>
        </div>
    )
}