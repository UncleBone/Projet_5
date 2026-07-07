// 'use client'

import { postService } from '@/service/post.service';
import { userService } from '@/service/user.service';
import { topicService } from '@/service/topic.service';
import styles from './page.module.css'
import Back from '@/components/back';
import { commentService } from '@/service/comment.service';
import Comment from '@/components/comment';
import Image from 'next/image'

export default async function FullPost({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const post = postService.getPostFromId(Number(slug));

    if (!post) {
        return (
            <div className="container">
                <h1>Article non trouvé</h1>
                <p>Cet article n'existe pas ou a été supprimé.</p>
            </div>
        )
    }
    const author = userService.getUserFromId(post.author);
    const topic = topicService.getTopicFromId(post.topic);
    const comments = postService.getPostComments(post.id);
    const commentData = comments.map((c_id) => (
        commentService.getCommentFromId(c_id)
    ))
    
    return (
        <div className={styles.container}>
            <Back url='/home' />

            <h2 className={styles.title} >{post.title}</h2>
            <div className={styles.postHeader}>
                <span>{post.date.toLocaleDateString()}</span>
                <span>{author.username}</span>
                <span>{topic.name}</span>
            </div>
            <div className={styles.text}>
                {post.text}
            </div>
            <hr className={styles.hr}/>
            <h3 className={styles.commentTitle}>Commentaires</h3>
            {commentData.map((c) => {
                const author = userService.getUserFromId(c.u_id);
                return <Comment author={author.username} text={c.text} key={c.id} />
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
