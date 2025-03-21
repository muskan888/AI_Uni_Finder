
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpCircle, MessageCircle, ArrowRight, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { upvotePost } from '@/lib/post-service';
import { toast } from 'sonner';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  comments: number;
  community: {
    id: string;
    name: string;
    logo?: string;
  };
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  className?: string;
  tags?: string[];
  isPinned?: boolean;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  content,
  upvotes,
  comments,
  community,
  author,
  createdAt,
  className,
  tags = [],
  isPinned = false
}) => {
  const [upvoteCount, setUpvoteCount] = useState(upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const navigate = useNavigate();
  
  // Check if post is already upvoted
  React.useEffect(() => {
    const upvotedPosts = JSON.parse(localStorage.getItem('post_upvotes') || '[]');
    setIsUpvoted(upvotedPosts.includes(id));
  }, [id]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUpvoting) return;
    
    setIsUpvoting(true);
    
    try {
      const result = await upvotePost(id);
      
      if (result.success) {
        setUpvoteCount(result.post?.upvotes || upvoteCount);
        setIsUpvoted(result.upvoted);
        
        if (result.upvoted) {
          toast.success('Post upvoted!');
        } else {
          toast.success('Upvote removed!');
        }
      } else {
        toast.error('Failed to update vote');
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
      toast.error('Something went wrong');
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${id}`);
  };

  const handleCommunityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={cn(
        "bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-2 hover:border-primary cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link 
            to={`/r/${community.id}`} 
            className="flex items-center gap-1.5 font-medium text-primary hover:underline"
            onClick={handleCommunityClick}
          >
            <Avatar className="h-5 w-5 ring-1 ring-primary/20">
              <AvatarImage src={community.logo} alt={community.name} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {community.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>r/{community.name}</span>
          </Link>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">Posted by u/{author.username}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">{createdAt}</span>
          
          {isPinned && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <Badge variant="outline" className="flex items-center gap-1 text-xs text-primary border-primary/30 py-0 h-5">
                <Pin className="h-3 w-3" />
                <span>Pinned</span>
              </Badge>
            </>
          )}
        </div>
        
        <h3 className="text-xl font-display font-semibold mb-3 line-clamp-2 tracking-wide">{title}</h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 opacity-70">
          {truncateText(content, 200)}
        </p>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="capitalize text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex items-center gap-1 py-1 px-2 transition-colors group", 
                isUpvoted ? "text-primary" : "hover:text-primary"
              )}
              onClick={handleUpvote}
            >
              <ArrowUpCircle 
                className={cn(
                  "h-4 w-4 transition-all", 
                  isUpvoted ? "fill-primary text-white" : "group-hover:text-primary"
                )} 
              />
              <span>{upvoteCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 py-1 px-2 group hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${id}`);
              }}
            >
              <MessageCircle className="h-4 w-4 group-hover:text-primary transition-colors" />
              <span>{comments}</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground group hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${id}`);
            }}
          >
            <span className="sr-only md:not-sr-only md:inline-block mr-1 group-hover:underline transition-all">Read More</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
