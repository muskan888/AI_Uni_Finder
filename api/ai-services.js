
import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const saveBufferToFile = async (buffer, filename) => {
  const tempDir = os.tmpdir();
  const filepath = path.join(tempDir, filename);
  await fs.promises.writeFile(filepath, buffer);
  return filepath;
};

const handleMulterUpload = upload.single('file');
const processUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    handleMulterUpload(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Set CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
};

export default async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check if this is a POST request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract service type from the request path
    const { service } = req.query;

    if (!service) {
      return res.status(400).json({ error: 'Service type is required' });
    }

    // Initialize OpenAI with API key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Handle different services
    switch (service) {
      case 'chatbot':
        return handleChatbot(req, res, openai);
      case 'translate':
        return handleTranslate(req, res, openai);
      case 'summarize':
        return handleSummarize(req, res, openai);
      case 'search-university-info':
        return handleUniversitySearch(req, res, openai);
      case 'university-recommendations':
        return handleUniversityRecommendations(req, res, openai);
      case 'suggest-post':
        return handlePostSuggestion(req, res, openai);
      case 'analyze-material':
        return handleMaterialAnalysis(req, res, openai);
      case 'transcribe':
        return handleTranscription(req, res, openai, processUpload, saveBufferToFile);
      case 'semantic-search':
        return handleSemanticSearch(req, res, openai);
      case 'recommend-communities':
        return handleCommunityRecommendations(req, res, openai);
      case 'research-assistant':
        return handleResearchAssistant(req, res, openai);
      case 'time-management-coach':
        return handleTimeManagementCoach(req, res, openai);
      case 'exam-preparation':
        return handleExamPreparation(req, res, openai);
      case 'peer-review':
        return handlePeerReview(req, res, openai);
      default:
        return res.status(400).json({ error: 'Invalid service type' });
    }
  } catch (error) {
    console.error('Error in AI services API:', error);
    return res.status(500).json({ error: error.message || 'Failed to process request' });
  }
};

// Individual service handlers
async function handleChatbot(req, res, openai) {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
  });

  const reply = response.choices[0]?.message?.content || 'No response generated.';
  
  return res.status(200).json({ reply });
}

async function handleTranslate(req, res, openai) {
  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Text and target language are required' });
  }

  const response = await openai.chat.completions.create({
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

  const translatedText = response.choices[0]?.message?.content || text;
  
  return res.status(200).json({ translatedText });
}

async function handleSummarize(req, res, openai) {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { 
        role: 'system', 
        content: 'You are a helpful assistant that summarizes content for international students.' 
      },
      { 
        role: 'user', 
        content: `Summarize the following post in 2-3 sentences for international students: ${content}` 
      }
    ],
    temperature: 0.7,
  });

  const summary = response.choices[0]?.message?.content || 'No summary generated.';
  
  return res.status(200).json({ summary });
}

async function handleUniversitySearch(req, res, openai) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a university information search assistant. Provide information about universities, scholarships, visa requirements, etc. Include URLs as sources. Format as JSON with results and sources arrays.'
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
  const parsedContent = JSON.parse(content);
  
  return res.status(200).json(parsedContent);
}

