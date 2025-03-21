
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPostSummary } from '@/lib/post-service';

interface PostSummaryProps {
  postId: string;
  content: string;
  expanded?: boolean;
}

const PostSummary: React.FC<PostSummaryProps> = ({ postId, content, expanded = false }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        // Only fetch summary if content is longer than 300 characters
        if (content.length > 300) {
          const fetchedSummary = await getPostSummary(postId, content);
          setSummary(fetchedSummary);
        } else {
          setSummary(content);
        }
      } catch (err) {
        console.error('Failed to load summary:', err);
        setError('Unable to load summary');
        setSummary(content.substring(0, 200) + '...');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [postId, content]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Skip summary display for short content
  if (content.length <= 300) {
    return (
      <div className="post-content mt-2 text-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="post-summary space-y-2">
      {loading ? (
        <div className="animate-pulse h-12 bg-gray-100 rounded"></div>
      ) : (
        <>
          <div 
            className={`summary transition-all duration-300 overflow-hidden font-['Montserrat'] text-[14px] text-[#24293E]`}
          >
            {isExpanded ? (
              <div className="full-content">{content}</div>
            ) : (
              <div className="summary-content">{summary}</div>
            )}
          </div>
          
          <Button
            onClick={toggleExpanded}
            variant="ghost" 
            size="sm"
            className="text-[#8EBBFF] hover:text-[#7DAEFF] hover:bg-[#8EBBFF]/10 font-['Montserrat'] text-[14px] flex items-center gap-1 px-0"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Read Full Post
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default PostSummary;
