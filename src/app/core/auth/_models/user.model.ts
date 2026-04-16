import { BaseModel } from '../../_base/crud';

export class User extends BaseModel {
    id: number | undefined;
    username: string | undefined;
    password: string | undefined;
    email: string | undefined;
    accessToken: string | undefined;
    refreshToken: string | undefined;
    roles: number[] | undefined;
    pic: string | undefined;
    fullname: string | undefined;
    occupation: string | undefined;
	companyName: string | undefined;
	phone: string | undefined;

    clear(): void {
        this.id = undefined;
        this.username = '';
        this.password = '';
        this.email = '';
        this.roles = [];
        this.fullname = '';
        this.accessToken = 'access-token-' + Math.random();
        this.refreshToken = 'access-token-' + Math.random();
        this.pic = './assets/media/users/default.jpg';
        this.occupation = '';
        this.companyName = '';
        this.phone = '';
    }
}