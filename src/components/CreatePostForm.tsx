
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image, Send, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/lib/post-service';
import PostSuggestionModal from './PostSuggestionModal';

type CreatePostFormProps = {
  communityId?: string;
  onSuccess?: () => void;
};

const CreatePostForm = ({ communityId, onSuccess }: CreatePostFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const currentCommunityId = communityId || params.communityId;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate a random name for anonymous posting
      const randomNames = [
        "CuriousTraveler", "GlobeTrotter", "WanderingScholar", "AcademicExplorer",
        "InternationalStudent", "VisaVoyager", "CampusNavigator", "EduExplorer",
        "WorldlyLearner", "StudyAbroad", "KnowledgeSeeker", "UniversityWanderer"
      ];
      
      const randomNum = Math.floor(Math.random() * 1000);
      const randomName = `${randomNames[Math.floor(Math.random() * randomNames.length)]}${randomNum}`;
      
      // Create post
      await createPost({
        title,
        content,
        communityId: currentCommunityId || '',
        author: {
          username: randomName,
          avatar: ''
        }
      });
      
      toast({
        title: "Post created!",
        description: "Your post has been successfully created",
      });
      
      setTitle('');
      setContent('');
      setHasImage(false);
      
      if (onSuccess) {
        onSuccess();
      } else if (currentCommunityId) {
        navigate(`/r/${currentCommunityId}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplySuggestion = (suggestedTitle: string, suggestedContent: string) => {
    setTitle(suggestedTitle);
    setContent(suggestedContent);
  };

  return (
    <>
      <Card className="shadow-md border-border/50 overflow-hidden animate-fade-in">
        <CardHeader className="bg-secondary/30">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Create a Post</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSuggestionModal(true)}
              className="bg-[#8EBBFF]/10 border-[#8EBBFF]/30 hover:bg-[#8EBBFF]/20 text-[#8EBBFF] hover:text-[#7DAEFF] font-['Montserrat'] text-[14px] flex items-center gap-1.5"
            >
              <Lightbulb className="h-4 w-4" />
              Suggest a Post
            </Button>
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
            
            {hasImage && (
              <div className="border-2 border-dashed border-primary/30 rounded-md p-8 text-center">
                <p className="text-muted-foreground">Upload an image (Coming soon)</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between bg-secondary/10 p-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setHasImage(!hasImage)}
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              <span>{hasImage ? 'Remove Image' : 'Add Image'}</span>
            </Button>
            
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <PostSuggestionModal 
        open={showSuggestionModal}
        onOpenChange={setShowSuggestionModal}
        onApplySuggestion={handleApplySuggestion}
      />
    </>
  );
};

export default CreatePostForm;
