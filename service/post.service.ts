import db from '@/data/mockDB'

export const postService = {
    getPostFromId(id: number) {
        const post = db.posts.find((p) => p.id === id ? p : null)
        if(!post)
            throw('post not found'); 
        return post
    },

    getPostComments(id: number) {
        const comments = db.comments;
        return comments.reduce<number[]>((acc,c) => {
            if(c.p_id === id) {
                acc.push(c.id)
            }
            return acc
        }, [])
    },

    getPostsByTopic(t_id: number) {
        const posts = db.posts.reduce<number[]>((acc,p) => {
            if(p.topic === t_id) {
                acc.push(p.id)
            }
            return acc
        }, [])

        return posts
    }
}