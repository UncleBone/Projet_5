'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react";
import styles from './page.module.css'
import Post from '@/components/post';
import Link from 'next/link'
import { PostDTO } from '@/dto/post.dto';
import { AuthResponse, UserDTO } from '@/dto/user.dto';
import { authClientService } from '@/service/auth.client.service';

export const Home = () => {
    const router = useRouter();
    const [isAuth,setIsAuth] = useState<boolean>(false);
    const [user,setUser] = useState<AuthResponse | null>(null);
    const [posts,setPosts] = useState<PostDTO[]>([]);
    const [sortBy, setSortBy] = useState<string>('desc');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const auth = authClientService.isAuthenticated();
        console.log('auth',auth)
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
        const loadPosts = async () => {
            try {
            const res = await fetch('/api/posts', {
                headers: {
                'Authorization': `Bearer ${user.token}`
                }
            });
            if (!res.ok) throw new Error('Erreur lors du chargement des article');
            const data = await res.json();
            setPosts(data);
            } catch(error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, [user]);

    const sortFunction = (a: PostDTO,b: PostDTO) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortBy === 'asc' ? diff : -diff; 
    }

    const sortedPosts = posts.length > 0 ? [...posts].sort(sortFunction) : [];

    if(loading){
        return (
        <div className="container">
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
        <div className="bg-background">
            <div className={styles.header}>
                <Link href='/home/create'>
                    <button
                        data-cy="create"
                        className="button"
                    >
                        Créer un article
                    </button>
                </Link>
                <div className={styles.sortContainer}>
                    <label htmlFor="sort" className={styles.sortLabel}>Trier ↓</label>
                    <select id="sort" onChange={(e) => setSortBy(e.target.value)} className='cursor-pointer'>
                        <option value="desc" >Du plus récent au plus ancien</option>
                        <option value="asc" >Du plus ancien au plus récent</option>
                    </select>
                </div>
            </div>

            {sortedPosts.length === 0 ? 
                <div className={styles.empty} >Aucun article pour le moment</div>
            :
                <div className={styles.postContainer} >
                    {sortedPosts.map((post) => {
                        return (
                            <Link href={'/home/'+post.id} key={post.id} >
                                <Post title={post.title} text={post.text} date={new Date(post.date).toLocaleDateString()} author={post.users.username} />
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
