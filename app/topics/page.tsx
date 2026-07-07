'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { authService } from '@/service/auth.service';
import db from '@/data/mockDB'
import Topic from '@/components/topic';
import { userService } from '@/service/user.service';
import { UserDTO } from '@/dto/user.dto';

export const Topics = () => {
  const [isAuth,setIsAuth] = useState<boolean>(false);
  const [user,setUser] = useState<UserDTO | null>(null);
  const [subs,setSubs] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const router = useRouter();

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
    if (!user) return;
    try {
        const fetchedSubs = userService.getUserSubscriptions(user.id);
        setSubs(fetchedSubs);
        setLoading(false);
    } catch {
        setError('Erreur lors du chargement des abonnements');
        setLoading(false);
    }
  }, [user]);

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

  const topics = db.topics;
  return (
    <div className={styles.container}>
      {topics.map((topic) => 
        <Topic key={topic.id} title={topic.name} description={topic.description} subscribed={subs.includes(topic.id)} profile={false} />
      )}
    </div>
  );
};

export default Topics;
