import React, { useEffect, useState } from 'react'
import { apiConnector } from "../services/apiConnector"
import { notesEndpoints } from "../services/APIs"
import { useSelector } from "react-redux"
import NotesCard from '../components/core/Notes/NotesCard'

const Notes = () => {
    const [notes, setNotes] = useState([])
    const [filteredNotes, setFilteredNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSemester, setSelectedSemester] = useState('all')
    const [selectedType, setSelectedType] = useState('all')
    const { token } = useSelector(state => state.auth)

    const fetchNotes = async () => {
        setLoading(true)
        try {
            const response = await apiConnector("GET", notesEndpoints.GET_ALL_NOTES, null, {
                Authorization: `Bearer ${token}`
            })

            if (!response.data.success) {
                throw new Error(response.data.message)
            }

            setNotes(response.data.data)
            setFilteredNotes(response.data.data)
        } catch (e) {
            console.log("ERROR FETCHING NOTES")
        } finally {
            setLoading(false)
        }
    }

    const uniqueTypes = [...new Set(notes.map(note => note.type))]

    const filterNotes = () => {
        let filtered = [...notes]

        if (searchTerm) {
            filtered = filtered.filter(note =>
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.type.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedSemester !== 'all') {
            filtered = filtered.filter(note => note.semester === parseInt(selectedSemester))
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(note => note.type === selectedType)
        }

        setFilteredNotes(filtered)
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    useEffect(() => {
        filterNotes()
    }, [searchTerm, selectedSemester, selectedType])

    return (
        <section className='min-h-[90vh] py-8'>
            <h1 className='text-3xl font-bold text-center mb-8'>Study Notes</h1>
            
            <div className='mb-6 flex flex-wrap gap-4'>
                <input
                    type="text"
                    placeholder="Search notes..."
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
                    <option value="all">All Subjects</option>
                    {uniqueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className='text-center min-h-[50vh] flex items-center justify-center text-xl'>
                    Loading...
                </div>
            ) : filteredNotes.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredNotes.map((note) => (
                        <NotesCard key={note._id} note={note} />
                    ))}
                </div>
            ) : (
                <div className='text-center min-h-[50vh] flex items-center justify-center text-xl'>
                    {searchTerm || selectedSemester !== 'all' || selectedType !== 'all'
                        ? 'No notes found matching your filters'
                        : 'No notes available'}
                </div>
            )}
        </section>
    )
}

export default Notes;