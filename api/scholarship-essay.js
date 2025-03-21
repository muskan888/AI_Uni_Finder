
import OpenAI from 'openai';

export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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

    const { 
      task,
      scholarshipType,
      essayPrompt,
      essayTopic,
      wordCount,
      personalBackground,
      achievements,
      academicPlans,
      tone,
      focusArea
    } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task parameter is required' });
    }

    // Initialize OpenAI with API key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare system prompt based on task type
    let systemPrompt = 'You are a scholarship application consultant for university students.';
    let userPrompt = '';

    switch (task) {
      case 'brainstorm':
        if (!scholarshipType) {
          return res.status(400).json({ error: 'Scholarship type is required for brainstorming' });
        }
        
        systemPrompt += ' Generate creative and compelling essay topic ideas for scholarships.';
        userPrompt = `Provide 5 unique scholarship essay ideas for ${scholarshipType} scholarships. 
        For each idea, include:
        1. A clear prompt
        2. A brief description of what the prompt is asking for
        3. A short example of how a student might begin answering it
        ${personalBackground ? `The student's background is: ${personalBackground}` : ''}`;
        break;
        
      case 'outline':
        if (!essayPrompt && !essayTopic) {
          return res.status(400).json({ error: 'Essay prompt or topic is required for outline generation' });
        }
        
        systemPrompt += ' Create detailed outlines for scholarship essays.';
        userPrompt = `Create an outline for a scholarship essay on this topic: "${essayPrompt || essayTopic}".
        ${personalBackground ? `Student background: ${personalBackground}` : ''}
        ${achievements ? `Student achievements: ${achievements}` : ''}
        ${academicPlans ? `Student's academic plans: ${academicPlans}` : ''}
        
        Include sections for introduction, body paragraphs, and conclusion with bullet points for key content in each section.`;
        break;
        
      case 'full-essay':
        if ((!essayPrompt && !essayTopic) || !personalBackground) {
          return res.status(400).json({ error: 'Essay prompt/topic and personal background are required for essay generation' });
        }
        
        systemPrompt += ` Create compelling scholarship essays with a ${tone || 'professional'} tone that focus on ${getFocusDescription(focusArea)}.`;
        userPrompt = `Write a scholarship essay of approximately ${wordCount || 500} words for this prompt: "${essayPrompt || essayTopic}".
        
        About the student:
        Background: ${personalBackground}
        ${achievements ? `Achievements: ${achievements}` : ''}
        ${academicPlans ? `Academic/Career plans: ${academicPlans}` : ''}`;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid task type' });
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
      task
    });
  } catch (error) {
    console.error('Error in scholarship essay API:', error);
    return res.status(500).json({ error: error.message || 'Failed to process request' });
  }
};

function getFocusDescription(focus) {
  switch (focus) {
    case 'personal-growth':
      return 'personal growth, challenges overcome, and character development';
    case 'community-impact':
      return 'community service, leadership, and positive impact on others';
    case 'academic-achievements':
      return 'academic accomplishments, intellectual curiosity, and educational goals';
    default:
      return 'a balance of personal qualities, achievements, and future goals';
  }
}
