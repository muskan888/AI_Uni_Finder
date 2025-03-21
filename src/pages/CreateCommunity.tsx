
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { createCommunity } from '@/lib/community-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DEFAULT_LOGOS = [
  '/logos/university-logo-1.png',
  '/logos/university-logo-2.png',
  '/logos/university-logo-3.png',
  '/logos/university-logo-4.png',
];

const DEFAULT_COVERS = [
  '/covers/university-cover-1.jpg',
  '/covers/university-cover-2.jpg',
  '/covers/university-cover-3.jpg',
  '/covers/university-cover-4.jpg',
];

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [selectedCover, setSelectedCover] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "University name required",
        description: "Please enter a name for your university community",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newCommunity = await createCommunity(
        name, 
        description, 
        selectedLogo, 
        selectedCover
      );
      
      toast({
        title: "Community created!",
        description: `r/${newCommunity.name} has been successfully created`,
      });
      
      // Navigate to the new community
      navigate(`/r/${newCommunity.id}`);
    } catch (error: any) {
      console.error('Error creating community:', error);
      toast({
        title: "Error creating community",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen page-transition">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Create a University Community</h1>
            <p className="text-muted-foreground">
              Start a space for your university to connect students from around the world
            </p>
          </div>
          
          <Card className="shadow-md border-border/50 overflow-hidden">
            <CardHeader className="bg-secondary/30">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>New Community</span>
              </CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">University Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Harvard University"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed as r/{name.replace(/\s+/g, '')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about this university community..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Community Logo</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {DEFAULT_LOGOS.map((logo, index) => (
                      <div 
                        key={index}
                        className={`cursor-pointer relative rounded-md overflow-hidden border-2 ${selectedLogo === logo ? 'border-primary' : 'border-transparent'}`}
                        onClick={() => setSelectedLogo(logo)}
                      >
                        <Avatar className="h-12 w-12 mx-auto">
                          <AvatarImage src={logo} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        {selectedLogo === logo && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div 
                      className="cursor-pointer border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center p-2 hover:bg-secondary/30"
                      onClick={() => setSelectedLogo(prompt('Enter logo URL') || '')}
                    >
                      <Upload className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Cover Image</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {DEFAULT_COVERS.map((cover, index) => (
                      <div 
                        key={index}
                        className={`cursor-pointer relative rounded-md overflow-hidden border-2 h-24 ${selectedCover === cover ? 'border-primary' : 'border-transparent'}`}
                        onClick={() => setSelectedCover(cover)}
                        style={{ backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      >
                        {selectedCover === cover && (
                          <div className="absolute top-2 right-2">
                            <div className="h-5 w-5 bg-primary text-white rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div 
                      className="cursor-pointer border-2 border-dashed border-muted-foreground/30 rounded-md flex flex-col items-center justify-center gap-2 p-2 hover:bg-secondary/30 h-24"
                      onClick={() => setSelectedCover(prompt('Enter cover image URL') || '')}
                    >
                      <Image className="h-6 w-6 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground">Upload Cover</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-secondary/10 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Community Guidelines</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <div>•</div>
                      <div>Ensure this community doesn't already exist</div>
                    </li>
                    <li className="flex gap-2">
                      <div>•</div>
                      <div>Use the official name of the university</div>
                    </li>
                    <li className="flex gap-2">
                      <div>•</div>
                      <div>Be prepared to help moderate discussions</div>
                    </li>
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="bg-secondary/10 p-6 flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !name.trim()} 
                  className="gap-2"
                >
                  <span>{isSubmitting ? 'Creating...' : 'Create Community'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateCommunity;
