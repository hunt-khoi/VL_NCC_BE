import { routerReducer } from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../../environments/environment';

export interface AppState { }

export const reducers: ActionReducerMap<AppState> = { router: routerReducer };
export const metaReducers: Array<MetaReducer<AppState>> = !environment.production ? [storeFreeze] : [];