/**
 * StorageWrapper - Provides backward compatibility for localStorage usage
 * 
 * This wrapper automatically redirects localStorage calls to scoped storage
 * for seamless migration without breaking existing components.
 */

import { storage } from './storageAdapter';

// Create a wrapper that can be used as a drop-in replacement for localStorage
export const createLocalStorageWrapper = () => {
    return {
        getItem: (key) => storage.getItem(key),
        setItem: (key, value) => storage.setItem(key, value),
        removeItem: (key) => storage.removeItem(key),
        clear: () => storage.clear(),
        key: (index) => storage.key(index),
        get length() { return storage.length; }
    };
};

// Override global localStorage for automatic migration
export const enableGlobalStorageOverride = () => {
    const originalLocalStorage = window.localStorage;
    const scopedWrapper = createLocalStorageWrapper();
    
    // Store reference to original for debugging
    window._originalLocalStorage = originalLocalStorage;
    
    // Override localStorage methods
    Object.defineProperty(window, 'localStorage', {
        value: scopedWrapper,
        writable: false,
        configurable: true
    });
    
    console.log('✅ localStorage has been overridden with scoped session storage');
};

// Disable override (for debugging)
export const disableGlobalStorageOverride = () => {
    if (window._originalLocalStorage) {
        Object.defineProperty(window, 'localStorage', {
            value: window._originalLocalStorage,
            writable: false,
            configurable: true
        });
        console.log('❌ localStorage override disabled');
    }
};

export default createLocalStorageWrapper;
