import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{ 
		path: 'auth', 
		loadChildren: () => import('../app/views/pages/auth/auth.module').then(m => m.AuthModule) 
	},
	{ 
		path: 'viewer', 
		loadChildren: () => import('../app/views/pages/nguoi-co-cong/file-viewer/file-viewer.module').then(m => m.FileViewerModule) 
	},
	{ 
		path: '', 
		loadChildren: () => import('../app/views/theme/theme.module').then(m => m.ThemeModule) 
	},
	{ 
		path: '**', 
		redirectTo: 'error/403', 
		pathMatch: 'full' 
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	exports: [RouterModule]
})
export class AppRoutingModule {
}