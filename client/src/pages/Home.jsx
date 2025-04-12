

import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { apiConnector } from "../services/apiConnector"
import { quizEndpoints } from "../services/APIs/index"
import QuizCard from '../components/core/Home/QuizCard'

const Home = () => {
  const [quizzes, setQuizzes] = useState([])
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const { token } = useSelector(state => state.auth)

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const response = await apiConnector("GET", quizEndpoints.GET_ALL_QUIZES, null, {
        Authorization: `Bearer ${token}`
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      setQuizzes(response.data.data);
      setFilteredQuizzes(response.data.data);

    } catch (e) {
      console.log("COULDNT GET QUIZZES")
    } finally {
      setLoading(false)
    }
  }

  const uniqueTypes = [...new Set(quizzes.map(quiz => quiz.type))];

  const filterQuizzes = () => {
    let filtered = [...quizzes];

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

    setFilteredQuizzes(filtered);
  }

  useEffect(() => {
    fetchQuizzes();
  }, [])

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, selectedSemester, selectedType])

  return (
    <section className='min-h-[90vh] border-t border-slate-600 py-5 mt-3'>
      <div className='mb-6 flex flex-wrap gap-4'>
        <input
          type="text"
          placeholder="Search quizzes..."
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

      {loading ? (
        <div className='text-center min-h-[90vh] flex items-center justify-center text-xl'>
          Loading...
        </div>
      ) : filteredQuizzes?.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 lg:grid-cols-3'>
          {filteredQuizzes.map((quiz, index) => (
            <QuizCard key={quiz._id} quiz={quiz} index={index} />
          ))}
        </div>
      ) : (
        <div className='text-center min-h-[50vh] flex items-center justify-center text-xl'>
          {searchTerm || selectedSemester !== 'all' || selectedType !== 'all'
            ? 'No quizzes found matching your filters'
            : 'No quizzes found'}
        </div>
      )}
    </section>
  )
}

export default Home