import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiAlertCircle, FiCheck, FiCalendar, FiBox } from 'react-icons/fi';
import '../styles/ManageInventory.css';
import '../styles/StaffComponents.css';
import LoadingSpinner from './LoadingSpinner';

function ManageInventory() {
    const [loading, setLoading] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: '',
        expiryDate: '',
        department_id: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    // Animation variants - memoized to prevent recreating on every render
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    }), []);

    const itemVariants = useMemo(() => ({
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    }), []);

    // Fetch all inventory items
    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/inventory', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch inventory items');
            }

            const data = await response.json();
            setInventory(data);
            setFilteredInventory(data);
            return data;
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setErrorMessage(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch departments
    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/department', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch departments');
            }

            const data = await response.json();
            console.log('Fetched departments:', data);
            setDepartments(data);
            return data;
        } catch (error) {
            console.error('Error fetching departments:', error);
            setErrorMessage(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initial data
    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            // Load data sequentially to prevent multiple concurrent API calls
            await fetchDepartments();
            await fetchInventory();
            setInitialDataLoaded(true);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setErrorMessage('Failed to load initial data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    }, [fetchDepartments, fetchInventory]);

    // Use effect to load data only once
    useEffect(() => {
        if (!initialDataLoaded) {
            loadInitialData();
        }
    }, [initialDataLoaded, loadInitialData]);

    // Search inventory with memoized callback
    const handleSearch = useCallback((e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = inventory.filter((item) =>
            item.name?.toLowerCase().includes(term)
        );
        setFilteredInventory(filtered);
    }, [inventory]);

    // Memoize the filtered inventory for better performance
    const memoizedFilteredInventory = useMemo(() => {
        return searchTerm ? 
            inventory.filter(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase())) 
            : inventory;
    }, [inventory, searchTerm]);

    // Use the memoized value instead of the state
    useEffect(() => {
        setFilteredInventory(memoizedFilteredInventory);
    }, [memoizedFilteredInventory]);

    // Add inventory item
    const handleCreateFieldChange = useCallback((field, value) => {
        // Convert department_id to a number for API compatibility
        if (field === 'department_id') {
            if (value === '') {
                // If empty, keep it as empty string
                setNewItem((prev) => ({ ...prev, [field]: value }));
                return;
            } else {
                // Force conversion to number and validate
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                    console.log(`Setting department_id to numeric value: ${numValue}`);
                    setNewItem((prev) => ({ ...prev, [field]: numValue }));
                    return;
                } else {
                    console.warn(`Invalid department_id value: ${value}, not setting`);
                    return; // Don't update with invalid value
                }
            }
        }
        // For all other fields
        setNewItem((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        console.log('Form submitted with department_id:', newItem.department_id, 'type:', typeof newItem.department_id);
        
        // Ensure department_id is a valid number before submitting
        if (newItem.department_id === '' || isNaN(parseInt(newItem.department_id, 10))) {
            setErrorMessage('Please select a valid department before submitting');
            setLoading(false);
            return;
        }
        
        try {
            // Make a copy of the data and ensure department_id is a number
            const departmentId = parseInt(newItem.department_id, 10);
            const submissionData = {
                ...newItem,
                department_id: departmentId
            };
            
            // Log what we're sending to the API for debugging
            console.log('Creating inventory item with data:', submissionData);
            console.log('Department ID type:', typeof submissionData.department_id, 'value:', submissionData.department_id);
            
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/inventory', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                throw new Error('Failed to create inventory item');
            }

            await fetchInventory();
            setIsCreateMode(false);
            setNewItem({
                name: '',
                quantity: '',
                expiryDate: '',
                department_id: '',
            });
            setSuccessMessage('Inventory item added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error creating inventory item:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete inventory item
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/inventory/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete inventory item');
            }

                await fetchInventory();
                setSuccessMessage('Inventory item deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
            }
        }
    };

    // Update inventory item
    const handleUpdateFieldChange = (field, value) => {
        // Convert department_id to a number for API compatibility
        if (field === 'department_id') {
            if (value === '') {
                // If empty, keep it as empty string
                setSelectedItem((prev) => ({ ...prev, [field]: value }));
                return;
            } else {
                // Force conversion to number and validate
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                    console.log(`Setting department_id to numeric value: ${numValue}`);
                    setSelectedItem((prev) => ({ ...prev, [field]: numValue }));
                    return;
                } else {
                    console.warn(`Invalid department_id value: ${value}, not setting`);
                    return; // Don't update with invalid value
                }
            }
        }
        // For all other fields
        setSelectedItem((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Log what we're sending to the API for debugging
            console.log('Updating inventory item with data:', selectedItem);
            console.log('Department ID type:', typeof selectedItem.department_id);
            
            const token = localStorage.getItem('authToken');
            const response = await fetch(`https://frozen-sands-51239-b849a8d5756e.herokuapp.com/inventory/${selectedItem.inventory_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedItem),
            });

            if (!response.ok) {
                throw new Error('Failed to update inventory item');
            }

            await fetchInventory();
            setSelectedItem(null);
            setSuccessMessage('Inventory item updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating inventory item:', error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return { status: 'unknown', label: 'No Date' };
        
        const currentDate = new Date();
        const expiry = new Date(expiryDate);
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(currentDate.getMonth() + 1);

        if (expiry < currentDate) {
            return { status: 'expired', label: 'Expired' };
        } else if (expiry <= oneMonthLater) {
            return { status: 'warning', label: 'Expiring Soon' };
        } else {
            return { status: 'good', label: 'Valid' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    };

    const getDepartmentName = (departmentId) => {
        // Convert departmentId to number for consistent comparisons
        const numericId = typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId;
        const department = departments.find(dept => parseInt(dept.department_id, 10) === numericId);
        return department ? department.name : 'Unknown Department';
    };

    return (
        <motion.div 
            className="component-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {loading && <LoadingSpinner />}
            
            <motion.div className="component-header" variants={itemVariants}>
                <h2>Inventory Management</h2>
                <p className="component-subtitle">Track and manage medical supplies and equipment</p>
            </motion.div>

            <AnimatePresence>
                {errorMessage && (
                    <motion.div 
                        className="error-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <FiAlertCircle className="error-icon" />
                        <p className="error-message">{errorMessage}</p>
                        <button 
                            className="table-icon-button" 
                            onClick={() => setErrorMessage('')}
                            aria-label="Close error message"
                        >
                            <FiX />
                        </button>
                    </motion.div>
                )}

                {successMessage && (
                    <motion.div 
                        className="success-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <FiCheck className="success-icon" />
                        <p className="success-message">{successMessage}</p>
                        <button 
                            className="table-icon-button" 
                            onClick={() => setSuccessMessage('')}
                            aria-label="Close success message"
                        >
                            <FiX />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isCreateMode && !selectedItem && initialDataLoaded && (
                <motion.div variants={itemVariants}>
                    <div className="search-filter-container">
                        <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                        type="text"
                                placeholder="Search inventory items by name"
                        value={searchTerm}
                        onChange={handleSearch}
                                className="search-input"
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                        <motion.button 
                            className="action-button"
                            onClick={() => setIsCreateMode(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiPlus className="button-icon" /> Add Item
                        </motion.button>
                    </div>

                    <motion.div className="inventory-grid" variants={itemVariants}>
                        {filteredInventory.length === 0 ? (
                            <motion.div className="empty-state">
                                <FiPackage className="empty-state-icon" />
                                <p className="empty-state-text">No inventory items found. Add a new item or try a different search term.</p>
                            </motion.div>
                        ) : (
                            filteredInventory.map((item) => {
                                const expiryStatus = getExpiryStatus(item.expiryDate);
                                return (
                                    <motion.div 
                                        key={item.inventory_id} 
                                        className={`inventory-card expiry-${expiryStatus.status}`}
                                        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' }}
                                    >
                                        <div className="card-header">
                                            <h3 className="card-title">{item.name}</h3>
                                            <div className="card-actions">
                                                <motion.button 
                                                    className="table-icon-button edit"
                                                    onClick={() => setSelectedItem(item)}
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <FiEdit />
                                                </motion.button>
                                                <motion.button 
                                                    className="table-icon-button delete"
                                                    onClick={() => handleDelete(item.inventory_id)}
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <FiTrash2 />
                                                </motion.button>
                                            </div>
                                        </div>
                                        <div className="card-content">
                                            <div className="card-item">
                                                <div className="card-icon"><FiBox /></div>
                                                <div>
                                                    <div className="card-item-label">Quantity</div>
                                                    <div className="card-item-value">{item.quantity}</div>
                                                </div>
                                            </div>
                                            <div className="card-item">
                                                <div className="card-icon"><FiCalendar /></div>
                                                <div>
                                                    <div className="card-item-label">Expiry Date</div>
                                                    <div className="card-item-value">
                                                        {formatDate(item.expiryDate)}
                                                        <span className={`status-badge status-${expiryStatus.status}`}>
                                                            {expiryStatus.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-item">
                                                <div className="card-item-label">Department</div>
                                                <div className="card-item-value">{getDepartmentName(item.department_id)}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })
                        )}
                    </motion.div>
                </motion.div>
            )}

            {isCreateMode && (
                <motion.div 
                    className="form-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="form-title">Add New Inventory Item</h3>
                        <form onSubmit={handleCreateSubmit}>
                        <div className="form-group">
                            <label className="form-label">Item Name:</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => handleCreateFieldChange('name', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity:</label>
                                <input
                                    type="number"
                                    value={newItem.quantity}
                                    onChange={(e) => handleCreateFieldChange('quantity', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expiry Date:</label>
                                <input
                                    type="date"
                                    value={newItem.expiryDate}
                                    onChange={(e) => handleCreateFieldChange('expiryDate', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department:</label>
                                <select
                                    value={newItem.department_id}
                                    onChange={(e) => handleCreateFieldChange('department_id', e.target.value)}
                                className="form-select"
                                required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                            {dept.name} (ID: {dept.department_id})
                                        </option>
                                    ))}
                                </select>
                        </div>
                        <div className="form-actions">
                            <motion.button 
                                type="button" 
                                className="action-button secondary"
                                onClick={() => setIsCreateMode(false)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button 
                                type="submit" 
                                className="action-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add Item
                            </motion.button>
                        </div>
                        </form>
                </motion.div>
            )}

            {selectedItem && (
                <motion.div 
                    className="form-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="form-title">Edit Inventory Item</h3>
                        <form onSubmit={handleUpdateSubmit}>
                        <div className="form-group">
                            <label className="form-label">Item Name:</label>
                                <input
                                    type="text"
                                    value={selectedItem.name}
                                    onChange={(e) => handleUpdateFieldChange('name', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity:</label>
                                <input
                                    type="number"
                                    value={selectedItem.quantity}
                                    onChange={(e) => handleUpdateFieldChange('quantity', e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expiry Date:</label>
                                <input
                                    type="date"
                                value={selectedItem.expiryDate ? selectedItem.expiryDate.split('T')[0] : ''}
                                    onChange={(e) => handleUpdateFieldChange('expiryDate', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department:</label>
                                <select
                                    value={selectedItem.department_id}
                                    onChange={(e) => handleUpdateFieldChange('department_id', e.target.value)}
                                className="form-select"
                                required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                            {dept.name} (ID: {dept.department_id})
                                        </option>
                                    ))}
                                </select>
                        </div>
                        <div className="form-actions">
                            <motion.button 
                                type="button" 
                                className="action-button secondary"
                                onClick={() => setSelectedItem(null)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button 
                                type="submit" 
                                className="action-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Update Item
                            </motion.button>
                                </div>
                    </form>
                </motion.div>
                )}
        </motion.div>
    );
}

export default ManageInventory;
