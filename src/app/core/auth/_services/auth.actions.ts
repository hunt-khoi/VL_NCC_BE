import { Action } from '@ngrx/store';

export enum AuthActionTypes {
    Login = '[Login] Action',
    Logout = '[Logout] Action',
    Register = '[Register] Action'
}

export class Login implements Action {
    readonly type = AuthActionTypes.Login;
    constructor(public payload: { authToken: string }) { }
}

export class Logout implements Action {
    readonly type = AuthActionTypes.Logout;
}

export class Register implements Action {
    readonly type = AuthActionTypes.Register;
    constructor(public payload: { authToken: string }) { }
}

export type AuthActions = Login | Logout | Register;