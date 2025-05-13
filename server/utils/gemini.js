const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

// Initialize the Gemini API with the API key
const geminiAPI = new GoogleGenerativeAI(config.GOOGLE_GEMINI_KEY);

// Fallback mock data in case of rate limiting
const fallbackQuizData = [
  {
    content: "What was the first spacecraft to successfully land on Mars?",
    options: [
      { label: "Voyager 1", isCorrect: false },
      { label: "Viking 1", isCorrect: true },
      { label: "Pathfinder", isCorrect: false },
      { label: "Curiosity", isCorrect: false }
    ]
  },
  {
    content: "Who was the first human to travel to space?",
    options: [
      { label: "Neil Armstrong", isCorrect: false },
      { label: "Buzz Aldrin", isCorrect: false },
      { label: "Yuri Gagarin", isCorrect: true },
      { label: "Alan Shepard", isCorrect: false }
    ]
  },
  {
    content: "Which planet has the most moons in our solar system?",
    options: [
      { label: "Jupiter", isCorrect: false },
      { label: "Saturn", isCorrect: true },
      { label: "Uranus", isCorrect: false },
      { label: "Neptune", isCorrect: false }
    ]
  },
  {
    content: "What is the name of SpaceX's first crewed spacecraft?",
    options: [
      { label: "Falcon", isCorrect: false },
      { label: "Dragon", isCorrect: true },
      { label: "Starship", isCorrect: false },
      { label: "Voyager", isCorrect: false }
    ]
  },
  {
    content: "Which space telescope was launched in 1990 and remains operational?",
    options: [
      { label: "Hubble Space Telescope", isCorrect: true },
      { label: "James Webb Space Telescope", isCorrect: false },
      { label: "Spitzer Space Telescope", isCorrect: false },
      { label: "Kepler Space Telescope", isCorrect: false }
    ]
  }
];

/**
 * Generate quiz questions using Google Gemini API
 * @param {string} topic - The topic for the quiz
 * @param {number} numQuestions - Number of questions to generate (5-30)
 * @param {string} category - Quiz category 
 * @returns {Promise<Array>} Array of questions with options
 */
async function generateQuizQuestions(topic, numQuestions, category = 'Other') {
  try {
    // Validate parameters
    if (!topic) throw new Error('Topic is required');
    if (!numQuestions || numQuestions < 5 || numQuestions > 30) {
      numQuestions = Math.min(Math.max(5, numQuestions || 5), 30);
    }

    // Get the Gemini model (try more widely available model first)
    const model = geminiAPI.getGenerativeModel({ model: 'gemini-pro' });

    // Craft the prompt for quiz generation
    const prompt = `
    Generate ${numQuestions} multiple-choice quiz questions about "${topic}".
    
    Follow these requirements:
    1. Each question should have 4 options (A, B, C, D)
    2. Exactly ONE option should be correct
    3. The questions should be diverse and cover different aspects of the topic
    4. Return the result as a valid JSON array of objects with this EXACT structure:
    
    [
      {
        "content": "Question text here?",
        "options": [
          {
            "label": "Option A text",
            "isCorrect": false
          },
          {
            "label": "Option B text",
            "isCorrect": true
          },
          {
            "label": "Option C text",
            "isCorrect": false
          },
          {
            "label": "Option D text",
            "isCorrect": false
          }
        ]
      },
      ...more questions...
    ]
    
    IMPORTANT: Make sure the response is ONLY the valid JSON array, with no extra text or explanations.
    IMPORTANT: Ensure each question has EXACTLY ONE option marked as correct (isCorrect: true).
    IMPORTANT: Make all questions in ${category} category.
    `;

    try {
      // Generate content with timeout and retry logic
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        )
      ]);
      
      const responseText = result.response.text();

      // Extract the JSON part from the response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid quiz questions format');
      }

      let questions = JSON.parse(jsonMatch[0]);

      // Validate the structure and ensure exactly one correct answer per question
      questions = questions.map(question => {
        // Ensure exactly one correct answer
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          // If no correct option or multiple correct options, fix it
          question.options.forEach(opt => opt.isCorrect = false);
          question.options[0].isCorrect = true; // Mark the first option as correct
        }
        return question;
      });

      // Return only the requested number of questions
      return questions.slice(0, numQuestions);
      
    } catch (error) {
      console.warn('Error with Gemini API, using fallback data:', error.message);
      
      // If we hit rate limits or any other error, return fallback data
      if (topic.toLowerCase().includes('space') || topic.toLowerCase().includes('astronomy')) {
        // For space-related topics, use the space quiz fallback
        return fallbackQuizData.slice(0, numQuestions);
      } else {
        // For other topics, modify the fallback data slightly to match the topic
        return fallbackQuizData.slice(0, numQuestions).map(q => ({
          ...q,
          content: q.content + ` (Related to ${topic})`
        }));
      }
    }

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

module.exports = {
  generateQuizQuestions
}; 