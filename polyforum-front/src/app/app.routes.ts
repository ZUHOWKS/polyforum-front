import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { PostsComponent } from './components/posts/posts.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { PageLayoutComponent } from './components/page-layout/page-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PageLayoutComponent,
    children: [
      { path: '', redirectTo: '/posts', pathMatch: 'full' },
      { path: 'posts', component: PostsComponent },
      { path: 'posts/:id', component: PostDetailComponent },
    ]
  },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '/posts' }
];
