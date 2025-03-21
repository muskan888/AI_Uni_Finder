
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, X, AlertCircle, Mic, StopCircle, Globe } from 'lucide-react';
import { generateChatResponse, getOpenAIInstance, transcribeAudio, translateText } from '@/lib/openai-service';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  originalContent?: string; // For storing pre-translated content
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant for international students using UniGlobe Hub. Provide concise, accurate answers about studying abroad, visa requirements, university information, and how to use the app.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('English');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!getOpenAIInstance() && import.meta.env.MODE !== 'production') {
      toast({
        title: "API Key Missing",
        description: "Please set your OpenAI API key in your .env file.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await generateChatResponse(allMessages);
      
      // If language is not English, translate the response
      let finalResponse = response;
      if (language !== 'English') {
        try {
          finalResponse = await translateText(response, language);
        } catch (error) {
          console.error('Translation error:', error);
          // If translation fails, use the original response
        }
      }
      
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: finalResponse,
          originalContent: response // Store original content for potential re-translation
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please check your API key in the .env file.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          setIsLoading(true);
          const text = await transcribeAudio(audioBlob);
          if (text) {
            setInput(text);
            // Automatically send the transcribed message
            setTimeout(() => {
              if (text.trim()) {
                const userMessage = { role: 'user' as const, content: text };
                setMessages(prev => [...prev, userMessage]);
                handleSendMessage();
              }
            }, 500);
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Transcription Error",
            description: "Failed to transcribe audio. Please try again or type your message.",
            variant: "destructive",
            duration: 3000,
          });
        } finally {
          setIsLoading(false);
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak now. Click the stop button when you're done.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your audio...",
        duration: 3000,
      });
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    
    // Translate existing assistant messages if language changes
    if (newLanguage !== language && messages.length > 1) {
      try {
        const updatedMessages = await Promise.all(
          messages.map(async (msg) => {
            if (msg.role === 'assistant') {
              const originalContent = msg.originalContent || msg.content;
              if (newLanguage === 'English') {
                return { ...msg, content: originalContent };
              } else {
                const translated = await translateText(originalContent, newLanguage);
                return { ...msg, content: translated, originalContent };
              }
            }
            return msg;
          })
        );
        
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Error translating messages:', error);
        toast({
          title: "Translation Error",
          description: "Failed to translate messages. Some messages may remain in their original language.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          className="fixed bottom-5 right-5 rounded-full w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-5 right-5 w-80 sm:w-96 h-[450px] flex flex-col shadow-lg z-50">
          <CardHeader className="py-2 px-4 border-b flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">UniGlobe Assistant</CardTitle>
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-muted-foreground mr-1" />
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue placeholder="English" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Korean">Korean</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Russian">Russian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 1 && (
              <div className="flex justify-center items-center h-full text-center text-sm text-gray-500">
                <div>
                  <AlertCircle className="mx-auto h-8 w-8 mb-2 text-yellow-500" />
                  <p>To use the chatbot, make sure you have set your OpenAI API key in your .env file as VITE_OPENAI_API_KEY=your_api_key</p>
                </div>
              </div>
            )}
            
            {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.role === 'user'
                      ? 'bg-[#8EBBFF] text-white'
                      : 'bg-white text-[#24293E] border border-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 bg-white border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-[#8EBBFF] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#8EBBFF] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#8EBBFF] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-2 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isRecording}
                className="flex-1"
              />
              {!isRecording ? (
                <Button 
                  size="icon" 
                  onClick={startRecording}
                  disabled={isLoading}
                  variant="outline"
                  className="rounded-full"
                  title="Voice input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  size="icon" 
                  onClick={stopRecording}
                  variant="destructive"
                  className="rounded-full"
                  title="Stop recording"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              )}
              <Button 
                size="icon" 
                onClick={handleSendMessage} 
                disabled={isLoading || isRecording || !input.trim()}
                className="bg-[#8EBBFF] hover:bg-[#7DAEFF]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
