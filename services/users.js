import Users from "../database/models/users.model.js";


export class UserService {

    async getUser(data) {
        return await Users.findOne(data)
    }

    async saveUser(data) {
        return await Users.create(data)
    }
}