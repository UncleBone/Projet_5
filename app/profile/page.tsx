'use client'

import { useState, useEffect, SubmitEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css'
import { AuthResponse, CreateUserDTO, UserDTO } from "@/dto/user.dto";
import Topic from "@/components/topic";
import { TopicDTO } from "@/dto/topic.dto";
import { authClientService } from "@/service/auth.client.service";

export const Profile = () => {
    const router = useRouter();
    const [isAuth,setIsAuth] = useState<boolean>(false);
    const [user,setUser] = useState<AuthResponse | null>(null);
    const [error, setError] = useState<string>('');
    const [updateError, setUpdateError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<CreateUserDTO>({
        username: '',
        email: '',
        password: '',
    });
    const [topics, setTopics] = useState<TopicDTO[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const auth = authClientService.isAuthenticated();
        setIsAuth(auth);
        if (!auth) router.push('/');
        else {
            const currentUser = authClientService.getCurrentUser();
            if (!currentUser){ 
                setError("Utilisateur inconnu");
                setLoading(false);
            }else{ 
                setUser(currentUser);
            }
        }
    }, [router]);

    useEffect(() => {
        if(!user) return
        setFormData({
            username: user.username,
            email: user.email,
            password: "",
        });
        try{
            fetch('/api/user/subscriptions', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            .then(res => res.json())
            .then(setTopics)
            setLoading(false);
        } catch {
            setError('Erreur lors du chargement des abonnements');
            setLoading(false);
        }
    },[user])
    
    const handleChange = (e: ChangeEvent & {target: HTMLInputElement}): void => {
        setUpdateError('');
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: SubmitEvent): Promise<void> => {
        if(!user) return
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await fetch('/api/user', {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            })
            if (!result.ok) {
                const errorData = await result.json().catch(() => null);
                const message = errorData.message;
                throw new Error(message);
            }else{
                const data = await result.json();
                authClientService.login(data);
                setShowSuccess(true);
            }
        } catch (err: any) {
            setUpdateError(err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (t_id: number) => async () => {
        if (!user) return;
        try{
            const result = await fetch('/api/user/subscriptions/'+t_id, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            if(result.ok){
                const newTopics = topics.filter(topic => topic.id !== t_id);
                setTopics(newTopics);
            }
        }catch(error: any){
            setError(error.message || "Erreur serveur")
        }
    }

    if(loading){
        return (
        <div className={styles.errorContainer}>
            <div className={styles.loading}>
                Chargement...
            </div>   
        </div> )
    }

    if(error){
        return (
        <div className="container">
            <div className="error">
                {error}
            </div>   
        </div> )
    } 

    return (
        <div className={styles.container}>
            {showSuccess && (
            <div className={styles.popup}>
                <div className={styles.popupContent}>
                    <p>Mise à jour réussie !</p>
                    <button 
                    onClick={() => setShowSuccess(false)}
                    className="button" >Fermer</button>
                </div>
            </div>
            )}
            <div className={styles.formContainer}>

                <h2 className="title_2">
                    Profil utilisateur
                </h2>

                {updateError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-cy="register_error">
                    {updateError}
                </div>
                ) : null}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="mb-4">
                        <input
                        id="username_input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                        required
                        />
                    </div>

                    <div className="mb-4">
                        <input
                        id="email_input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                        required
                        />
                    </div>

                    <div className="mb-6">
                        <input
                        id="password_input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                        required
                        minLength={8}
                        />
                    </div>

                    <button
                        data-cy="submit"
                        type="submit"
                        disabled={loading}
                        className="button"
                    >
                        {loading ? 'Sauvegarde en cours...' : 'Sauvegarder'}
                    </button>
                </form>
            </div>
            <hr className={styles.hr} />
            <div className={styles.container}>
                <h2 className="title_2">
                    Abonnements
                </h2>

                <div className={styles.subscriptionsContainer}>
                {topics.map((topic) =>
                    <Topic 
                    key={topic.id} 
                    title={topic.name} 
                    description={topic.description} 
                    subscribed={true} 
                    profile={true} 
                    handleClick={handleClick(topic.id)}/>
                )}
                </div>
            </div>
        </div>
    );
};

export default Profile;