async function handleUniversityRecommendations(req, res, openai) {
  const { major, budget, location } = req.body;

  if (!major || !budget || !location) {
    return res.status(400).json({ error: 'Major, budget, and location are required' });
  }

  const response = await openai.chat.completions.create({
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
  const parsedContent = JSON.parse(content);
  
  return res.status(200).json(parsedContent);
}

async function handlePostSuggestion(req, res, openai) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const response = await openai.chat.completions.create({
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
  
  return res.status(200).json({
    title: titleMatch ? titleMatch[1].trim() : 'Suggested Post Title',
    content: bodyMatch ? bodyMatch[1].trim() : 'Suggested post content.'
  });
}

async function handleMaterialAnalysis(req, res, openai) {
  const { text, materialType } = req.body;

  if (!text || !materialType) {
    return res.status(400).json({ error: 'Text and material type are required' });
  }

  const validMaterialTypes = ['essay', 'resume', 'statementOfPurpose'];
  if (!validMaterialTypes.includes(materialType)) {
    return res.status(400).json({ error: 'Invalid material type' });
  }

  const prompts = {
    essay: 'a college application essay',
    resume: 'a student resume for university applications',
    statementOfPurpose: 'a statement of purpose for graduate school'
  };

  const response = await openai.chat.completions.create({
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
  const parsedContent = JSON.parse(content);
  
  return res.status(200).json(parsedContent);
}

async function handleTranscription(req, res, openai, processUpload, saveBufferToFile) {
  // Process the uploaded file
  try {
    await processUpload(req, res);
  } catch (error) {
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  // Save the buffer to a temporary file
  const tempFilePath = await saveBufferToFile(req.file.buffer, 'audio-recording.webm');

  try {
    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    return res.status(200).json({ transcription: transcription.text });
  } catch (error) {
    // Clean up the temporary file in case of error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
}

async function handleSemanticSearch(req, res, openai) {
  const { query, items } = req.body;

  if (!query || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Query and items array are required' });
  }

  // Generate embedding for the query
  const queryEmbeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  
  const queryEmbedding = queryEmbeddingResponse.data[0].embedding;
  
  // Process all items to get their embeddings
  const itemsWithEmbeddings = await Promise.all(
    items.map(async (item) => {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: item.text,
      });
      
      return { ...item, embedding: embeddingResponse.data[0].embedding };
    })
  );
  
  // Calculate similarity scores using cosine similarity
  const results = itemsWithEmbeddings.map((item) => {
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    return { ...item, score };
  });
  
  // Sort by score (descending) and return top results
  const topResults = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ embedding, ...rest }) => rest); // Remove embedding from results
  
  return res.status(200).json({ results: topResults });
}

async function handleCommunityRecommendations(req, res, openai) {
  const { userInteractions, communities } = req.body;

  if (!userInteractions || !Array.isArray(userInteractions) || !communities || !Array.isArray(communities)) {
    return res.status(400).json({ error: 'User interactions and communities arrays are required' });
  }

  // If no interactions or communities, return top 3 communities with 0 score
  if (userInteractions.length === 0 || communities.length === 0) {
    return res.status(200).json({
      recommendations: communities.slice(0, 3).map(community => ({ ...community, score: 0 }))
    });
  }

  // Generate embeddings for user interactions
  const interactionEmbeddings = await Promise.all(
    userInteractions.map(async (interaction) => {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: interaction,
      });
      return response.data[0].embedding;
    })
  );
  
  // Calculate average user profile embedding
  const userProfileEmbedding = interactionEmbeddings[0].map((_, i) => {
    return interactionEmbeddings.reduce((sum, embedding) => sum + embedding[i], 0) / interactionEmbeddings.length;
  });
  
  // Process communities to get their embeddings
  const communitiesWithEmbeddings = await Promise.all(
    communities.map(async (community) => {
      const text = `${community.name} ${community.description || ''}`;
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return { ...community, embedding: response.data[0].embedding };
    })
  );
  
  // Calculate similarity scores using cosine similarity
  const results = communitiesWithEmbeddings.map((community) => {
    const score = cosineSimilarity(userProfileEmbedding, community.embedding);
    return { ...community, score };
  });
  
  // Sort by score (descending) and return top results
  const topRecommendations = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ embedding, ...rest }) => rest); // Remove embedding from results
  
  return res.status(200).json({ recommendations: topRecommendations });
}

