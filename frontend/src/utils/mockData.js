export const initialUsers = [
  {
    id: 'user_krishna',
    username: 'krishnajha',
    email: 'krishnajha7033@gmail.com',
    password: 'krishna@123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=krishnajha',
    bio: 'Software Engineer & Creator 🚀',
    followers: ['user_1', 'user_2'],
    following: ['user_1']
  },
  {
    id: 'user_1',
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john_doe',
    bio: 'Photography enthusiast 📸',
    followers: ['user_2'],
    following: ['user_2']
  },
  {
    id: 'user_2',
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane_smith',
    bio: 'Wanderlust ✨',
    followers: ['user_1'],
    following: ['user_1']
  }
];

export const initialPosts = [
  {
    id: 'post_1',
    userId: 'user_1',
    imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
    caption: 'Beautiful sunset today! 🌅',
    likes: ['user_2'],
    comments: [
      { id: 'comment_1', userId: 'user_2', text: 'Stunning view!', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'post_2',
    userId: 'user_2',
    imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
    caption: 'Exploring the mountains ⛰️',
    likes: ['user_1'],
    comments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];
