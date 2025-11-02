import { useState, useEffect } from 'react'
import SearchForm from './SearchForm'
import LoadingIndicator from './LoadingIndicator'
import ResultTable from './ResultTable'
import Error from './Error'
import '../css/App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState([])
  const [error, setError] = useState(false)
  const [studentId, setStudentId] = useState('')

  const fetchStudentResults = async () => {
    setLoading(true)
    setError(false)
    setResult([])

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const [studentsRes, coursesRes, resultsRes] = await Promise.all([
        fetch('/sinhvien.json'),
        fetch('/hocphan.json'),
        fetch('/ketqua.json')
      ])

      const students = await studentsRes.json()
      const courses = await coursesRes.json()
      const results = await resultsRes.json()

      const student = students.find(s => s.sid === studentId)
      
      if (!student) {
        setError(true)
        setLoading(false)
        return
      }

      const studentResults = results
        .filter(r => r.studentId === studentId)
        .map(r => {
          const course = courses.find(c => c.cid === r.courseId)
          return {
            semester: r.term,
            courseCode: r.courseId,
            courseName: course.name,
            grade: r.grade
          }
        })

      if (studentResults.length === 0) {
        setError(true)
      } else {
        setResult(studentResults)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!studentId || studentId.trim() === '') {
      setResult([])
      setError(false)
      return
    }
    fetchStudentResults()
  }, [studentId])

  const handleSearch = (id) => {
    setStudentId(id)
  }

  return (
    <>
      <h1>Tra cứu kết quả học tập</h1>
      <SearchForm onSearch={handleSearch}/>
      <LoadingIndicator isLoading={loading} />
      <Error isError={error} />
      <ResultTable studentResults={result} />
    </>
  )
}

export default App
