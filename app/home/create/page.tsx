'use client'

import { useState, useEffect, SubmitEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css'
import { CreatePostDTO } from "@/dto/post.dto";
import Back from "@/components/back";
import { authClientService } from "@/service/auth.client.service";
import { AuthResponse } from "@/dto/user.dto";
import { TopicDTO } from "@/dto/topic.dto";

export const Create = () => {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [createError, setCreateError] = useState<string>('');
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [user,setUser] = useState<AuthResponse | null>(null);
    const [topics,setTopics] = useState<TopicDTO[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<CreatePostDTO>({
        topic: '',
        title: '',
        text: '',
    });

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
        const loadTopics = async () => {
            try {
            const res = await fetch('/api/topics', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (!res.ok) throw new Error('Erreur lors du chargement des thèmes');
            const data = await res.json();
            setTopics(data);
            } catch(error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadTopics();
        // try {
        //     fetch('/api/topics', {
        //         headers: {
        //             'Authorization': `Bearer ${user.token}`
        //         }
        //     })
        //     .then(res => res.json())
        //     .then(setTopics)
        //     setLoading(false);
        // } catch {
        //     setError('Erreur lors du chargement des articles');
        //     setLoading(false);
        // }
    }, [user]);

    const handleChange = (e: ChangeEvent & {target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement}): void => {
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
            const result = await fetch('/api/posts', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            })
            if (!result.ok) {
                const errorData = await result.json().catch(() => null);
                const message = errorData.message;
                throw new Error(message);
            }else{
                setShowSuccess(true);
            }
        } catch (err: any) {
            setCreateError(err.message || 'Creation failed');
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
            {showSuccess && (
            <div className={styles.popup}>
                <div className={styles.popupContent}>
                    <p>Article créé !</p>
                    <button 
                    onClick={() => setShowSuccess(false)}
                    className="button" >Fermer</button>
                </div>
            </div>
            )}
            <Back url='/home' />

            <h2 className="title_2">
                Créer un nouvel article
            </h2>

            {createError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-cy="error">
                {createError}
            </div>
            ) : null}

            <form onSubmit={handleSubmit} className={styles.form}>
                <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                        <option value='' key={0} >Sélectionnez un thème</option>
                    {topics.map((t) => (
                        <option value={t.id} key={t.id}>{t.name}</option>
                    ))}    
                </select>

                <input
                name="title"
                value={formData.title}
                placeholder="Titre de l'article"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />

                <textarea
                name="text"
                value={formData.text}
                placeholder="Contenu de l'article"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                rows={4}
                />

                <button
                    data-cy="submit"
                    type="submit"
                    disabled={loading}
                    className="button"
                >
                    {loading ? 'Création en cours...' : 'Créer'}
                </button>
            </form>
        </div>
    );
};

export default Create;