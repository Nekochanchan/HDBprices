export interface ForumReaction {
  id: 'upvote' | 'funny' | 'love' | 'surprised' | 'angry' | 'sad';
  label: string;
  emoji: string;
  count: number;
}

export interface ForumCommentReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorInitial: string;
  authorColor: string;
  isVerified?: boolean;
  role?: string;
  content: string;
  createdAt: string;
  timestampMs: number;
  upvotes: number;
  userVoted?: 'up' | 'down' | null;
}

export interface ForumComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorInitial: string;
  authorColor: string;
  isVerified?: boolean;
  role?: string;
  content: string;
  createdAt: string;
  timestampMs: number;
  upvotes: number;
  userVoted?: 'up' | 'down' | null;
  replies: ForumCommentReply[];
}
