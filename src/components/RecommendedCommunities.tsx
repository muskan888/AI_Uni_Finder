import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { recommendCommunities } from '@/lib/openai-service';
import { joinCommunity, hasJoinedCommunity } from '@/lib/community-service';

interface RecommendedCommunitiesProps {
  className?: string;
}

interface CommunityData {
  id: string;
  name: string;
  description?: string;
  members?: number;
  logo?: string;
  [key: string]: any;
}

const RecommendedCommunities: React.FC<RecommendedCommunitiesProps> = ({ className = "" }) => {
  const [recommendations, setRecommendations] = useState<Array<{id: string; name: string; description: string; members: number; logo: string; joined: boolean}>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
        const viewedPosts = JSON.parse(localStorage.getItem('viewed_posts') || '[]');
        
        const userInteractions = [...recentSearches, ...viewedPosts].slice(0, 10);
        
        if (userInteractions.length === 0) {
          userInteractions.push('university student visa', 'international student housing', 'campus life');
        }
        
        const allCommunitiesData = JSON.parse(localStorage.getItem('communities_data') || '{}');
        const allCommunities: CommunityData[] = Object.values(allCommunitiesData);
        
        const recommended = await recommendCommunities(
          userInteractions,
          allCommunities.map((community: CommunityData) => ({
            id: community.id,
            name: community.name,
            description: community.description || '',
          }))
        );
        
        const recommendationsWithJoinStatus = await Promise.all(
          recommended.map(async (rec: any) => {
            const community = allCommunities.find((c: CommunityData) => c.id === rec.id) as CommunityData;
            const joined = await hasJoinedCommunity(rec.id);
            
            return {
              id: rec.id,
              name: rec.name,
              description: rec.description || 'A university community',
              members: community?.members || 0,
              logo: community?.logo || '',
              joined,
            };
          })
        );
        
        setRecommendations(recommendationsWithJoinStatus);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Could not load recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const result = await joinCommunity(communityId);
      
      setRecommendations(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, joined: result.joined } 
            : community
        )
      );
    } catch (err) {
      console.error('Error joining community:', err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <section className={`${className}`}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#24293E]">Recommended Communities</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((community) => (
          <div 
            key={community.id}
            className="bg-[#F4F5FC] rounded-lg overflow-hidden border border-[#8EBBFF]/20 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 p-4">
              <div 
                className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0 border-2 border-[#8EBBFF]/30"
                style={{ backgroundImage: `url(${community.logo})` }}
              />
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-bold text-[#24293E] truncate cursor-pointer hover:text-[#8EBBFF] transition-colors"
                  onClick={() => navigate(`/r/${community.id}`)}
                >
                  r/{community.name}
                </h3>
                <p className="text-sm text-[#24293E]/70 line-clamp-1">
                  {community.members.toLocaleString()} members
                </p>
              </div>
              <Button
                variant={community.joined ? "outline" : "default"}
                size="sm"
                className={community.joined ? 
                  "text-[#8EBBFF] border-[#8EBBFF]/30 hover:bg-[#8EBBFF]/10 hover:border-[#8EBBFF]" : 
                  "bg-[#8EBBFF] hover:bg-[#7DAEFF] text-white"
                }
                onClick={() => handleJoinCommunity(community.id)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {community.joined ? 'Joined' : 'Join'}
              </Button>
            </div>
            <div className="px-4 pb-4">
              <p className="text-sm text-[#24293E]/80 line-clamp-2 font-['Montserrat']">
                {community.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedCommunities;
