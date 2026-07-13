'use client'

import { FullPostDTO } from "@/dto/post.dto";
import { AuthResponse } from "@/dto/user.dto";
import { authClientService } from "@/service/auth.client.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, SubmitEvent, useEffect, useState } from "react";
import Comment from "./comment";
import Back from "./back";
import styles from './fullPost.module.css'

export default function FullPostComponent({ post_id }: { post_id: number }) {
    const [isAuth,setIsAuth] = useState<boolean>(false);
    const [user,setUser] = useState<AuthResponse | null>(null);
    const [post,setPost] = useState<FullPostDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [newCommentError, setNewCommentError] = useState<string>('');
    const [newComment, setNewComment] = useState<string>('');

    const router = useRouter();

    useEffect(() => {
        const auth = authClientService.isAuthenticated();
        setIsAuth(auth);
        if (!auth) router.push('/');
        else {
            const currentUser = authClientService.getCurrentUser();
            if (!currentUser){ 
                setError("Utilisateur inconnu");
            }else{ 
                setUser(currentUser);
            }
        }
    }, [router]);

    useEffect(() => {
        fetchPost();
    }, [user]);

    const fetchPost = () => {
        if (!user) return;
        try {
            fetch('/api/posts/'+post_id, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
            .then(res => res.json())
            .then(setPost)
            .then(() => setLoading(false));
        } catch {
            setError("Erreur lors du chargement de l'article");
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent & { target: HTMLTextAreaElement }) => {
        setNewComment(e.target.value);
        setNewCommentError('');
    }

    const handleSubmit = async (e: SubmitEvent): Promise<void> => {
        if (!user) return;
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await fetch('/api/posts/'+post_id+'/comment', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    post_id, text: newComment
                })
            })
            if (!result.ok) {
                const errorData = await result.json().catch(() => null);
                const message = errorData.message;
                throw new Error(message);
            }else{
                fetchPost();
            }
        } catch (err: any) {
            setNewCommentError(err.message || 'Comment creation failed');
        } finally {
            setLoading(false);
        }
    };

    if(loading){
        return (
        <div className={"container"}>
            <div className={"styles.loading"}>
                Chargement...
            </div>   
        </div> )
    }

    if(error){
        return (
        <div className="container">
            <div className={styles.error}>
                {error}
            </div>   
        </div> )
    }

    if (!post) {
        return (
            <div className="container">
                <h1>Article non trouvé</h1>
                <p>Cet article n'existe pas ou a été supprimé.</p>
            </div>
        )
    }
    
    return (
        <div className={styles.mainContainer}>
            <Back url='/home' />

            <h2 className={styles.title} >{post.title}</h2>
            <div className={styles.postHeader}>
                <span>{new Date(post.date).toLocaleDateString()}</span>
                <span>{post.users.username}</span>
                <span>{post.topics.name}</span>
            </div>
            <div className={styles.text}>
                {post.text}
            </div>
            <hr className={styles.hr}/>
            <h3 className={styles.commentTitle}>Commentaires</h3>
            {post.comments.map((c) => 
                <Comment author={c.users.username} text={c.text} key={c.id} />
            )}
            {newCommentError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-cy="error">
                {newCommentError}
            </div>
            ) : null}
            <form onSubmit={handleSubmit} 
            className={styles.createCommentContainer}>
                <textarea 
                className={styles.textarea} 
                placeholder='Écrivez ici votre commentaire'
                onChange={handleChange}
                rows={4}
                ></textarea>
                <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer"
                >
                    <Image 
                        src="/images/sendIcon.png"
                        alt="send"
                        width={48}
                        height={48}
                        className={styles.sendIcon}
                    />
                </button>
            </form>
        </div>
    )
}