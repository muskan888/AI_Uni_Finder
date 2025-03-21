
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { joinCommunity, hasJoinedCommunity } from '@/lib/community-service';
import { toast } from 'sonner';

type CommunityCardProps = {
  id: string;
  name: string;
  description: string;
  members: number;
  logo?: string;
  coverImage?: string;
  className?: string;
};

const CommunityCard = ({
  id,
  name,
  description,
  members,
  logo,
  coverImage,
  className
}: CommunityCardProps) => {
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(members);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Check if user has joined this community
    const checkJoinStatus = async () => {
      const joined = await hasJoinedCommunity(id);
      setIsJoined(joined);
    };
    
    checkJoinStatus();
  }, [id]);

  const handleJoinToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isJoining) return;
    
    setIsJoining(true);
    
    try {
      const result = await joinCommunity(id);
      setIsJoined(result.joined);
      
      if (result.joined) {
        setMemberCount(prev => prev + 1);
        toast.success(`You've joined r/${name}`);
      } else {
        setMemberCount(prev => Math.max(0, prev - 1));
        toast.success(`You've left r/${name}`);
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error);
      toast.error('Failed to update membership');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/r/${id}`);
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <div 
        className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 relative"
        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      />
      
      <div className="p-5 pt-0 -mt-6">
        <Avatar className="h-12 w-12 ring-4 ring-white">
          <AvatarImage src={logo} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="mt-3 mb-4">
          <Link to={`/r/${id}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
              r/{name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Users className="h-3 w-3" />
            <span>{memberCount.toLocaleString()} members</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        </div>
        
        <Button 
          size="sm" 
          variant={isJoined ? "outline" : "default"}
          className="w-full"
          onClick={handleJoinToggle}
          disabled={isJoining}
        >
          {isJoining 
            ? 'Updating...' 
            : isJoined 
              ? 'Leave Community' 
              : 'Join Community'
          }
        </Button>
      </div>
    </div>
  );
};

export default CommunityCard;
