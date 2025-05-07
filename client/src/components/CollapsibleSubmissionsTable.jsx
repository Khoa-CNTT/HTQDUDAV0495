import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 5;

const CollapsibleSubmissionsTable = ({ submissions }) => {
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return (
      <div className="py-8 text-center rounded-lg bg-gray-50">
        <p className="text-gray-600">No submissions found.</p>
      </div>
    );
  }

  const submissionsByQuiz = submissions.reduce((acc, submission) => {
    if (!submission?.quizId?._id) return acc;
    const quizId = submission.quizId._id;
    if (!acc[quizId]) acc[quizId] = [];
    acc[quizId].push(submission);
    return acc;
  }, {});

  const toggleExpand = (quizId) => {
    setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
  };

  const quizEntries = Object.entries(submissionsByQuiz);
  const totalPages = Math.ceil(quizEntries.length / ITEMS_PER_PAGE);
  const currentQuizzes = quizEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    setExpandedQuizId(null);
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {currentQuizzes.map(([quizId, quizSubmissions]) => {
        quizSubmissions.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        );
        const latest = quizSubmissions[0];
        const highest = Math.max(
          ...quizSubmissions.map((s) => s.percentageScore || 0)
        );
        const isExpanded = expandedQuizId === quizId;

        return (
          <div
            key={quizId}
            className="overflow-hidden bg-white shadow-md rounded-2xl "
          >
            <div
              className="px-6 py-4 transition-colors cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(quizId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {latest.quizId?.title || "Untitled Quiz"}
                    </h3>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Attempts:</span>{" "}
                      {quizSubmissions.length}
                    </div>
                    <div>
                      <span className="font-medium">Highest Score:</span>{" "}
                      {highest.toFixed(1)}%
                    </div>
                    <div>
                      <span className="font-medium">Last Attempt:</span>{" "}
                      {latest.completedAt
                        ? new Date(latest.completedAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/take-quiz/${quizId}`}
                  className="inline-flex items-center px-4 py-2 ml-4 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Retake
                </Link>
              </div>
            </div>

            {isExpanded && (
              <div className="overflow-x-auto border-t">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Attempt
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Score
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Completed At
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizSubmissions.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          #{s.attemptNumber || "?"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {s.correctAnswers || 0}/{s.totalQuestions || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(s.percentageScore || 0).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {s.completedAt
                            ? new Date(s.completedAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          {s._id && (
                            <Link
                              to={`/results/${s._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-center py-4 space-x-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            «
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ‹
          </button>

          {getPageNumbers().map((n, i) => (
            <React.Fragment key={i}>
              {n === "..." ? (
                <span className="px-2">...</span>
              ) : (
                <button
                  onClick={() => goToPage(n)}
                  className={`px-3 py-1 rounded ${
                    currentPage === n
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {n}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ›
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            »
          </button>

          <span className="ml-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSubmissionsTable;
