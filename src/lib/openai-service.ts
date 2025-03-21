import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

// Initialize OpenAI instance
export const initializeOpenAI = (apiKey: string | null = null): OpenAI | null => {
  // First check for API key from the parameter or environment
  const keyToUse = apiKey || import.meta.env.VITE_OPENAI_API_KEY || null;
  
  if (!keyToUse) {
    console.warn('No OpenAI API key provided. AI features will be disabled.');
    return null;
  }
  
  try {
    openaiInstance = new OpenAI({
      apiKey: keyToUse,
      dangerouslyAllowBrowser: true // This allows the OpenAI client to run in browser
    });
    console.log('OpenAI instance initialized successfully');
    return openaiInstance;
  } catch (error) {
    console.error('Error initializing OpenAI:', error);
    return null;
  }
};

// Get the current OpenAI instance
export const getOpenAIInstance = (): OpenAI | null => {
  return openaiInstance;
};

// Function to determine if we're in a production environment (deployed on Vercel)
const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production';
};

// Base URL for API calls
const getApiBaseUrl = (): string => {
  if (isProduction()) {
    // When deployed, use relative path
    return '/api';
  }
  // For local development
  return 'http://localhost:3000/api';
};

// Generate a chat response - Using Vercel API function in production
export const generateChatResponse = async (messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>): Promise<string> => {
  if (isProduction()) {
    // In production, use the Vercel API function
    try {
      const response = await fetch(`${getApiBaseUrl()}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate chat response');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Error generating chat response:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      const response = await openaiInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'No response generated.';
    } catch (error) {
      console.error('Error generating chat response:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }
};

// Generate a post summary - Using Vercel API function in production
export const generatePostSummary = async (postContent: string): Promise<string> => {
  if (isProduction()) {
    // In production, use the Vercel API function
    try {
      const response = await fetch(`${getApiBaseUrl()}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: postContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('Error generating post summary:', error);
      return 'Summary not available.';
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      const response = await openaiInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes content for international students.'
          },
          {
            role: 'user',
            content: `Summarize the following post in 2-3 sentences for international students: ${postContent}`
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'No summary generated.';
    } catch (error) {
      console.error('Error generating post summary:', error);
      return 'Summary not available.';
    }
  }
};

// Generate a post suggestion - Using Vercel API function in production
export const generatePostSuggestion = async (prompt: string): Promise<{ title: string, content: string }> => {
  if (isProduction()) {
    // In production, use the Vercel API function
    try {
      const response = await fetch(`${getApiBaseUrl()}/suggest-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate post suggestion');
      }

      const data = await response.json();
      return {
        title: data.title,
        content: data.content
      };
    } catch (error) {
      console.error('Error generating post suggestion:', error);
      return {
        title: 'Error generating suggestion',
        content: 'Sorry, we encountered an error while generating your post suggestion.'
      };
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      const response = await openaiInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates post content for university community platforms.'
          },
          {
            role: 'user',
            content: `Generate a post title and body (150-200 words) for a university community platform about: ${prompt}. The post should be helpful for international students. Format the response as: Title: [generated title]\n\nBody: [generated body]`
          }
        ],
        temperature: 0.7,
      });

      const generatedText = response.choices[0]?.message?.content || '';
      
      // Parse the title and body from the response
      const titleMatch = generatedText.match(/Title:(.*?)(?=\n\nBody:|$)/s);
      const bodyMatch = generatedText.match(/Body:(.*?)$/s);
      
      return {
        title: titleMatch ? titleMatch[1].trim() : 'Suggested Post Title',
        content: bodyMatch ? bodyMatch[1].trim() : 'Suggested post content.'
      };
    } catch (error) {
      console.error('Error generating post suggestion:', error);
      return {
        title: 'Error generating suggestion',
        content: 'Sorry, we encountered an error while generating your post suggestion.'
      };
    }
  }
};

// Translation service - Using Vercel API function in production
export const translateText = async (
  text: string, 
  targetLanguage: string
): Promise<string> => {
  if (isProduction()) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLanguage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate text');
      }

      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Error translating text:', error);
      return text; // Return original text on error
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      const response = await openaiInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful translation assistant. Translate the following text to ${targetLanguage}.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Error translating text:', error);
      return text; // Return original text on error
    }
  }
};

// Recommendations for universities based on user preferences
export const getUniversityRecommendations = async (
  major: string,
  budget: string,
  location: string
): Promise<any[]> => {
  if (isProduction()) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/university-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ major, budget, location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get university recommendations');
      }

      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error getting university recommendations:', error);
      return [];
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      const response = await openaiInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a university recommendation assistant. Provide recommendations in a structured JSON format with name, description, location, tuition, and majorStrengths properties.'
          },
          {
            role: 'user',
            content: `Recommend 3 universities for a student interested in ${major} with a ${budget} budget who wants to study in ${location}. Format as JSON array.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content || '{"recommendations": []}';
      try {
        const parsedContent = JSON.parse(content);
        return parsedContent.recommendations || [];
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        return [];
      }
    } catch (error) {
      console.error('Error getting university recommendations:', error);
      return [];
    }
  }
};

// Application materials analysis (like essay review)
export const analyzeApplicationMaterial = async (
  text: string,
  materialType: 'essay' | 'resume' | 'statementOfPurpose'
): Promise<{ feedback: string, grammarIssues: string[], suggestions: string[] }> => {
  if (isProduction()) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/analyze-material`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, materialType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze application material');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing application material:', error);
      return { feedback: '', grammarIssues: [], suggestions: [] };
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      const prompts = {
        essay: 'a college application essay',
        resume: 'a student resume for university applications',
        statementOfPurpose: 'a statement of purpose for graduate school'
      };

      const response = await openaiInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert reviewer of student application materials. Analyze the following ${prompts[materialType]} and provide constructive feedback. Include an overall assessment, specific grammar issues, and suggestions for improvement. Format as JSON with feedback, grammarIssues, and suggestions fields.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content || '{}';
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        return { feedback: '', grammarIssues: [], suggestions: [] };
      }
    } catch (error) {
      console.error('Error analyzing application material:', error);
      return { feedback: '', grammarIssues: [], suggestions: [] };
    }
  }
};

// Real-time web search for university information
export const searchUniversityInfo = async (
  query: string
): Promise<{ results: any[], sources: any[] }> => {
  if (isProduction()) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/search-university-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search university information');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching university information:', error);
      return { results: [], sources: [] };
    }
  } else {
    // In development, simulate web search with OpenAI
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      const response = await openaiInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a university information search assistant. Provide information about universities, scholarships, visa requirements, etc. Include fictional URLs as sources. Format as JSON with results and sources arrays.'
          },
          {
            role: 'user',
            content: `Search for information about: ${query}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content || '{"results":[],"sources":[]}';
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        return { results: [], sources: [] };
      }
    } catch (error) {
      console.error('Error searching university information:', error);
      return { results: [], sources: [] };
    }
  }
};

