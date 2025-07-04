import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostsService, Post, Message } from '../../services/posts.service';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsService = inject(PostsService);
  private authService = inject(AuthService);

  // Signals for component state
  post = signal<Post | null>(null);
  messages = signal<Message[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  isCreatingMessage = signal(false);

  // Form property for two-way binding (signals don't work well with ngModel)
  newMessageContent = '';

  // Computed values
  currentUser = computed(() => this.authService.currentUser());
  postId = computed(() => this.route.snapshot.paramMap.get('id'));

  async ngOnInit() {
    const id = this.postId();
    if (id) {
      await this.loadPostAndMessages(id);
    }
  }

  private async loadPostAndMessages(postId: string) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Use optimized single method for better performance
      const { post, messages } = await this.postsService.getPostWithMessages(postId);

      this.post.set(post);
      this.messages.set(messages);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement';
      this.errorMessage.set(errorMsg);
      console.error('Error loading post and messages:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createMessage() {
    const content = this.newMessageContent.trim();
    if (!content) {
      this.errorMessage.set('Le contenu du message est obligatoire');
      return;
    }

    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.isCreatingMessage.set(true);
    this.errorMessage.set('');

    try {
      const id = this.postId();
      if (id) {
        await this.postsService.createMessage(id, content);
        this.newMessageContent = '';

        // Reload only messages to avoid unnecessary post reload
        const messagesData = await this.postsService.getMessages(id);
        this.messages.set(messagesData);
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de la création du message';
      this.errorMessage.set(errorMsg);
      console.error('Error creating message:', error);
    } finally {
      this.isCreatingMessage.set(false);
    }
  }

  async deleteMessage(messageId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      await this.postsService.deleteMessage(messageId);

      // Remove message from local state to avoid reload
      this.messages.update(messages =>
        messages.filter(message => message.id !== messageId)
      );
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur lors de la suppression du message';
      this.errorMessage.set(errorMsg);
      console.error('Error deleting message:', error);
    }
  }

  canDeleteMessage(message: Message): boolean {
    const user = this.currentUser();
    return user?.id === message.author;
  }

  goBack() {
    this.router.navigate(['/posts']);
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
