// Generated Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './pages/home/App';
import BlogPage from './pages/blog/App';
import DownloadsPage from './pages/downloads/App';

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
