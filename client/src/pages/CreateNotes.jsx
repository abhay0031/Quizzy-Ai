import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { createNotes, updateNotes } from '../services/operations/NotesAPI'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const CreateNotes = () => {
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()
    const { token } = useSelector(state => state.auth)
    const navigate = useNavigate()
    const { id } = useParams()
    const location = useLocation()
    const noteData = location.state?.noteData

    useEffect(() => {
        if (id && noteData) {
            setValue('title', noteData.title)
            setValue('description', noteData.description)
            setValue('semester', noteData.semester)
            setValue('type', noteData.type)
        }
    }, [id, noteData, setValue])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('title', data.title)
            formData.append('description', data.description)
            formData.append('semester', data.semester)
            formData.append('type', data.type)
            if (data.pdf?.[0]) {
                formData.append('pdf', data.pdf[0])
            }

            let response
            if (id) {
                response = await updateNotes(formData, token, id)
            } else {
                response = await createNotes(formData, token)
            }

            if (response) {
                navigate('/dashboard/notes')
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-[90vh] py-8'>
            <h1 className='text-3xl font-bold text-center mb-8'>
                {id ? 'Edit Notes' : 'Upload New Notes'}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className='max-w-3xl mx-auto'>
                <div className='flex flex-col gap-5'>
                    <div>
                        <label className='block mb-2'>Title</label>
                        <input
                            type='text'
                            {...register('title', { required: 'Title is required' })}
                            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600'
                        />
                        {errors.title && <p className='text-red-500 mt-1'>{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className='block mb-2'>Description</label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600'
                            rows={4}
                        />
                        {errors.description && <p className='text-red-500 mt-1'>{errors.description.message}</p>}
                    </div>

                    <div>
                        <label className='block mb-2'>Semester</label>
                        <select
                            {...register('semester', { required: 'Semester is required' })}
                            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600'
                        >
                            <option value="">Select Semester</option>
                            {[1,2,3,4,5,6,7,8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                        {errors.semester && <p className='text-red-500 mt-1'>{errors.semester.message}</p>}
                    </div>

                    <div>
                        <label className='block mb-2'>Subject Type</label>
                        <input
                            type='text'
                            {...register('type', { required: 'Subject type is required' })}
                            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600'
                            placeholder='e.g., Operating Systems, Computer Networks'
                        />
                        {errors.type && <p className='text-red-500 mt-1'>{errors.type.message}</p>}
                    </div>

                    <div>
                        <label className='block mb-2'>PDF File {id && '(Optional for edit)'}</label>
                        <input
                            type='file'
                            accept='.pdf'
                            {...register('pdf', { required: !id })}
                            className='w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600'
                        />
                        {errors.pdf && <p className='text-red-500 mt-1'>{errors.pdf.message}</p>}
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50'
                    >
                        {loading ? 'Processing...' : id ? 'Update Notes' : 'Upload Notes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateNotes