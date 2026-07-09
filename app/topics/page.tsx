'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Topic from '@/components/topic';
import { AuthResponse } from '@/dto/user.dto';
import { authClientService } from '@/service/auth.client.service';
import { TopicDTO } from '@/dto/topic.dto';

export const Topics = () => {
  const [isAuth,setIsAuth] = useState<boolean>(false);
  const [user,setUser] = useState<AuthResponse | null>(null);
  const [topics,setTopics] = useState<TopicDTO[]>([]);
  const [subs,setSubs] = useState<number[]>([]);
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

    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${user.token}` };

        const [topicsRes, subsRes] = await Promise.all([
          fetch('/api/topics', { headers }),
          fetch('/api/user/subscriptions', { headers })
        ]);

        if (!topicsRes.ok || !subsRes.ok) {
          throw new Error('Erreur chargement');
        }

        const topicsData = await topicsRes.json();
        const subsData = await subsRes.json();

        setTopics(topicsData);
        setSubs(subsData.map((sub: TopicDTO) => sub.id)); 
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className={styles.container}>
      {topics.map((topic) => 
        <Topic key={topic.id} title={topic.name} description={topic.description} subscribed={subs.includes(topic.id)} profile={false} />
      )}
    </div>
  );
};

export default Topics;
