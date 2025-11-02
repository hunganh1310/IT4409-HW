import { useState } from 'react';

function SearchForm({ onSearch }) {
    const [studentId, setStudentId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (studentId.trim()) {
            onSearch(studentId.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nhập mã số sinh viên"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
            />
            <button type="submit">Tra cứu</button>
        </form>
    );
}

export default SearchForm;
