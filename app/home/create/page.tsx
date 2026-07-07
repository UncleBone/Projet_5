'use client'

import { useState, useEffect, SubmitEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css'
// import { userService } from "@/service/user.service";
import { authService } from "@/service/auth.service";
import { CreatePostDTO } from "@/dto/post.dto";
import { topicService } from "@/service/topic.service";
import Back from "@/components/back";

export const Create = () => {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const auth = authService.isAuthenticated();
        setIsAuth(auth);
        if (!auth) router.push('/');
    }, [router]);


    const [formData, setFormData] = useState<CreatePostDTO>({
        topic: '',
        title: '',
        text: '',
    });

    const topics = topicService.getAllTopics();

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

        // try {
        //     // await authService.register(formData);
        //     router.push('/home');
        // } catch (err: any) {
        //     setError(err.response.message || 'Registration failed');
        // } finally {
        //     setLoading(false);
        // }
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
            <Back url='/home' />

            <h2 className={styles.title}>
                Créer un nouvel article
            </h2>

            {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-cy="error">
                {error}
            </div>
            ) : null}

            <form onSubmit={handleSubmit} className={styles.form}>
                <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                        <option value='' key={0} >Sélectionnez un thème</option>
                    {topics.map((t) => (
                        <option value={t.id} key={t.id}>{t.name}</option>
                    ))}    
                </select>

                <input
                value={formData.title}
                placeholder="Titre de l'article"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />

                <textarea
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