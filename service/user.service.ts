import db from '@/data/mockDB'
import { UserRepo } from '@/repository/user.repo';

export class UserService {
    private userRepo = new UserRepo;

    // getUserFromId = (id: number) => {
    //     const user = db.users.find((u) => u.id === id ? u : null)
    //     if(!user)
    //         throw('user not found'); 
    //     return user       
    // };

    async getUserSubscriptions(id: number) {
        const subs = await this.userRepo.getSubscriptions(id);
        return subs
    };

    async getUserInfo(id: number) {
        const user = await this.userRepo.getUserById(id);
        
        return user
    };
}