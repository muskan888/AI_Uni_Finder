
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpCircle, MessageCircle, Bookmark, Share, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { getPosts, addComment } from '@/lib/post-service';

// Define types for our data structure
interface Author {
  username: string;
  avatar?: string;
}

interface Community {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  author: Author;
  content: string;
  upvotes: number;
  createdAt: string;
  replies: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  comments: number;
  community: Community;
  author: Author;
  createdAt: string;
  commentsList: Comment[];
}

interface CommunityData {
  id: string;
  name: string;
  posts: Post[];
  pinnedPosts: Post[];
  [key: string]: any;
}

const Post = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const postsData = await getPosts();
        
        // Find the community that contains the post
        let foundPost: Post | null = null;
        
        // Look through all communities
        Object.values(postsData).forEach((communityData: any) => {
          // Ensure the community data is properly typed
          const community = communityData as CommunityData;
          
          // Check regular posts
          if (community.posts) {
            const regularPost = community.posts.find((p) => p.id === postId);
            if (regularPost) {
              foundPost = regularPost;
            }
          }
          
          // Check pinned posts
          if (community.pinnedPosts) {
            const pinnedPost = community.pinnedPosts.find((p) => p.id === postId);
            if (pinnedPost) {
              foundPost = pinnedPost;
            }
          }
        });
        
        if (foundPost) {
          setPost(foundPost);
          setComments(foundPost.commentsList || []);
        }
      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
    
    // Add animation classes after mount
    const timer = setTimeout(() => {
      const commentElements = document.querySelectorAll('.comment-item');
      commentElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('appear');
        }, index * 100);
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [postId]);
  
  if (loading) {
    return (
      <div className="min-h-screen page-transition bg-background">
        <Navbar />
        <div className="pt-20 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center page-transition">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment to post",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const randomNames = [
        "CuriousTraveler", "GlobeTrotter", "WanderingScholar", "AcademicExplorer",
        "InternationalStudent", "VisaVoyager", "CampusNavigator", "EduExplorer",
        "WorldlyLearner", "StudyAbroad", "KnowledgeSeeker", "UniversityWanderer"
      ];
      
      const randomNum = Math.floor(Math.random() * 1000);
      const randomName = `${randomNames[Math.floor(Math.random() * randomNames.length)]}${randomNum}`;
      
      const newComment: Comment = {
        id: `new-${Date.now()}`,
        author: { username: randomName, avatar: '' },
        content: commentText,
        upvotes: 1,
        createdAt: 'Just now',
        replies: []
      };
      
      // Update UI immediately for better UX
      setComments([newComment, ...comments]);
      setCommentText('');
      
      // Update the comment in the central store
      await addComment(postId || '', newComment);
      
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the discussion",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error posting comment",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, upvotes: comment.upvotes + 1 };
      }
      return comment;
    });
    
    setComments(updatedComments);
    
    toast({
      title: "Upvoted",
      description: "You've upvoted this comment",
    });
  };

  const handlePostUpvote = () => {
    toast({
      title: "Upvoted",
      description: "You've upvoted this post",
    });
  };

  const handleShare = () => {
    // Copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    
    toast({
      title: "Share link copied",
      description: "The link to this post has been copied to your clipboard",
    });
  };

  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Link 
            to={`/r/${post.community.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to r/{post.community.name}</span>
          </Link>
          
          <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <div className="p-4 md:p-6 appear-animation">
              <div className="flex items-center gap-3 mb-4">
                <Link
                  to={`/r/${post.community.id}`}
                  className="inline-flex items-center gap-1.5"
                >
                  <Button variant="secondary" size="sm" className="h-6 px-2 text-xs font-medium">
                    r/{post.community.name}
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={post.author.avatar} alt={post.author.username} />
                    <AvatarFallback>{post.author.username.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    Posted by {post.author.username} • {post.createdAt}
                  </span>
                </div>
              </div>
              
              <h1 className="text-xl md:text-2xl font-semibold mb-4">{post.title}</h1>
              
              <div className="text-base mb-6 whitespace-pre-line">
                {post.content}
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <button 
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  onClick={handlePostUpvote}
                >
                  <ArrowUpCircle className="h-5 w-5" />
                  <span>{post.upvotes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>{comments.length} Comments</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <Bookmark className="h-5 w-5" />
                  <span>Save</span>
                </button>
                <button 
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors ml-auto"
                  onClick={handleShare}
                >
                  <Share className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Add comment section */}
          <div className="bg-white rounded-xl shadow-sm border border-border/50 mt-6 p-4 md:p-6 appear-animation stagger-1">
            <h3 className="text-base font-medium mb-4">Add a comment</h3>
            <form onSubmit={handleSubmitComment}>
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea 
                    placeholder="What are your thoughts?" 
                    className="mb-3 resize-none"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button className="gap-1.5" type="submit" disabled={isSubmitting}>
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Posting...' : 'Comment'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Comments */}
          <div className="mt-6 space-y-6 appear-animation stagger-2">
            <h3 className="text-xl font-medium">Comments ({comments.length})</h3>
            
            {comments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-border/50 p-6 text-center">
                <p className="text-muted-foreground">Be the first to comment on this post!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-border/50 p-4 md:p-6 comment-item opacity-0 transition-opacity duration-300">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
                        <AvatarFallback>{comment.author.username.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.author.username}</span>
                          <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                        </div>
                        <div className="text-base mb-3">
                          {comment.content}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <button 
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => handleUpvote(comment.id)}
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                            <span>{comment.upvotes}</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>Reply</span>
                          </button>
                        </div>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="pt-4">
                                <div className="flex gap-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={reply.author.avatar} alt={reply.author.username} />
                                    <AvatarFallback>{reply.author.username.slice(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{reply.author.username}</span>
                                      <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                                    </div>
                                    <div className="text-sm mb-2">
                                      {reply.content}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                      <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                                        <ArrowUpCircle className="h-3.5 w-3.5" />
                                        <span>{reply.upvotes}</span>
                                      </button>
                                      <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>Reply</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Post;
