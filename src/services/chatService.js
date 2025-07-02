/**
 * Chat Service for LiveChat feature
 * This service handles all API interactions for the chat functionality
 */

import { API_BASE_URL } from '../constants/api';

// API endpoint for chat
const CHAT_API_ENDPOINT = `${API_BASE_URL}/chat/query`;

// Local storage key for chat history
const CHAT_HISTORY_KEY = 'healthnet_chat_history';

// Helper function to ensure IDs are strings
const ensureStringId = (id) => {
  if (id === null || id === undefined) {
    return null;
  }
  return String(id);
};

/**
 * Sends a message to the chat API and returns the response
 * @param {string} message - The user's message
 * @param {string} userId - Optional user identifier
 * @param {Array} conversationHistory - Optional array of previous messages for context
 * @param {string} model - Optional model parameter (FAST or THINKING)
 * @returns {Promise<Object>} - The API response
 */
export const sendChatMessage = async (message, userId = null, conversationHistory = [], model = 'FAST') => {
  try {
    // DEBUGGING: Log initial parameters
    console.log('=== CHAT DEBUG: Initial Parameters ===');
    console.log('Message:', message);
    console.log('UserID:', userId);
    console.log('Model:', model);
    console.log('ConversationHistory Length:', conversationHistory.length);
    
    // Store conversation in local storage if user is logged in
    if (userId) {
      const history = {
        userId,
        messages: [...conversationHistory, { text: message, sender: 'user', timestamp: new Date() }]
      };
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    }

    // Get auth token
    const authToken = localStorage.getItem('authToken');
    
    // DEBUGGING: Log authentication information
    console.log('=== CHAT DEBUG: Authentication Info ===');
    console.log('Auth Token Present:', !!authToken);
    console.log('All localStorage keys:', Object.keys(localStorage));    // Prepare request body - include query and model
    const requestBody = { 
      query: message,
      model: model
    };
    
    // DEBUGGING: Log the final request
    console.log('=== CHAT DEBUG: API REQUEST ===');
    console.log('Endpoint:', CHAT_API_ENDPOINT);
    console.log('Method: POST');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    });
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));    console.log('Model value being sent:', model);    // Create AbortController with 10-minute timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600000); // 10 minutes timeout

    // Make API call with abort signal
    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    // Clear the timeout since we got a response
    clearTimeout(timeout);

    // DEBUGGING: Log response status
    console.log('=== CHAT DEBUG: API RESPONSE STATUS ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries([...response.headers]));    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error response:', errorText);
      if (response.status === 503) {
        throw new Error('The request is taking longer than expected (longer than 10 minutes). Please try again with a simpler query.');
      }
      throw new Error(`Chat API error: ${errorText}`);
    }

    const data = await response.json();
    
    // DEBUGGING: Log API response data
    console.log('=== CHAT DEBUG: API RESPONSE DATA ===');
    console.log('Response:', data);

    // Format the response
    const formattedResponse = {
      message: data.response || "I apologize, but I couldn't process your request at this time.",
      timestamp: new Date().toISOString(),
      isBot: true,
      userId: userId || 'anonymous',
      messageId: generateRandomId()
    };

    // Store bot response in history if user is logged in
    if (userId) {
      const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{"messages":[]}');
      history.messages.push({
        text: formattedResponse.message,
        sender: 'bot',
        timestamp: formattedResponse.timestamp
      });
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    }

    return formattedResponse;
  } catch (error) {
    console.error('=== CHAT DEBUG: ERROR ===');
    console.error('Error in chat service:', error);
    throw error;
  }
};

/**
 * Clears the chat history from local storage
 */
export const clearChatHistory = () => {
  localStorage.removeItem(CHAT_HISTORY_KEY);
};

/**
 * Retrieves the stored chat history for a user
 * @param {string} userId - The user's ID
 * @returns {Array} - The chat history or empty array if none exists
 */
export const getChatHistory = (userId) => {
  try {
    const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '{"messages":[]}');
    return history.userId === userId ? history.messages : [];
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
};

/**
 * Generates a random ID for messages
 * @returns {string} - A random ID
 */
const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 12);
};

export default {
  sendChatMessage,
  clearChatHistory,
  getChatHistory
}; 