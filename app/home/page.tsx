'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react";
import styles from './page.module.css'
import { AuthService } from '@/service/auth.service';
import Post from '@/components/post';
import { userService } from '@/service/user.service';
import Link from 'next/link'
import { PostDTO } from '@/dto/post.dto';
import { PostService } from '@/service/post.service';
import { UserDTO } from '@/dto/user.dto';

export const Home = () => {
    const router = useRouter();
    const [isAuth,setIsAuth] = useState<boolean>(false);
    const [user,setUser] = useState<UserDTO | null>(null);
    const [posts,setPosts] = useState<PostDTO[]>([]);
    const [sortBy, setSortBy] = useState<string>('desc');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // const auth = AuthService.isAuthenticated();
        // setIsAuth(auth);
        // if (!auth) router.push('/');
        // else {
        //     const currentUser = AuthService.getCurrentUser();
        //     if (!currentUser){ 
        //         setError("Utilisateur inconnu");
        //         setLoading(false);
        //     }else{ 
        //         setUser(currentUser);
        //     }
        // }
    }, [router]);

    useEffect(() => {
        if (!user) return;
        try {
            fetch('/api/posts')
            .then(res => res.json())
            .then(setPosts)
            setLoading(false);
        } catch {
            setError('Erreur lors du chargement des articles');
            setLoading(false);
        }
    }, [user]);

    const sortFunction = (a: PostDTO,b: PostDTO) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortBy === 'asc' ? diff : -diff; 
    }

    const sortedPosts = [...posts].sort(sortFunction);

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
        <div className="bg-background">
            <div className={styles.header}>
                <Link href='/home/create'>
                    <button
                        data-cy="create"
                        className={styles.button}
                    >
                        Créer un article
                    </button>
                </Link>
                <div className={styles.sortContainer}>
                    <label htmlFor="sort" className={styles.sortLabel}>Trier ↓</label>
                    <select id="sort" onChange={(e) => setSortBy(e.target.value)} >
                        <option value="desc" >Du plus récent au plus ancien</option>
                        <option value="asc" >Du plus ancien au plus récent</option>
                    </select>
                </div>
            </div>

            {sortedPosts.length === 0 ? 
                <div className={styles.empty} >Aucun article pour le moment</div>
            :
                <div className={styles.container} >
                    {sortedPosts.map((post) => {
                        const author = userService.getUserFromId(post.author);
                        return (
                            <Link href={'/home/'+post.id} key={post.id} >
                                <Post title={post.title} text={post.text} date={new Date(post.date).toLocaleDateString()} author={author.username} />
                            </Link>
                            )
                        }
                    )}
                </div>
            }
        
        </div>
    );
};

export default Home;
