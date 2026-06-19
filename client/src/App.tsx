import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import Members from './pages/Members';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProjectList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="members" element={<Members />} />
      </Route>
    </Routes>
  );
}

export default App;
