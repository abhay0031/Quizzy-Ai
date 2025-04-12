

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns';
import Button from "../components/Button"
import { FaHome, FaUserCircle, FaEnvelope, FaClock, FaUserShield, FaQuestionCircle, FaBookOpen, FaTrophy, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from 'axios';

const Profile = () => {
  const { user, token } = useSelector(state => state.auth)
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [userAttempts, setUserAttempts] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchUserAttempts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/attempts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const attempts = response.data.data;
        setUserAttempts(attempts);

        const totalAttempts = attempts.length;
        const scores = attempts.map(attempt => attempt.score);
        const averageScore = scores.length > 0 
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) 
          : 0;
        const highestScore = scores.length > 0 ? Math.max(...scores) * 100 : 0;

        setStats({
          totalAttempts,
          averageScore,
          highestScore,
          recentActivity: attempts.slice(0, 5) 
        });

      } catch (error) {
        console.error('Error fetching user attempts:', error);
      }
    };

    fetchUserAttempts();
  }, [token]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const tabVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: 1.1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className='py-8 px-4 md:p-10 min-h-[calc(100vh-10rem)] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl'
    >
      <motion.div 
        variants={itemVariants}
        className='text-center mb-10'
      >
        <div className='w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4'>
          <FaUserCircle className='w-16 h-16 text-white' />
        </div>
        <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
          {user.username}'s Profile
        </h1>
      </motion.div>

      <motion.div variants={itemVariants} className='flex justify-center gap-4 mb-8'>
        {['info', 'stats', 'activity'].map((tab) => (
          <motion.button
            key={tab}
            variants={tabVariants}
            initial="inactive"
            animate={activeTab === tab ? "active" : "inactive"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors
              ${activeTab === tab 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className='max-w-4xl mx-auto'
      >
        {activeTab === 'info' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='grid grid-cols-1 md:grid-cols-2 gap-6'
          >
            <InfoCard icon={<FaUserCircle />} title="Username" value={user.username} />
            <InfoCard icon={<FaEnvelope />} title="Email" value={user.email} />
            <InfoCard icon={<FaClock />} title="Joined" value={formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })} />
            <InfoCard icon={<FaUserShield />} title="Role" value={user.role} />
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='grid grid-cols-2 md:grid-cols-4 gap-4'
          >
            <StatCard icon={<FaQuestionCircle />} title="Quizzes Taken" value={stats.totalAttempts} />
            <StatCard icon={<FaChartLine />} title="Average Score" value={`${stats.averageScore}%`} />
            <StatCard icon={<FaTrophy />} title="Highest Score" value={`${stats.highestScore}%`} />
            <StatCard icon={<FaBookOpen />} title="Total Notes" value={user?.notes?.length || 0} />
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='bg-slate-800 rounded-xl p-6'
          >
            <h3 className='text-xl font-semibold mb-4 text-white'>Recent Activity</h3>
            <div className='space-y-4'>
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((attempt, i) => (
                  <motion.div 
                    key={attempt._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className='bg-slate-700 p-4 rounded-lg'
                  >
                    <p className='text-slate-300'>
                      Quiz Attempt: {attempt.quizId?.title || 'Untitled Quiz'}
                    </p>
                    <p className='text-slate-300'>Score: {attempt.score * 100}%</p>
                    <p className='text-sm text-slate-400'>
                      {formatDistanceToNow(new Date(attempt.createdAt), { addSuffix: true })}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className='text-slate-400'>No recent activity</p>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className='mt-10 flex justify-center gap-4'
      >
        <Button 
          onClick={() => navigate('/')} 
          className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
        >
          <FaHome /> Return Home
        </Button>
      </motion.div>
    </motion.section>
  )
}

const InfoCard = ({ icon, title, value }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className='bg-slate-800 p-6 rounded-xl shadow-lg flex items-center gap-4'
  >
    <div className='text-blue-400 text-2xl'>
      {icon}
    </div>
    <div>
      <p className='text-slate-400 text-sm'>{title}</p>
      <p className='text-white font-medium'>{value}</p>
    </div>
  </motion.div>
);

const StatCard = ({ icon, title, value }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className='bg-slate-800 p-6 rounded-xl shadow-lg text-center'
  >
    {icon && <div className='text-purple-400 text-2xl mb-2 flex justify-center'>{icon}</div>}
    <p className='text-slate-400 text-sm'>{title}</p>
    <p className='text-white font-bold text-xl'>{value}</p>
  </motion.div>
);

export default Profile;