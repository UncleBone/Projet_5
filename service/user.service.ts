import db from '@/data/mockDB'

export const userService = {
    getUserFromId: (id: number) => {
        const user = db.users.find((u) => u.id === id ? u : null)
        if(!user)
            throw('user not found'); 
        return user       
    }
}