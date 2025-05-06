import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 5; // Số quiz hiển thị mỗi trang

const CollapsibleSubmissionsTable = ({ submissions }) => {
    const [expandedQuizId, setExpandedQuizId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    if (!Array.isArray(submissions) || submissions.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Không có bài nộp nào.</p>
            </div>
        );
    }

    // Group submissions by quiz
    const submissionsByQuiz = submissions.reduce((acc, submission) => {
        if (!submission?.quizId?._id) return acc;

        const quizId = submission.quizId._id;
        if (!acc[quizId]) {
            acc[quizId] = [];
        }
        acc[quizId].push(submission);
        return acc;
    }, {});

    const toggleExpand = (quizId) => {
        setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
    };

    // Xử lý phân trang
    const quizEntries = Object.entries(submissionsByQuiz);
    const totalPages = Math.ceil(quizEntries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentQuizzes = quizEntries.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setExpandedQuizId(null); // Đóng tất cả các quiz khi chuyển trang
        setCurrentPage(page);
    };

    // Tạo mảng các số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // Trang đầu
                i === totalPages || // Trang cuối
                (i >= currentPage - 1 && i <= currentPage + 1) // Các trang xung quanh trang hiện tại
            ) {
                pageNumbers.push(i);
            } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
                pageNumbers.push('...');
            }
        }
        return pageNumbers;
    };

    return (
        <div className="space-y-4">
            {/* Quiz list */}
            {currentQuizzes.map(([quizId, quizSubmissions]) => {
                quizSubmissions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                const latestSubmission = quizSubmissions[0];
                const scores = quizSubmissions.map(s => s.percentageScore || 0);
                const highestScore = Math.max(...scores);
                const isExpanded = expandedQuizId === quizId;

                return (
                    <div key={quizId} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Quiz Summary - Always visible */}
                        <div
                            className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleExpand(quizId)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold">
                                            {latestSubmission.quizId?.title || 'Untitled Quiz'}
                                        </h3>
                                        {isExpanded ? (
                                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Số lần làm:</span> {quizSubmissions.length}
                                        </div>
                                        <div>
                                            <span className="font-medium">Điểm cao nhất:</span> {highestScore.toFixed(1)}%
                                        </div>
                                        <div>
                                            <span className="font-medium">Lần làm cuối:</span>{' '}
                                            {latestSubmission.completedAt
                                                ? new Date(latestSubmission.completedAt).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={`/take-quiz/${quizId}`}
                                    className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Làm lại
                                </Link>
                            </div>
                        </div>

                        {/* Detailed Submissions - Visible when expanded */}
                        {isExpanded && (
                            <div className="border-t">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Lần thử
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Điểm số
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Thời gian làm
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Chi tiết
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {quizSubmissions.map((submission) => (
                                                <tr key={submission._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        #{submission.attemptNumber || '?'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {submission.correctAnswers || 0}/{submission.totalQuestions || 0}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {(submission.percentageScore || 0).toFixed(1)}%
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {submission.completedAt
                                                            ? new Date(submission.completedAt).toLocaleString()
                                                            : 'N/A'
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {submission._id && (
                                                            <Link
                                                                to={`/results/${submission._id}`}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Xem chi tiết
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 py-4">
                    <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        «
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ‹
                    </button>

                    {getPageNumbers().map((pageNumber, index) => (
                        <React.Fragment key={index}>
                            {pageNumber === '...' ? (
                                <span className="px-2">...</span>
                            ) : (
                                <button
                                    onClick={() => goToPage(pageNumber)}
                                    className={`px-3 py-1 rounded ${currentPage === pageNumber
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            )}
                        </React.Fragment>
                    ))}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ›
                    </button>
                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        »
                    </button>

                    <span className="ml-4 text-sm text-gray-600">
                        Trang {currentPage} / {totalPages}
                    </span>
                </div>
            )}
        </div>
    );
};

export default CollapsibleSubmissionsTable;