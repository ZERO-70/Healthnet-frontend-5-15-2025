import React, { useState, useEffect } from 'react';
import '../styles/SearchDoctor.css';
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../hooks/useLoading';

function SearchDoctor() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, withLoading } = useLoading();

    // Fetch doctors from the server
    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://frozen-sands-51239-b849a8d5756e.herokuapp.com/doctor', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch doctors.');
            }

            const data = await response.json();
            setDoctors(data);
            setFilteredDoctors(data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setErrorMessage('Failed to fetch doctor data.');
            setFilteredDoctors([]);
        }
    };

    // Handle search input changes
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = doctors.filter((doctor) => {
            const nameMatch = doctor.name?.toLowerCase().includes(term);
            const specializationMatch = doctor.specialization?.toLowerCase().includes(term);
            const idMatch = doctor.id?.toString() === term; // Exact ID match
            return nameMatch || specializationMatch || idMatch;
        });

        setFilteredDoctors(filtered);
    };

    useEffect(() => {
        withLoading(fetchDoctors)();
    }, [withLoading]);

    return (
        <div className="searchDoctor">
            <h2 className="searchDoctorTitle">Search Doctor</h2>
            <input
                type="text"
                placeholder="Search by Name, Specialization, or ID"
                value={searchTerm}
                onChange={handleSearch}
                className="searchBar"
                disabled={loading}
            />
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            {loading && <LoadingSpinner />}
            {!loading && (
                <div className="doctorGrid">
                    {filteredDoctors.length === 0 ? (
                        <p className="noResults">No doctors found</p>
                    ) : (
                        filteredDoctors.map((doctor) => (
                            <div key={doctor.id} className="doctorCard">
                                <p><strong>Name:</strong> {doctor.name}</p>
                                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                                <p><strong>Gender:</strong> {doctor.gender}</p>
                                <p><strong>Age:</strong> {doctor.age}</p>
                                <p><strong>Birthdate:</strong> {doctor.birthdate}</p>
                                <p><strong>Contact Info:</strong> {doctor.contact_info}</p>
                                <p><strong>Address:</strong> {doctor.address}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchDoctor;
