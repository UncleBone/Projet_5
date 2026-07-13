import { RegisterDTO, RegisterSchema } from '@/dto/user.dto';
import { generateToken } from '@/lib/jwt';
import { UserRepo } from '@/repository/user.repo';
import * as bcrypt from 'bcrypt'

export class UserService {
    private userRepo = new UserRepo;

    async getUserSubscriptions(id: number) {
        const subs = await this.userRepo.getSubscriptions(id);
        return subs
    };

    async getUserInfo(id: number) {
        const user = await this.userRepo.getUserById(id);
        
        return user
    };

    async addSubscription(userId: number, topicId: number) {
        await this.userRepo.addSubscription(userId,topicId)
    }

    async removeSubscription(userId: number, topicId: number) {
        await this.userRepo.removeSubscription(userId,topicId)
    }

    async update(userId: number, body: RegisterDTO) {
        const { username, email } = body;
        const pswd = body.password;

        const userByUsername = await this.userRepo.getUserByUsername(username);
        if(userByUsername && userByUsername.id !== userId){
            throw({ status: 400, message: "Ce nom d'utilisateur existe déjà" })
        }
        const userByEmail = await this.userRepo.getUserByEmail(email);
        if(userByEmail && userByEmail.id !== userId){
            throw({ status: 400, message: "Cet email existe déjà" })
        }
        const parsed = RegisterSchema.parse(body);

        const hashedPassword = await bcrypt.hash(pswd, 10);
        const { password, ...newUser } = await this.userRepo.updateUser(userId,{...parsed, password: hashedPassword});

        const token = generateToken(newUser);
        
        const response = {...newUser, token: token };
        
        return response
    }
}