async function handleResearchAssistant(req, res, openai) {
  const { 
    task, 
    topic, 
    citationStyle,
    context
  } = req.body;

  if (!task || !topic) {
    return res.status(400).json({ error: 'Task and topic are required' });
  }

  // Prepare system prompt based on task type
  let systemPrompt = 'You are an academic research assistant for international students.';
  let userPrompt = '';

  switch (task) {
    case 'topic-ideas':
      systemPrompt += ' Generate research topic ideas that are specific, researchable, and appropriate for academic work.';
      userPrompt = `Generate 5 research topic ideas related to "${topic}". For each idea, provide a brief explanation of why it's interesting and what research questions could be explored.`;
      break;
    case 'article-summary':
      systemPrompt += ' Summarize academic articles clearly and concisely while preserving key information.';
      userPrompt = `Summarize the following academic text related to "${topic}": ${context}. Include the main argument, key findings, and significance.`;
      break;
    case 'source-suggestions':
      systemPrompt += ' Suggest credible academic sources and databases for research topics.';
      userPrompt = `Suggest 5 credible academic sources or databases for researching "${topic}". For each source, explain why it's valuable and what kind of information it provides.`;
      break;
    case 'citation-formatting':
      systemPrompt += ` Format citations correctly according to ${citationStyle || 'APA'} style guidelines.`;
      userPrompt = `Format the following source information in ${citationStyle || 'APA'} style: ${context}`;
      break;
    case 'research-gaps':
      systemPrompt += ' Identify potential gaps in research and suggest areas for further investigation.';
      userPrompt = `Based on the following research summary about "${topic}": ${context}. Identify 3-5 potential gaps or areas that warrant further investigation.`;
      break;
    default:
      userPrompt = `Provide guidance on researching "${topic}". ${context ? `Context: ${context}` : ''}`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: systemPrompt
      },
      { 
        role: 'user', 
        content: userPrompt
      }
    ],
    temperature: 0.7,
  });

  const assistantResponse = response.choices[0]?.message?.content || 'Unable to generate a response.';
  
  return res.status(200).json({ 
    response: assistantResponse,
    task,
    topic
  });
}

async function handleTimeManagementCoach(req, res, openai) {
  const { 
    task, 
    courses,
    deadlines,
    studyPreference,
    balancePreference
  } = req.body;

  if (!task || !courses) {
    return res.status(400).json({ error: 'Task and courses are required' });
  }

  // Prepare system prompt based on task type
  let systemPrompt = 'You are a time management coach for university students.';
  let userPrompt = '';

  switch (task) {
    case 'weekly-schedule':
      systemPrompt += ' Create a detailed weekly schedule with specific time slots for academic work, personal activities, and rest.';
      userPrompt = `Create a weekly schedule based on these courses: ${courses}. 
      ${deadlines ? `Important deadlines: ${deadlines}` : ''}
      ${studyPreference ? `Study preferences: ${studyPreference}` : ''}
      ${balancePreference ? `The student prefers a ${balancePreference} balance between academics and social life.` : ''}`;
      break;
    case 'study-techniques':
      systemPrompt += ' Recommend effective study techniques based on course content and student preferences.';
      userPrompt = `Recommend study techniques for these courses: ${courses}.
      ${studyPreference ? `Student preferences: ${studyPreference}` : ''}`;
      break;
    case 'work-life-balance':
      systemPrompt += ' Provide tips for maintaining a healthy balance between academics, social life, and self-care.';
      userPrompt = `Suggest ways to balance academic work on these courses: ${courses}
      ${balancePreference ? `with a preference for ${balancePreference} approach to work-life balance.` : ''}`;
      break;
    case 'deadline-tracker':
      systemPrompt += ' Organize assignment deadlines and create a completion plan.';
      userPrompt = `Create a plan to manage these deadlines: ${deadlines} for courses: ${courses}.`;
      break;
    case 'productivity-coach':
      systemPrompt += ' Provide advice to overcome procrastination and stay focused on academic work.';
      userPrompt = `Provide productivity advice for a student taking these courses: ${courses}
      ${studyPreference ? `Student's study preferences: ${studyPreference}` : ''}`;
      break;
    case 'exam-period-planner':
      systemPrompt += ' Create a structured study plan for exam preparation.';
      userPrompt = `Create an exam preparation plan for these courses: ${courses}.
      ${deadlines ? `Exam schedule: ${deadlines}` : ''}
      ${studyPreference ? `Study preferences: ${studyPreference}` : ''}`;
      break;
    default:
      userPrompt = `Provide time management advice for a student taking these courses: ${courses}.`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: systemPrompt
      },
      { 
        role: 'user', 
        content: userPrompt
      }
    ],
    temperature: 0.7,
  });

  const assistantResponse = response.choices[0]?.message?.content || 'Unable to generate a response.';
  
  return res.status(200).json({ 
    response: assistantResponse,
    task,
    courses
  });
}

