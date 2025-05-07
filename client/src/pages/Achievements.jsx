import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserAchievements } from '../services/api';
import socketService from '../services/socketService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Achievements = ({ user }) => {
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
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Achievements</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCheckAchievements}
                        disabled={checking}
                        className={`px-4 py-2 rounded-lg ${checking
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white transition-colors`}
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
                                    <span className="font-semibold text-indigo-700">
                                        {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                    </span>
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
                                            <img
                                                src={user?.profilePicture || "/images/df_avatar.png"}
                                                alt="User Avatar"
                                                className="w-10 h-10 rounded-full"
                                            />
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full">
                            <div
                                className="h-4 bg-indigo-600 rounded-full transition-all duration-500"
                                style={{
                                    width: `${(unlockedAchievements.length / achievements.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                    <span className="text-sm font-medium">
                        {unlockedAchievements.length}/{achievements.length}
                    </span>
                </div>
            </div>

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Unlocked</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {unlockedAchievements.map((achievement) => (
                            <div
                                key={achievement._id}
                                className="bg-white border-2 border-indigo-500 p-6 rounded-lg shadow-md transition-transform hover:scale-105"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <span className="text-4xl mb-4">{achievement.icon}</span>
                                        <h3 className="text-xl font-semibold mt-2">
                                            {achievement.name}
                                        </h3>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Unlocked
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">{achievement.description}</p>
                                <p className="text-sm text-gray-500">
                                    Achieved on: {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-6">Locked</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lockedAchievements.map((achievement) => (
                            <div
                                key={achievement._id}
                                className="bg-gray-100 opacity-75 p-6 rounded-lg shadow-md"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <span className="text-4xl mb-4 opacity-50">{achievement.icon}</span>
                                        <h3 className="text-xl font-semibold mt-2">
                                            {achievement.name}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">{achievement.description}</p>
                                <div className="mt-4">
                                    <div className="h-2 bg-gray-200 rounded-full">
                                        <div
                                            className="h-2 bg-indigo-500 rounded-full"
                                            style={{ width: '0%' }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Not unlocked yet</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Achievements;