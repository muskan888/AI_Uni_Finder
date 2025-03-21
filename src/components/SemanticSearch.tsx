
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { semanticSearch } from '@/lib/openai-service';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  id: string;
  text: string;
  title?: string;
  type: 'community' | 'post';
  communityId?: string;
  communityName?: string;
}

interface SemanticSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  searchItems: SearchItem[];
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({ 
  placeholder = "Search...", 
  className = "",
  onSearch,
  searchItems
}) => {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<Array<SearchItem & { score: number }>>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 3) return;
      
      try {
        setIsSearching(true);
        setError(null);
        
        // Perform semantic search
        const searchResults = await semanticSearch(query, searchItems);
        
        // Transform results to match our interface
        const formattedResults = searchResults.map(result => ({
          ...result,
          id: result.id,
          text: result.text,
          title: result.title || '',
          type: result.type,
          score: result.score
        }));
        
        setResults(formattedResults);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Search is currently unavailable');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchItems]);

  const handleItemClick = (item: SearchItem) => {
    setIsOpen(false);
    
    if (item.type === 'community') {
      navigate(`/r/${item.id}`);
    } else if (item.type === 'post') {
      navigate(`/post/${item.id}`);
    }
    
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen && results.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 3 && results.length > 0 && setIsOpen(true)}
              className="pl-9 w-full bg-white/80 backdrop-blur-sm border-secondary/20 focus-visible:ring-primary focus-visible:border-primary/40 shadow-sm transition-all duration-300"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[350px] max-w-[96vw] p-0 bg-[#F4F5FC] border-[#8EBBFF]/30" 
          align="start" 
          side="bottom"
          alignOffset={-6}
        >
          <div className="max-h-[350px] overflow-y-auto py-2">
            {error ? (
              <div className="px-4 py-3 text-red-500 text-sm">{error}</div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 hover:bg-[#8EBBFF]/10 cursor-pointer transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-[#24293E] line-clamp-1">
                        {item.type === 'community' ? `r/${item.title || item.text}` : item.title}
                      </div>
                      
                      <div className="text-sm text-[#24293E]/70 line-clamp-2 mt-1">
                        {item.type === 'community' 
                          ? item.text 
                          : item.text.length > 100 
                            ? `${item.text.substring(0, 100)}...` 
                            : item.text
                        }
                      </div>
                      
                      {item.type === 'post' && item.communityName && (
                        <div className="text-xs text-[#8EBBFF] mt-1">
                          r/{item.communityName}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-[#8EBBFF]/10 hover:bg-[#8EBBFF]/20 text-[#8EBBFF] h-7 px-2"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
            
            {results.length === 0 && !isSearching && !error && query.trim().length >= 3 && (
              <div className="px-4 py-3 text-[#24293E]/70 text-sm text-center">
                No results found
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SemanticSearch;