async function handleExamPreparation(req, res, openai) {
  const { 
    task, 
    courseTitle,
    topics,
    syllabus,
    difficultyLevel,
    questionType
  } = req.body;

  if (!task || !courseTitle || !topics) {
    return res.status(400).json({ error: 'Task, course title, and topics are required' });
  }

  // Prepare system prompt based on task type
  let systemPrompt = 'You are an exam preparation assistant for university students.';
  let userPrompt = '';

  switch (task) {
    case 'practice-questions':
      systemPrompt += ` Generate ${questionType || 'multiple-choice'} questions at ${difficultyLevel || 'moderate'} difficulty level. Include correct answers and explanations.`;
      userPrompt = `Create 5 ${difficultyLevel || 'moderate'} difficulty ${questionType || 'multiple-choice'} questions about these topics for the course "${courseTitle}": ${topics}.
      ${syllabus ? `Additional information from the syllabus: ${syllabus}` : ''}`;
      break;
    case 'study-guide':
      systemPrompt += ' Create a comprehensive study guide with key concepts, definitions, formulas, and example problems.';
      userPrompt = `Create a study guide for the course "${courseTitle}" covering these topics: ${topics}.
      ${syllabus ? `Additional information from the syllabus: ${syllabus}` : ''}`;
      break;
    case 'mock-exam':
      systemPrompt += ' Create a timed mock exam with a mix of question types.';
      userPrompt = `Create a mock exam for the course "${courseTitle}" covering these topics: ${topics}.
      ${syllabus ? `Additional information from the syllabus: ${syllabus}` : ''}
      Include a mix of ${questionType || 'multiple-choice'} questions at ${difficultyLevel || 'moderate'} difficulty.`;
      break;
    default:
      userPrompt = `Provide exam preparation materials for the course "${courseTitle}" covering these topics: ${topics}.`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: systemPrompt
      },
      { 
        role: 'user', 
        content: userPrompt
      }
    ],
    temperature: 0.7,
  });

  const assistantResponse = response.choices[0]?.message?.content || 'Unable to generate a response.';
  
  return res.status(200).json({ 
    response: assistantResponse,
    task,
    courseTitle
  });
}

async function handlePeerReview(req, res, openai) {
  const { 
    assignmentType,
    title,
    courseName,
    instructions,
    draftText,
    academicLevel,
    feedbackFocus,
    task
  } = req.body;

  if (!draftText || !title) {
    return res.status(400).json({ error: 'Draft text and title are required' });
  }

  // Prepare system prompt based on task
  let systemPrompt = '';
  let userPrompt = '';

  if (task === 'improved-version') {
    systemPrompt = `You are an expert editor who improves academic writing. Create an improved version of the text that addresses common issues while maintaining the original voice and intent.`;
    userPrompt = `Improve this ${assignmentType || 'essay'} titled "${title}" for the course "${courseName || 'a university course'}".
    ${instructions ? `Assignment instructions: ${instructions}` : ''}
    
    Original draft:
    ${draftText}
    
    Create an improved version that enhances clarity, coherence, argument strength, and language quality.`;
  } else {
    systemPrompt = `You are an expert peer reviewer for ${academicLevel || 'undergraduate'} level ${assignmentType || 'essay'}s. 
    Provide constructive feedback focusing on clarity, coherence, argument strength, evidence, and language. 
    The feedback should be ${feedbackFocus === 'supportive' ? 'very supportive and encouraging' : 
    feedbackFocus === 'critical' ? 'critical and detailed' : 'balanced with both strengths and areas for improvement'}.
    
    Structure your response with:
    1. Overall assessment
    2. Strengths
    3. Areas for improvement
    4. Suggestions
    5. A numerical score (1-5) for clarity, coherence, argument, evidence, and language`;
    
    userPrompt = `Please review this ${assignmentType || 'essay'} titled "${title}" for the course "${courseName || 'a university course'}".
    ${instructions ? `Assignment instructions: ${instructions}` : ''}
    
    Draft content:
    ${draftText}`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: systemPrompt
      },
      { 
        role: 'user', 
        content: userPrompt
      }
    ],
    temperature: 0.7,
  });

  const assistantResponse = response.choices[0]?.message?.content || 'Unable to generate a response.';
  
  return res.status(200).json({ 
    response: assistantResponse,
    task: task || 'feedback',
    title
  });
}
