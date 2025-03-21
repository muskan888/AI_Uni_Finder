
import { v4 as uuidv4 } from 'uuid';
import { getCommunityData, updateCommunityData } from './community-service';
import { generatePostSummary } from './openai-service';

// Types
type PostAuthor = {
  username: string;
  avatar?: string;
};

type CommunityInfo = {
  id: string;
  name: string;
};

export type CommentType = {
  id: string;
  author: PostAuthor;
  content: string;
  upvotes: number;
  createdAt: string;
  replies: CommentType[];
};

export type PostType = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  upvotes: number;
  comments: number;
  community: CommunityInfo;
  author: PostAuthor;
  createdAt: string;
  commentsList: CommentType[];
};

export type CommunityDataType = {
  [key: string]: {
    id: string;
    name: string;
    description?: string;
    members?: number;
    online?: number;
    logo?: string;
    coverImage?: string;
    createdAt?: string;
    pinnedPosts: PostType[];
    posts: PostType[];
  };
};

type CreatePostParams = {
  title: string;
  content: string;
  communityId: string;
  author: PostAuthor;
};

// Local storage keys
const POSTS_STORAGE_KEY = 'edupath_posts';
const POST_UPVOTES_KEY = 'post_upvotes';
const POST_SUMMARIES_KEY = 'post_summaries_cache';

// Get all posts across communities
export const getPosts = async (): Promise<CommunityDataType> => {
  try {
    const communitiesData = JSON.parse(localStorage.getItem('communities_data') || '{}');
    return communitiesData;
  } catch (error) {
    console.error('Error getting posts:', error);
    return {};
  }
};

// Create a new post
export const createPost = async (params: CreatePostParams): Promise<PostType> => {
  try {
    const { title, content, communityId, author } = params;
    
    // Get the community
    const community = await getCommunityData(communityId);
    
    if (!community) {
      throw new Error('Community not found');
    }
    
    // Create new post
    const newPost: PostType = {
      id: uuidv4(),
      title,
      content,
      upvotes: 1,
      comments: 0,
      community: {
        id: communityId,
        name: community.name
      },
      author,
      createdAt: 'Just now',
      commentsList: []
    };
    
    // Add post to community
    community.posts = [newPost, ...(community.posts || [])];
    
    // Update community data
    await updateCommunityData(communityId, community);
    
    return newPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get post summary (with caching)
export const getPostSummary = async (postId: string, content: string): Promise<string> => {
  try {
    // Check cache first
    const summariesCache = JSON.parse(localStorage.getItem(POST_SUMMARIES_KEY) || '{}');
    
    // If we have a cached summary for this post, return it
    if (summariesCache[postId]) {
      return summariesCache[postId];
    }
    
    // Generate summary using OpenAI
    try {
      const summary = await generatePostSummary(content);
      
      // Update cache
      summariesCache[postId] = summary;
      localStorage.setItem(POST_SUMMARIES_KEY, JSON.stringify(summariesCache));
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Summary not available.';
    }
  } catch (error) {
    console.error('Error getting post summary:', error);
    return 'Summary not available.';
  }
};

// Add comment to a post
export const addComment = async (postId: string, comment: CommentType): Promise<PostType> => {
  try {
    const communitiesData = await getPosts();
    
    // Find the community and post
    let foundCommunity = null;
    let foundPost = null;
    
    // Look through all communities
    for (const communityId in communitiesData) {
      const community = communitiesData[communityId];
      
      // Check regular posts
      if (community.posts) {
        const postIndex = community.posts.findIndex((p: any) => p.id === postId);
        if (postIndex !== -1) {
          foundCommunity = community;
          foundPost = community.posts[postIndex];
          
          // Initialize commentsList if it doesn't exist
          if (!foundPost.commentsList) {
            foundPost.commentsList = [];
          }
          
          // Add new comment
          foundPost.commentsList = [comment, ...foundPost.commentsList];
          foundPost.comments = foundPost.commentsList.length;
          
          // Update community data
          await updateCommunityData(communityId, community);
          break;
        }
      }
      
      // Check pinned posts
      if (community.pinnedPosts) {
        const pinnedIndex = community.pinnedPosts.findIndex((p: any) => p.id === postId);
        if (pinnedIndex !== -1) {
          foundCommunity = community;
          foundPost = community.pinnedPosts[pinnedIndex];
          
          // Initialize commentsList if it doesn't exist
          if (!foundPost.commentsList) {
            foundPost.commentsList = [];
          }
          
          // Add new comment
          foundPost.commentsList = [comment, ...foundPost.commentsList];
          foundPost.comments = foundPost.commentsList.length;
          
          // Update community data
          await updateCommunityData(communityId, community);
          break;
        }
      }
    }
    
    if (!foundPost) {
      throw new Error('Post not found');
    }
    
    return foundPost;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Handle upvotes with "one upvote per post" functionality
export const upvotePost = async (postId: string): Promise<{ success: boolean, upvoted: boolean, post: PostType | null }> => {
  try {
    // Get upvoted posts from local storage
    const upvotedPosts = JSON.parse(localStorage.getItem(POST_UPVOTES_KEY) || '[]');
    const hasUpvoted = upvotedPosts.includes(postId);
    
    const communitiesData = await getPosts();
    let foundPost = null;
    let foundCommunityId = null;
    
    // Look through all communities to find the post
    for (const communityId in communitiesData) {
      const community = communitiesData[communityId];
      
      // Check regular posts
      if (community.posts) {
        const postIndex = community.posts.findIndex((p: PostType) => p.id === postId);
        if (postIndex !== -1) {
          foundCommunityId = communityId;
          foundPost = community.posts[postIndex];
          
          // Update upvotes count
          if (hasUpvoted) {
            // Remove upvote
            foundPost.upvotes = Math.max(0, foundPost.upvotes - 1);
            const newUpvotedPosts = upvotedPosts.filter((id: string) => id !== postId);
            localStorage.setItem(POST_UPVOTES_KEY, JSON.stringify(newUpvotedPosts));
          } else {
            // Add upvote
            foundPost.upvotes += 1;
            upvotedPosts.push(postId);
            localStorage.setItem(POST_UPVOTES_KEY, JSON.stringify(upvotedPosts));
          }
          
          // Update community data
          await updateCommunityData(communityId, community);
          break;
        }
      }
      
      // Check pinned posts
      if (community.pinnedPosts && !foundPost) {
        const pinnedIndex = community.pinnedPosts.findIndex((p: PostType) => p.id === postId);
        if (pinnedIndex !== -1) {
          foundCommunityId = communityId;
          foundPost = community.pinnedPosts[pinnedIndex];
          
          // Update upvotes count
          if (hasUpvoted) {
            // Remove upvote
            foundPost.upvotes = Math.max(0, foundPost.upvotes - 1);
            const newUpvotedPosts = upvotedPosts.filter((id: string) => id !== postId);
            localStorage.setItem(POST_UPVOTES_KEY, JSON.stringify(newUpvotedPosts));
          } else {
            // Add upvote
            foundPost.upvotes += 1;
            upvotedPosts.push(postId);
            localStorage.setItem(POST_UPVOTES_KEY, JSON.stringify(upvotedPosts));
          }
          
          // Update community data
          await updateCommunityData(communityId, community);
          break;
        }
      }
    }
    
    if (!foundPost) {
      return { success: false, upvoted: false, post: null };
    }
    
    return { 
      success: true, 
      upvoted: !hasUpvoted,
      post: foundPost 
    };
  } catch (error) {
    console.error('Error upvoting post:', error);
    return { success: false, upvoted: false, post: null };
  }
};
