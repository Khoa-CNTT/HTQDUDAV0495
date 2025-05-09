import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserAchievements } from '../services/api';
import socketService from '../services/socketService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

// Always get the latest user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checking, setChecking] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        // Set up socket listener for new achievements
        socketService.on('onAchievementsUnlocked', (data) => {
            // Show toast notification for each new achievement
            data.achievements.forEach(achievement => {
                toast.success(
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                            <p className="font-semibold">{achievement.name}</p>
                            <p className="text-sm">{achievement.description}</p>
                        </div>
                    </div>,
                    {
                        duration: 5000,
                        position: 'bottom-right'
                    }
                );
            });

            // Refresh achievements list
            fetchAchievements();
        });

        return () => {
            // Clean up socket listener
            socketService.on('onAchievementsUnlocked', () => { });
        };
    }, []);

    const fetchAchievements = async () => {
        try {
            const response = await getUserAchievements();
            if (response.success) {
                setAchievements(response.data);
                setError(null);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
            setError(error.message || 'Unable to load achievements');
            toast.error('Unable to load achievements');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAchievements = async () => {
        setChecking(true);
        try {
            // Use socket to check achievements
            socketService.checkAchievements();
            toast.success('Checking achievements...');
        } catch (error) {
            console.error('Error checking achievements:', error);
            toast.error('Unable to check achievements');
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    // Group achievements by unlocked status
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-10 relative">
            <button
                className="absolute top-4 left-4 z-30 flex items-center justify-center px-6 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-none hover:from-indigo-700 hover:to-purple-700 transition-all"
                onClick={() => navigate('/dashboard')}
                aria-label="Back to dashboard"
            >
                <FiArrowLeft className="w-8 h-8" />
            </button>
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">Achievements</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCheckAchievements}
                            disabled={checking}
                            className={`px-5 py-2 rounded-xl shadow-md font-semibold text-white transition-all duration-200 text-lg ${checking
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'} `}
                        >
                            {checking ? 'Checking...' : 'Check Achievements'}
                        </button>

                        {/* User Dropdown Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.username}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src="/images/df_avatar.png"
                                            alt="User Avatar"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                </div>
                                <span className="font-medium text-gray-700">{user?.displayName || user?.username}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                                    <div className="dropdown-header">
                                        <div className="flex items-center space-x-3 px-4 py-2 border-b">
                                            <div className="flex-shrink-0">
                                                {user?.profilePicture ? (
                                                    <img
                                                        src={user.profilePicture}
                                                        alt="User Avatar"
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <img
                                                        src="/images/df_avatar.png"
                                                        alt="User Avatar"
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user?.displayName || user?.username}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <div className="dropdown-item-icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                        <span className="ml-2">Profile</span>
                                    </Link>

                                    <Link
                                        to="/dashboard"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <div className="dropdown-item-icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                                <line x1="9" y1="21" x2="9" y2="9"></line>
                                            </svg>
                                        </div>
                                        <span className="ml-2">Dashboard</span>
                                    </Link>

                                    <Link
                                        to="/friends"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <div className="dropdown-item-icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </div>
                                        <span className="ml-2">Friends</span>
                                    </Link>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <div className="dropdown-item-icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                <polyline points="16 17 21 12 16 7"></polyline>
                                                <line x1="21" y1="12" x2="9" y2="12"></line>
                                            </svg>
                                        </div>
                                        <span className="ml-2">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-12 border border-white/30">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-700">Progress Overview</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-lg font-bold text-indigo-700">
                            {unlockedAchievements.length}/{achievements.length}
                        </span>
                    </div>
                </div>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold mb-8 text-green-700 flex items-center gap-2">
                            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Unlocked
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {unlockedAchievements.map((achievement, idx) => (
                                <div
                                    key={achievement._id}
                                    className="bg-gradient-to-br from-green-100 via-white to-green-50 border-2 border-green-400 p-8 rounded-2xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl relative overflow-hidden animate-fadeIn"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-5xl drop-shadow-lg">{achievement.icon}</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-800 shadow">
                                            Unlocked
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-green-800 mb-2">{achievement.name}</h3>
                                    <p className="text-gray-700 mb-4">{achievement.description}</p>
                                    <p className="text-sm text-gray-500">Achieved on: <span className="font-semibold">{new Date(achievement.unlockedAt).toLocaleDateString()}</span></p>
                                    <div className="absolute right-0 top-0 opacity-10 text-8xl pointer-events-none select-none">🏆</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-8 text-gray-500 flex items-center gap-2">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414" /></svg>
                            Locked
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {lockedAchievements.map((achievement) => (
                                <div
                                    key={achievement._id}
                                    className="bg-gradient-to-br from-gray-100 via-white to-gray-50 border-2 border-gray-300 p-8 rounded-2xl shadow-md opacity-70 relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-5xl opacity-40">{achievement.icon}</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-600 shadow">
                                            Locked
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-600 mb-2">{achievement.name}</h3>
                                    <p className="text-gray-500 mb-4">{achievement.description}</p>
                                    <div className="h-2 bg-gray-200 rounded-full mt-4">
                                        <div className="h-2 bg-gray-400 rounded-full" style={{ width: '0%' }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Not unlocked yet</p>
                                    <div className="absolute right-0 top-0 opacity-10 text-8xl pointer-events-none select-none">🔒</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;