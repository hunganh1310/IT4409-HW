import React from 'react';

const ResultTable = ({ studentResults }) => {
    if (!studentResults || studentResults.length === 0) {
        return null;
    }

    return (
        <div className="result-table">
            <table className="result-table__container">
            <thead>
                <tr className="result-table__header-row">
                <th className="result-table__header-cell">Kỳ học</th>
                <th className="result-table__header-cell">Mã học phần</th>
                <th className="result-table__header-cell">Tên môn học</th>
                <th className="result-table__header-cell">Điểm</th>
                </tr>
            </thead>
            <tbody>
                {studentResults.map((result, index) => (
                <tr key={index} className="result-table__row">
                    <td className="result-table__cell">{result.semester}</td>
                    <td className="result-table__cell">{result.courseCode}</td>
                    <td className="result-table__cell">{result.courseName}</td>
                    <td className="result-table__cell">{result.grade}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    );
};

export default ResultTable;
