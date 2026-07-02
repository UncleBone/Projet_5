'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { authService } from '@/service/auth.service';
import db from '@/data/mockDB'
import Topic from '@/components/Topic';

export const Topics = () => {
  const router = useRouter();
  const isAuth = authService.isAuthenticated();
  if(!isAuth){
      router.push('/');
  }
  const user = authService.getCurrentUser();

  const topics = db.topics;
  return (
    <div className={styles.container}>
      {topics.map((topic) => 
        <Topic key={topic.id} title={topic.name} description={topic.description} />
      )}
    </div>
  );
};

export default Topics;
