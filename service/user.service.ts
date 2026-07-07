import db from '@/data/mockDB'

export const userService = {
    getUserFromId: (id: number) => {
        const user = db.users.find((u) => u.id === id ? u : null)
        if(!user)
            throw('user not found'); 
        return user       
    },

    getUserSubscriptions: (id: number) => {
        const sub = db.subscriptions;
        return sub.reduce<number[]>((acc,s) => {
            if(s.u_id === id) {
                acc.push(s.t_id)
            }
            return acc
        }, [])
    },

    // getUserPassword: (id: number) => {
    //     const user 
    // }
}