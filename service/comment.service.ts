import db from '@/data/mockDB'

export const commentService = {
    getCommentFromId(id: number) {
        const comment = db.comments.find((c) => c.id === id ? c : null)
        if(!comment)
            throw('comment not found'); 
        return comment
    },
}