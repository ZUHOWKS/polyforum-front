import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostsService, Post } from '../../services/posts.service';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsComponent implements OnInit {
  private router = inject(Router);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);

  // Signals for component state
  posts = signal<Post[]>([]);
  page = signal(1);
  totalPages = signal(1);
  isLoading = signal(false);
  errorMessage = signal('');
  isCreatingPost = signal(false);
  showCreateForm = signal(false);

  // Form state - using regular properties for two-way binding
  newPostTitle = '';
  newPostContent = '';

  // Computed values
  currentUser = computed(() => this.authService.currentUser());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  ngOnInit() {
    this.loadPosts();
  }

  toggleCreateForm() {
    this.showCreateForm.update(show => !show);
    this.errorMessage.set('');
    if (!this.showCreateForm()) {
      this.newPostTitle = '';
      this.newPostContent = '';
    }
  }

  async loadPosts(page: number = 1) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const postsResponse = await this.postsService.getPosts(page);
      this.posts.set(postsResponse.items);
      this.page.set(postsResponse.page);
      this.totalPages.set(postsResponse.totalPages);
    } catch (error: unknown) {
      this.errorMessage.set('Erreur lors du chargement des posts');
      console.error('Error loading posts:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onPageChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newPage = parseInt(target.value, 10);

    if (newPage >= 1 && newPage <= this.totalPages() && newPage !== this.page()) {
      this.loadPosts(newPage);
    }
  }

  async createPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) {
      this.errorMessage.set('Le titre et le contenu sont obligatoires');
      return;
    }

    this.isCreatingPost.set(true);
    this.errorMessage.set('');

    try {
      await this.postsService.createPost(this.newPostTitle, this.newPostContent);
      this.newPostTitle = '';
      this.newPostContent = '';
      this.showCreateForm.set(false);
      await this.loadPosts();
    } catch (error: unknown) {
      this.errorMessage.set('Erreur lors de la création du post');
      console.error('Error creating post:', error);
    } finally {
      this.isCreatingPost.set(false);
    }
  }

  async deletePost(postId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      return;
    }

    try {
      await this.postsService.deletePost(postId);
      await this.loadPosts(this.page());
    } catch (error: unknown) {
      this.errorMessage.set('Erreur lors de la suppression du post');
      console.error('Error deleting post:', error);
    }
  }

  canDeletePost(post: Post): boolean {
    const user = this.currentUser();
    return user?.id === post.author;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
