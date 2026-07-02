'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { authService } from '@/service/auth.service';
import db from '@/data/mockDB'
import Post from '@/components/Post';
import { userService } from '@/service/user.service';

export const Home = () => {
    const router = useRouter();
    const isAuth = authService.isAuthenticated();
    if(!isAuth){
        router.push('/');
    }

    const posts = db.posts;
    // const posts = [];
    // console.log(posts)

    return (
        <div className="bg-background">
            <div className={styles.header}>
                <button
                    data-cy="create"
                    className={styles.button}
                >
                    Créer un article
                </button>
                <div className={styles.sortContainer}>
                    <label htmlFor="sort" className={styles.sortLabel}>Trier ↓</label>
                    <select id="sort">
                        <option value="desc" >Du plus récent au plus ancien</option>
                        <option value="asc" >Du plus ancien au plus récent</option>
                    </select>
                </div>
            </div>

            {posts.length === 0 ? 
                <div className={styles.empty} >Aucun article pour le moment</div>
            :
                <div className={styles.container} >
                    {posts.map((post) => {
                        const auth = userService.getUserFromId(post.author);
                        return <Post key={post.id} title={post.title} text={post.text} date={post.date.toISOString()} author={auth.username} />
                        }
                    )}
                </div>
            }
        
        </div>
    );
};

export default Home;
