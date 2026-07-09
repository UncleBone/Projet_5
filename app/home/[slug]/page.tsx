'use client'

import styles from './page.module.css'
import Back from '@/components/back';
import { commentService } from '@/service/comment.service';
import Comment from '@/components/comment';
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { AuthResponse } from '@/dto/user.dto';
import { TopicDTO } from '@/dto/topic.dto';
import { useRouter } from 'next/router';
import { authClientService } from '@/service/auth.client.service';
import { PostDTO } from '@/dto/post.dto';

export default async function FullPost({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const [isAuth,setIsAuth] = useState<boolean>(false);
    const [user,setUser] = useState<AuthResponse | null>(null);
    const [topics,setTopics] = useState<TopicDTO[]>([]);
    const [subs,setSubs] = useState<number[]>([]);
    const [post,setPost] = useState<PostDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const router = useRouter();

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
        if (!user) return;
        try {
            fetch('/api/posts/'+slug, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
            })
            .then(res => res.json())
            .then(setPost)
            setLoading(false);
            console.log(post)
        } catch {
            setError("Erreur lors du chargement de l'article");
            setLoading(false);
        }
    }, [user]);

    // const post = postService.getPostFromId(Number(slug));

    if(loading){
        return (
        <div className={styles.errorContainer}>
            <div className={styles.loading}>
                Chargement...
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
        <div className={styles.container}>
            <Back url='/home' />

            <h2 className={styles.title} >{post.title}</h2>
            <div className={styles.postHeader}>
                <span>{post.date.toLocaleDateString()}</span>
                <span>{post.users.username}</span>
                <span>{post.topics.name}</span>
            </div>
            <div className={styles.text}>
                {post.text}
            </div>
            <hr className={styles.hr}/>
            <h3 className={styles.commentTitle}>Commentaires</h3>
            {post.comments.map((c) => {
                // const author = userService.getUserFromId(c.u_id);
                return <Comment author={"author.username"} text={c.text} key={c.id} />
                }
            )}
            <div className={styles.createCommentContainer}>
                <textarea 
                className={styles.textarea} 
                placeholder='Écrivez ici votre commentaire'
                rows={4}
                ></textarea>
                <Image 
                    src="/images/sendIcon.png"
                    alt="send"
                    width={48}
                    height={48}
                    className={styles.sendIcon}
                />
            </div>
        </div>
    )
}
