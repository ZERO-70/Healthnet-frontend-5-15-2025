import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiUser, FiChevronDown, FiChevronUp, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { sendChatMessage, clearChatHistory } from '../services/chatService';
import '../styles/LiveChat.css';

// Helper function to ensure proper role and ID
const verifyRoleAndId = () => {
    // Check for an authentication token
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.log('DEBUG: No auth token found, no role verification needed');
        if (localStorage.getItem('role')) {
            console.log('DEBUG: Removing leftover role without auth token');
            localStorage.removeItem('role');
        }
        return;
    }
    
    // Get user role from various possible sources
    const userRole = localStorage.getItem('role') || 
                    localStorage.getItem('userRole')?.toLowerCase();
    
    // Check for IDs in various formats
    const patientId = localStorage.getItem('patientId');
    const doctorId = localStorage.getItem('doctorId');
    const staffId = localStorage.getItem('staffId');
    const adminId = localStorage.getItem('adminId');
    
    console.log('DEBUG: Role Verification - Current State:', { 
        authToken: !!authToken,
        userRole,
        patientId,
        doctorId,
        staffId,
        adminId
    });
    
    // Check if the role is valid (has a corresponding ID)
    if (userRole === 'patient' && !patientId) {
        console.warn('DEBUG: Patient role found but no ID. Role may be invalid.');
    } else if (userRole === 'doctor' && !doctorId) {
        console.warn('DEBUG: Doctor role found but no ID. Role may be invalid.');
    } else if (userRole === 'staff' && !staffId) {
        console.warn('DEBUG: Staff role found but no ID. Role may be invalid.');
    } else if (userRole === 'admin' && !adminId) {
        console.warn('DEBUG: Admin role found but no ID. Role may be invalid.');
    }
    
    // Determine the correct role based on available IDs
    if (patientId && (!userRole || userRole !== 'patient')) {
        console.log('DEBUG: Setting role to patient based on patientId');
        localStorage.setItem('role', 'patient');
    } else if (doctorId && (!userRole || userRole !== 'doctor')) {
        console.log('DEBUG: Setting role to doctor based on doctorId');
        localStorage.setItem('role', 'doctor');
    } else if (staffId && (!userRole || userRole !== 'staff')) {
        console.log('DEBUG: Setting role to staff based on staffId');
        localStorage.setItem('role', 'staff');
    } else if (adminId && (!userRole || userRole !== 'admin')) {
        console.log('DEBUG: Setting role to admin based on adminId');
        localStorage.setItem('role', 'admin');
    } else if (!userRole && (patientId || doctorId || staffId || adminId)) {
        // If we have an ID but no role, try to determine role
        if (patientId) {
            console.log('DEBUG: Setting role to patient based on patientId');
            localStorage.setItem('role', 'patient');
        } else if (doctorId) {
            console.log('DEBUG: Setting role to doctor based on doctorId');
            localStorage.setItem('role', 'doctor');
        } else if (staffId) {
            console.log('DEBUG: Setting role to staff based on staffId');
            localStorage.setItem('role', 'staff');
        } else if (adminId) {
            console.log('DEBUG: Setting role to admin based on adminId');
            localStorage.setItem('role', 'admin');
        }
    }
    
    // Handle userRole if it exists but role doesn't
    if (!localStorage.getItem('role') && localStorage.getItem('userRole')) {
        const legacyRole = localStorage.getItem('userRole').toLowerCase();
        console.log('DEBUG: Converting legacy userRole to role:', legacyRole);
        localStorage.setItem('role', legacyRole);
    }
};

