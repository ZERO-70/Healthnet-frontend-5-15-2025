import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi';
import '../styles/GenerateAdvice.css';

const GenerateAdvice = ({ onAdviceGenerated, patientId }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, completed, error
    const [statusMessage, setStatusMessage] = useState('');
    const [pollInterval, setPollInterval] = useState(null);

    // Clean up polling interval on unmount
    useEffect(() => {
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [pollInterval]);

    const handleGenerateAdvice = async () => {
        setIsGenerating(true);
        setGenerationStatus('generating');
        setStatusMessage('Starting AI analysis of your medical profile...');

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token missing');
            }

            // Start advice generation
            const response = await fetch('http://localhost:8081/suggestion/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Generation started:', data);
                setStatusMessage('AI is analyzing your medical data to create personalized advice...');
                
                // Start polling for completion
                startPollingForCompletion();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start advice generation');
            }
        } catch (error) {
            console.error('Error starting advice generation:', error);
            setGenerationStatus('error');
            setStatusMessage(error.message || 'Failed to generate advice. Please try again.');
            setIsGenerating(false);
        }
    };

    const startPollingForCompletion = () => {
        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('http://localhost:8081/suggestion/generation-status', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.status === 'completed') {
                        clearInterval(interval);
                        setPollInterval(null);
                        setGenerationStatus('completed');
                        setStatusMessage('Your personalized medical advice is ready!');
                        setIsGenerating(false);
                        
                        // Notify parent component
                        if (onAdviceGenerated && data.suggestion) {
                            onAdviceGenerated(data.suggestion);
                        }
                        
                        // Auto-reset after 3 seconds
                        setTimeout(() => {
                            setGenerationStatus('idle');
                            setStatusMessage('');
                        }, 3000);
                        
                    } else if (data.status === 'generating') {
                        setStatusMessage(data.message || 'AI is processing your medical information...');
                    }
                } else {
                    throw new Error('Failed to check generation status');
                }
            } catch (error) {
                console.error('Error checking generation status:', error);
                clearInterval(interval);
                setPollInterval(null);
                setGenerationStatus('error');
                setStatusMessage('Error checking generation status. Please refresh and try again.');
                setIsGenerating(false);
            }
        }, 5000); // Poll every 5 seconds

        setPollInterval(interval);

        // Stop polling after 10 minutes (timeout)
        setTimeout(() => {
            if (interval) {
                clearInterval(interval);
                setPollInterval(null);
                if (generationStatus === 'generating') {
                    setGenerationStatus('error');
                    setStatusMessage('Generation timeout. The AI service may be busy. Please try again later.');
                    setIsGenerating(false);
                }
            }
        }, 600000); // 10 minutes timeout
    };

    const resetStatus = () => {
        setGenerationStatus('idle');
        setStatusMessage('');
        setIsGenerating(false);
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
        }
    };

    const getButtonIcon = () => {
        switch (generationStatus) {
            case 'generating':
                return (
                    <div className="generating-animation">
                        <div className="pulse-dot"></div>
                        <div className="pulse-dot"></div>
                        <div className="pulse-dot"></div>
                    </div>
                );
            case 'completed':
                return <FiCheck className="btn-icon success" />;
            case 'error':
                return <FiAlertCircle className="btn-icon error" />;
            default:
                return <FiCpu className="btn-icon" />;
        }
    };

    const getButtonText = () => {
        switch (generationStatus) {
            case 'generating':
                return 'Generating AI Advice...';
            case 'completed':
                return 'Advice Generated!';
            case 'error':
                return 'Try Again';
            default:
                return 'Generate AI Medical Advice';
        }
    };

    return (
        <div className="generate-advice-container">
            <motion.button
                className={`generate-advice-btn ${generationStatus}`}
                onClick={generationStatus === 'error' ? resetStatus : handleGenerateAdvice}
                disabled={isGenerating}
                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="btn-content">
                    {getButtonIcon()}
                    <span className="btn-text">{getButtonText()}</span>
                </div>
            </motion.button>
            
            <AnimatePresence>
                {statusMessage && (
                    <motion.div 
                        className={`status-message ${generationStatus}`}
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="status-content">
                            {generationStatus === 'generating' && <FiClock className="status-icon rotating" />}
                            {generationStatus === 'completed' && <FiCheck className="status-icon" />}
                            {generationStatus === 'error' && <FiAlertCircle className="status-icon" />}
                            <span className="status-text">{statusMessage}</span>
                        </div>
                        {generationStatus === 'generating' && (
                            <div className="progress-bar">
                                <div className="progress-fill"></div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GenerateAdvice;
