'use client'

import { useState, useEffect, SubmitEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css'
import { CreateUserDTO, UserDTO } from "@/dto/user.dto";
import Topic from "@/components/topic";
import { userService } from "@/service/user.service";
import { authService } from "@/service/auth.service";
import { topicService } from "@/service/topic.service";
import { TopicDTO } from "@/dto/topic.dto";

export const Profile = () => {
    const router = useRouter();
    const [isAuth,setIsAuth] = useState<boolean>(false);
    const [user,setUser] = useState<UserDTO | null>(null);
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<CreateUserDTO>({
        username: '',
        email: '',
        password: '',
    });
    const [topics, setTopics] = useState<TopicDTO[]>([]);

    useEffect(() => {
        const auth = authService.isAuthenticated();
        setIsAuth(auth);
        if (!auth) router.push('/');
        else {
            const currentUser = authService.getCurrentUser();
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
        const userInfo = userService.getUserFromId(user.id);
        setFormData({
            username: user.username,
            email: user.email,
            password: userInfo.password,
        });

        const subs = userService.getUserSubscriptions(user.id);
        const t: TopicDTO[] = subs.map((s) => topicService.getTopicFromId(s));
        setTopics(t);
   
    },[user])
    
    const handleChange = (e: ChangeEvent & {target: HTMLInputElement}): void => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: SubmitEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // await authService.register(formData);
            router.push('/home');
        } catch (err: any) {
            setError(err.response.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

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
        <div className={styles.errorContainer}>
            <div className={styles.error}>
                {error}
            </div>   
        </div> )
    } 

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>

                <h2 className={styles.title}>
                    Profil utilisateur
                </h2>

                {error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-cy="register_error">
                    {error}
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
                <h2 className={styles.title}>
                    Abonnements
                </h2>

                <div className={styles.subscriptionsContainer}>
                {topics.map((topic) =>
                    <Topic key={topic.id} title={topic.name} description={topic.description} subscribed={true} profile={true} />
                )}
                </div>
            </div>
        </div>
    );
};

export default Profile;