// Helper component for formatting medical advice messages
const MedicalAdviceMessage = ({ text }) => {
    // Initialize with first section expanded
    const initialExpandedState = { 0: true };
    const [expandedSections, setExpandedSections] = useState(initialExpandedState);

    // Function to process medical advice text
    const processText = (text) => {
        // Remove any # characters
        const cleanText = text.replace(/#/g, '');
        
        // Split text into sections based on common medical advice patterns
        const sections = cleanText.split(/(?=\n(?:Assessment|Recommendations|Medical History|Vital Signs|Lab Results|Advice|Note|Warning):)/)
            .map(section => section.trim())
            .filter(Boolean);

        // Parse sections into structured format
        return sections.map(section => {
            const lines = section.split('\n');
            const header = lines[0].includes(':') ? lines[0] : null;
            const content = header ? lines.slice(1) : lines;
            return {
                header,
                content: content.join('\n').trim()
            };
        });
    };

    // Parse the medical advice
    const sections = processText(text);
    
    // Toggle section expansion
    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Helper to determine header CSS class
    const getHeaderClass = (header) => {
        if (!header) return '';
        
        const headerText = header.toLowerCase();
        if (headerText.includes('warning') || headerText.includes('caution')) {
            return 'section-header-warning';
        } else if (headerText.includes('assessment') || headerText.includes('diagnosis')) {
            return 'section-header-assessment';
        } else if (headerText.includes('recommendations') || headerText.includes('advice')) {
            return 'section-header-recommendations';
        } else if (headerText.includes('vital signs') || headerText.includes('vitals')) {
            return 'section-header-vitals';
        }
        return '';
    };

    // Format markdown text (bold, etc.)
    const formatMarkdown = (text) => {
        // Replace ** bold ** with <strong> tags 
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Replace __underline__ with <u> tags
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
        
        // Replace _italic_ with <em> tags
        formattedText = formattedText.replace(/\b_([^_]+)_\b/g, '<em>$1</em>');
        
        return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
    };

    // Check if this is likely a medical advice response
    const isMedicalAdvice = text.includes('Assessment:') || 
                           text.includes('Diagnosis:') || 
                           text.includes('Medical History:') ||
                           text.includes('Recommendations:') ||
                           text.includes('Vital Signs:');

    // If not medical advice, return simple formatted text
    if (!isMedicalAdvice) {
        return (
            <div className="simple-message">
                {text.split('\n').map((line, i) => (
                    <div key={i}>{formatMarkdown(line)}</div>
                ))}
            </div>
        );
    }

    return (
        <div className="medical-advice-card">
            {sections.map((section, index) => (
                <div key={index} className="advice-section">
                    {section.header ? (
                        <>
                            <div 
                                className={`section-header ${getHeaderClass(section.header)}`}
                                onClick={() => toggleSection(index)}
                            >
                                <h3>{section.header}</h3>
                                {section.content && (
                                    <button className="toggle-button">
                                        {expandedSections[index] ? <FiChevronUp /> : <FiChevronDown />}
                                    </button>
                                )}
                            </div>
                            {section.content && (
                                <div className={`section-content ${expandedSections[index] ? 'expanded' : ''}`}>
                                    {section.content.split('\n').map((line, lineIndex) => (
                                        <p key={lineIndex}>{formatMarkdown(line)}</p>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="section-content no-header">
                            {section.content.split('\n').map((line, lineIndex) => (
                                <p key={lineIndex}>{formatMarkdown(line)}</p>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const LiveChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
    const [userRole, setUserRole] = useState(localStorage.getItem('role'));
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const messagesEndRef = useRef(null);
    
    // Log component rendering and state
    useEffect(() => {
        console.log('LiveChat component rendering');
        console.log('LiveChat state:', {
            isOpen,
            isMaximized,
            messagesCount: messages.length,
            isTyping,
            isLoadingHistory,
            isVisible,
            authToken: authToken ? 'Present' : 'None',
            userRole
        });
    }, [isOpen, isMaximized, messages, isTyping, isLoadingHistory, isVisible, authToken, userRole]);
    
    // Verify role and ID setup
    useEffect(() => {
        console.log('LiveChat: verifying role and ID');
        verifyRoleAndId();
    }, []);
    
    // Load chat history when chat opens
    useEffect(() => {
        console.log('LiveChat: isOpen changed to', isOpen);
        console.log('LiveChat: authToken present?', !!authToken);
        if (isOpen && authToken) {
            console.log('LiveChat: Conditions met to fetch chat history');
            fetchChatHistory();
        }
    }, [isOpen, authToken]);
    
    // Fetch chat history from the server
    const fetchChatHistory = async () => {
        console.log('LiveChat: fetchChatHistory called');
        setIsLoadingHistory(true);
        try {
            console.log('Fetching chat history...');
            const headers = { 
                'Authorization': `Bearer ${authToken}`, 
                'Content-Type': 'application/json' 
            };
            
            console.log('Using headers:', headers);
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/chat/getmine', {
                method: 'GET',
                headers
            });
            
            console.log('Chat history response status:', response.status);
            
            if (!response.ok) {
                console.error('Error fetching chat history:', response.statusText);
                throw new Error(`Failed to fetch chat history: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Fetched chat history (raw):', data);
            
            if (Array.isArray(data) && data.length > 0) {
                // Clear out any existing messages first
                const processedMessages = [];
                
                // Process each chat message
                data.forEach((chat, index) => {
                    console.log(`Processing chat item ${index}:`, chat);
                    
                    // Check if we have either request or message_text 
                    const userMessage = chat.request || chat.message_text || chat.messageText;
                    
                    // Check if we have response
                    const botResponse = chat.response;
                    
                    if (userMessage) {
                        // Add user message
                        processedMessages.push({
                            id: `history-user-${index}`,
                            text: userMessage,
                            sender: 'user',
                            timestamp: new Date(chat.timestamp || chat.createdAt || Date.now())
                        });
                        
                        console.log(`Added user message: ${userMessage}`);
                    }
                    
                    if (botResponse) {
                        // Add bot response if available
                        processedMessages.push({
                            id: `history-bot-${index}`,
                            text: botResponse,
                            sender: 'bot',
                            timestamp: new Date(chat.timestamp ? new Date(chat.timestamp).getTime() + 1000 : Date.now())
                        });
                        
                        console.log(`Added bot response: ${botResponse.substring(0, 30)}...`);
                    }
                });
                
                console.log('Processed messages:', processedMessages);
                
                // Add a divider message to indicate previous chat history
                const dividerMessage = {
                    id: 'divider',
                    text: 'Previous conversation history',
                    sender: 'system',
                    timestamp: new Date()
                };
                
                // Sort messages by timestamp (oldest first)
                processedMessages.sort((a, b) => a.timestamp - b.timestamp);
                
                // If we have processed messages, set them as our messages
                if (processedMessages.length > 0) {
                    console.log('Setting processed messages with divider');
                    setMessages([...processedMessages, dividerMessage]);
                } else {
                    // Add welcome message if no processed messages
                    console.log('No processed messages, adding welcome message');
                    addWelcomeMessage();
                }
            } else {
                // Add welcome message if no history
                console.log('No history data or empty array, adding welcome message');
                addWelcomeMessage();
            }
        } catch (error) {
            console.error('Error in fetchChatHistory:', error);
            // Add welcome message if error
            addWelcomeMessage();
        } finally {
            setIsLoadingHistory(false);
        }
    };
    
    // Helper to add welcome message
    const addWelcomeMessage = () => {
        const welcomeMessage = {
            id: 1,
            text: authToken 
                ? `Welcome back! How can I assist you${userRole ? ` as a ${userRole}` : ''}?`
                : 'Welcome to HealthNet LiveChat! How can we assist you today?',
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    };
    
    // Debug auth state
    useEffect(() => {
        const logAuthState = () => {
            verifyRoleAndId(); // Ensure role is correctly set
            
            const token = localStorage.getItem('authToken');
            const role = localStorage.getItem('role');
            const patientId = localStorage.getItem('patientId');
            const doctorId = localStorage.getItem('doctorId');
            const staffId = localStorage.getItem('staffId');
            const adminId = localStorage.getItem('adminId');
            
            console.log('LiveChat Auth State:', {
                authToken: token ? 'Present' : 'None',
                role,
                patientId,
                doctorId,
                staffId,
                adminId
            });
        };
        
        logAuthState();
    }, [authToken, userRole]);

    // Monitor auth state changes
    useEffect(() => {
        const checkAuth = () => {
            const currentToken = localStorage.getItem('authToken');
            const currentRole = localStorage.getItem('role');
            
            if (currentToken !== authToken || currentRole !== userRole) {
                // Auth state changed, reset chat
                setAuthToken(currentToken);
                setUserRole(currentRole);
                resetChat();
                
                // Log auth state change
                console.log('Auth state changed:', {
                    tokenChanged: currentToken !== authToken,
                    roleChanged: currentRole !== userRole,
                    newToken: currentToken ? 'Present' : 'None',
                    newRole: currentRole
                });
            }
        };

        // Check immediately
        checkAuth();

        // Set up interval to check auth state
        const interval = setInterval(checkAuth, 1000);

        return () => clearInterval(interval);
    }, [authToken, userRole]);

    // Add keyboard event listener for ESC key
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                if (isMaximized) {
                    setIsMaximized(false);
                } else if (isOpen) {
                    setIsOpen(false);
                }
            }
        };
        
        window.addEventListener('keydown', handleEscKey);
        
        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, isMaximized]);

    // Reset chat function
    const resetChat = () => {
        setMessages([]);
        setCurrentMessage('');
        setIsTyping(false);
        clearChatHistory();
        
        // If chat is open, add new welcome message
        if (isOpen) {
            const welcomeMessage = {
                id: 1,
                text: authToken 
                    ? `Welcome back! How can I assist you${userRole ? ` as a ${userRole}` : ''}?`
                    : 'Welcome to HealthNet LiveChat! How can we assist you today?',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
        }
    };
    
    // Auto-scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const toggleChat = () => {
        setIsOpen(!isOpen);
        
        // When opening chat, add welcome message if no messages exist
        if (!isOpen && messages.length === 0) {
            addWelcomeMessage();
        }
    };

    // Toggle maximize/minimize state
    const toggleMaximize = (e) => {
        e.stopPropagation();
        setIsMaximized(!isMaximized);
    };
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!currentMessage.trim()) return;
        
        // Generate unique ID for new message
        const newMessageId = Date.now();
        
        // Add user message to chat
        const userMessage = {
            id: newMessageId,
            text: currentMessage,
            sender: 'user',
            timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setCurrentMessage('');
        setIsTyping(true);
        
        try {
            // Get conversation history for context (limited to last 10 messages)
            const conversationHistory = messages
                .filter(msg => msg.sender !== 'system') // Filter out system messages
                .slice(-10)
                .map(msg => ({
                text: msg.text,
                sender: msg.sender,
                timestamp: msg.timestamp
            }));
            
            // Get user ID based on role
            let userId = null;
            if (userRole) {
                switch (userRole.toLowerCase()) {
                    case 'patient':
                        userId = localStorage.getItem('patientId');
                        break;
                    case 'doctor':
                        userId = localStorage.getItem('doctorId');
                        break;
                    case 'staff':
                        userId = localStorage.getItem('staffId');
                        break;
                    case 'admin':
                        userId = localStorage.getItem('adminId');
                        break;
                }
            }
            
            // Call the chat service
            const response = await sendChatMessage(
                currentMessage, 
                userId,
                conversationHistory
            );
            
            // Add bot response to chat
            const botResponse = {
                id: newMessageId + 1,
                text: response.message,
                sender: 'bot',
                timestamp: new Date(response.timestamp)
            };
            
            setMessages(prevMessages => [...prevMessages, botResponse]);
            setIsTyping(false);
            
        } catch (error) {
            console.error('Error sending message:', error);
            setIsTyping(false);
            
            // Add error message
            const errorMessage = {
                id: newMessageId + 1,
                text: 'Sorry, there was an error processing your request. Please try again.',
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
    };
    
    // Format timestamp
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return (
        <>
            {/* Floating chat button */}
            <motion.button 
                className="live-chat-button"
                onClick={toggleChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ display: isMaximized ? 'none' : 'flex' }}
            >
                {isOpen ? <FiX /> : <FiMessageSquare />}
            </motion.button>
            
            {/* Chat window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className={`live-chat-container ${isMaximized ? 'maximized' : ''}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="live-chat-header">
                            <h3>HealthNet Support</h3>
                            <div className="header-buttons">
                                <button className="maximize-button" onClick={toggleMaximize}>
                                    {isMaximized ? <FiMinimize2 /> : <FiMaximize2 />}
                                </button>
                            <button className="close-button" onClick={toggleChat}>
                                <FiX />
                            </button>
                            </div>
                        </div>
                        
                        <div className="live-chat-messages">
                            {isLoadingHistory && (
                                <div className="message-container bot-message">
                                    <div className="message-avatar">
                                        <img src="/chat-logo.svg" alt="HealthNet" />
                                    </div>
                                    <div className="message bot typing">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <div className="message-time">Loading chat history...</div>
                                    </div>
                                </div>
                            )}
                            
                            {messages.map((message, index) => (
                                <div 
                                    key={message.id} 
                                    className={`message-container ${
                                        message.sender === 'system' 
                                            ? 'system-message' 
                                            : message.sender === 'user' 
                                                ? 'user-message' 
                                                : 'bot-message'
                                    }`}
                                >
                                    {message.sender === 'bot' && (
                                        <div className="message-avatar">
                                            <img src="/chat-logo.svg" alt="HealthNet" />
                                        </div>
                                    )}
                                    <div className={`message ${message.sender}`}>
                                        <div className="message-text">
                                            {message.sender === 'bot' ? (
                                                <MedicalAdviceMessage text={message.text} />
                                            ) : (
                                                message.text
                                            )}
                                        </div>
                                        {message.sender !== 'system' && (
                                        <div className="message-time">{formatTime(message.timestamp)}</div>
                                        )}
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="message-avatar user">
                                            <FiUser />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="message-container bot-message">
                                    <div className="message-avatar">
                                        <img src="/chat-logo.svg" alt="HealthNet" />
                                    </div>
                                    <div className="message bot typing">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <form className="live-chat-input" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type your message here..."
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                disabled={!currentMessage.trim()}
                                className={!currentMessage.trim() ? 'disabled' : ''}
                            >
                                <FiSend />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LiveChat; 