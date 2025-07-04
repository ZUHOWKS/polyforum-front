import { Injectable } from '@angular/core';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created: string;
  expand?: {
    author?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface Message {
  id: string;
  content: string;
  author: string;
  post: string;
  created: string;
  expand?: {
    author?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = 'http://127.0.0.1:8090/api/collections';

  // Simple cache for frequently accessed data
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache GET requests
    if (!options.method || options.method === 'GET') {
      this.cache.set(url, { data, timestamp: Date.now() });
    }

    return data;
  }

  private clearCache(): void {
    this.cache.clear();
  }

  async getPosts(): Promise<Post[]> {
    try {
      // Optimize query with only necessary fields, pagination, and efficient sorting
      const url = `${this.apiUrl}/posts/records?sort=-created&expand=author&fields=id,title,content,author,created,expand.author.id,expand.author.name&perPage=50`;
      const data = await this.makeRequest(url);
      return data.items || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPost(id: string): Promise<Post> {
    try {
      // Optimize query with only necessary fields and expand
      const url = `${this.apiUrl}/posts/records/${id}?expand=author&fields=id,title,content,author,created,expand.author.id,expand.author.name,expand.author.email`;
      const data = await this.makeRequest(url);
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  async createPost(title: string, content: string): Promise<Post> {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const url = `${this.apiUrl}/posts/records`;
      const data = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title,
          content,
          author: localStorage.getItem('userId')
        })
      });

      // Clear cache after creating new post
      this.clearCache();
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const url = `${this.apiUrl}/posts/records/${id}`;
      await this.makeRequest(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async getMessages(postId: string): Promise<Message[]> {
    try {
      // Optimize query with specific fields, efficient filtering, and pagination
      const url = `${this.apiUrl}/messages/records?filter=(post="${postId}")&sort=created&expand=author&fields=id,content,author,post,created,expand.author.id,expand.author.name&perPage=100`;
      const data = await this.makeRequest(url);
      return data.items || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Optimized method to get post with messages in fewer requests
  async getPostWithMessages(postId: string): Promise<{ post: Post; messages: Message[] }> {
    try {
      // Use Promise.all for parallel requests with optimized queries
      const [postResponse, messagesResponse] = await Promise.all([
        this.makeRequest(`${this.apiUrl}/posts/records/${postId}?expand=author&fields=id,title,content,author,created,expand.author.id,expand.author.name,expand.author.email`),
        this.makeRequest(`${this.apiUrl}/messages/records?filter=(post="${postId}")&sort=created&expand=author&fields=id,content,author,post,created,expand.author.id,expand.author.name&perPage=100`)
      ]);

      return {
        post: postResponse,
        messages: messagesResponse.items || []
      };
    } catch (error) {
      console.error('Error fetching post with messages:', error);
      throw error;
    }
  }

  async createMessage(postId: string, content: string): Promise<Message> {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const url = `${this.apiUrl}/messages/records`;
      const data = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          content,
          author: localStorage.getItem('userId'),
          post: postId
        })
      });

      // Clear cache after creating new message
      this.clearCache();
      return data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const url = `${this.apiUrl}/messages/records/${id}`;
      await this.makeRequest(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}