// Voice to text transcription
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (isProduction()) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      const response = await fetch(`${getApiBaseUrl()}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      return data.transcription;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return '';
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      // Create a File object from the Blob with required properties
      const fileName = 'recording.webm';
      const file = new File([audioBlob], fileName, { type: audioBlob.type });
      
      const response = await openaiInstance.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
      });

      return response.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return '';
    }
  }
};

// Cache for embeddings to avoid recomputing
const cachedEmbeddings: Record<string, number[]> = {};

// Generate embedding - Helper function for local development
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!openaiInstance) {
    throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
  }

  // Check if embedding is already cached
  if (cachedEmbeddings[text]) {
    return cachedEmbeddings[text];
  }

  try {
    const response = await openaiInstance.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0].embedding;
    
    // Cache the embedding
    cachedEmbeddings[text] = embedding;
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding.');
  }
};

// Calculate cosine similarity between two vectors
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Semantic search - Using Vercel API function in production
export const semanticSearch = async (
  query: string,
  items: Array<{ id: string; text: string; [key: string]: any }>
): Promise<Array<{ id: string; score: number; [key: string]: any }>> => {
  if (isProduction()) {
    // In production, use the Vercel API function
    try {
      const response = await fetch(`${getApiBaseUrl()}/semantic-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, items }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform semantic search');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      return [];
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance) {
      throw new Error('OpenAI not initialized. Call initializeOpenAI first.');
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      
      // Process all items to get their embeddings (or use cached ones)
      const itemsWithEmbeddings = await Promise.all(
        items.map(async (item) => {
          const embedding = await generateEmbedding(item.text);
          return { ...item, embedding };
        })
      );
      
      // Calculate similarity scores
      const results = itemsWithEmbeddings.map((item) => {
        const score = cosineSimilarity(queryEmbedding, item.embedding);
        return { ...item, score };
      });
      
      // Sort by score (descending) and return top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ embedding, ...rest }) => rest); // Remove embedding from results
    } catch (error) {
      console.error('Error performing semantic search:', error);
      return [];
    }
  }
};

// Recommend communities - Using Vercel API function in production
export const recommendCommunities = async (
  userInteractions: string[],
  communities: Array<{ id: string; name: string; description: string; [key: string]: any }>
): Promise<Array<{ id: string; score: number; [key: string]: any }>> => {
  if (isProduction()) {
    // In production, use the Vercel API function
    try {
      const response = await fetch(`${getApiBaseUrl()}/recommend-communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInteractions, communities }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate community recommendations');
      }

      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error generating community recommendations:', error);
      return communities.slice(0, 3).map(community => ({ ...community, score: 0 }));
    }
  } else {
    // In development, use the OpenAI client directly
    if (!openaiInstance || userInteractions.length === 0 || communities.length === 0) {
      return communities.slice(0, 3).map(community => ({ ...community, score: 0 }));
    }

    try {
      // Generate embeddings for user interactions
      const interactionEmbeddings = await Promise.all(
        userInteractions.map(interaction => generateEmbedding(interaction))
      );
      
      // Calculate average user profile embedding
      const userProfileEmbedding = interactionEmbeddings[0].map((_, i) => {
        return interactionEmbeddings.reduce((sum, embedding) => sum + embedding[i], 0) / interactionEmbeddings.length;
      });
      
      // Process communities to get their embeddings
      const communitiesWithEmbeddings = await Promise.all(
        communities.map(async (community) => {
          const text = `${community.name} ${community.description || ''}`;
          const embedding = await generateEmbedding(text);
          return { ...community, embedding };
        })
      );
      
      // Calculate similarity scores
      const results = communitiesWithEmbeddings.map((community) => {
        const score = cosineSimilarity(userProfileEmbedding, community.embedding);
        return { ...community, score };
      });
      
      // Sort by score (descending) and return top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ embedding, ...rest }) => rest); // Remove embedding from results
    } catch (error) {
      console.error('Error generating community recommendations:', error);
      return communities.slice(0, 3).map(community => ({ ...community, score: 0 }));
    }
  }
};
