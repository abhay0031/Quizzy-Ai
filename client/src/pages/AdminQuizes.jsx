

import React, { useEffect, useState } from 'react'
import { apiConnector } from "../services/apiConnector"
import { quizEndpoints } from '../services/APIs';
import { useSelector } from "react-redux"
import QuizCard from '../components/core/AdminQuizes/QuizCard';
import { deleteQuiz } from '../services/operations/QuizAPIs';

const AdminQuizes = () => {
    const [quizes, setQuizes] = useState([]);
    const [filteredQuizes, setFilteredQuizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const { token } = useSelector(state => state.auth);

    const uniqueTypes = [...new Set(quizes.map(quiz => quiz.type))];

    const handleDeleteQuiz = async (id) => {
        try {
            setLoading(true);
            const response = await deleteQuiz(id, token)
            if (response) {
                setQuizes(quizes.filter(quiz => quiz._id !== id));
                setFilteredQuizes(filteredQuizes.filter(quiz => quiz._id !== id));
            }
        } catch (e) {
            console.log("ERROR DELETING QUIZ : ", e);
        } finally {
            setLoading(false);
        }
    }

    const fetchAdminQuizes = async () => {
        try {
            const response = await apiConnector("GET", quizEndpoints.GET_ADMIN_QUIZES, null, {
                Authorization: `Bearer ${token}`
            })
            setQuizes(response?.data?.data);
            setFilteredQuizes(response?.data?.data);
        } catch (error) {
            console.error('Error fetching admin quizes:', error);
        } finally {
            setLoading(false);
        }
    }

    const filterQuizes = () => {
        let filtered = [...quizes];

        if (searchTerm) {
            filtered = filtered.filter(quiz => 
                quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedSemester !== 'all') {
            filtered = filtered.filter(quiz => quiz.semester === parseInt(selectedSemester));
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(quiz => quiz.type === selectedType);
        }

        setFilteredQuizes(filtered);
    }

    useEffect(() => {
        fetchAdminQuizes();
    }, [])

    useEffect(() => {
        filterQuizes();
    }, [searchTerm, selectedSemester, selectedType])

    return (
        <section className='py-6'>
            <div className='mb-6 flex flex-col gap-4'>
                <div className='flex flex-wrap gap-4'>
                    <input
                        type="text"
                        placeholder="Search quizes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:outline-none focus:border-blue-500'
                    />
                    
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className='px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:outline-none focus:border-blue-500'
                    >
                        <option value="all">All Semesters</option>
                        {[1,2,3,4,5,6,7,8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className='px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:outline-none focus:border-blue-500'
                    >
                        <option value="all">All Types</option>
                        {uniqueTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                {loading ? (
                    <div className='flex justify-center items-center min-h-[90vh]'>Loading...</div>
                ) : filteredQuizes.length > 0 ? (
                    filteredQuizes.map((quiz, index) => (
                        <QuizCard 
                            handleDeleteQuiz={handleDeleteQuiz} 
                            key={quiz._id} 
                            quiz={quiz} 
                            index={index} 
                        />
                    ))
                ) : (
                    <div className='flex justify-center items-center min-h-[90vh]'>
                        {searchTerm || selectedSemester !== 'all' || selectedType !== 'all' 
                            ? 'No quizes found matching your filters' 
                            : 'No quizes found'}
                    </div>
                )}
            </div>
        </section>
    )
}

export default AdminQuizes