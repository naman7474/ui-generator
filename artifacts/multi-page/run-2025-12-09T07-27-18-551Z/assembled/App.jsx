// Generated Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './pages/home/App';
import Pages/shineSquadGet999Page from './pages/pages/shine-squad-get999/App';
import Collections/allPage from './pages/collections/all/App';

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pages/shine-squad-get999" element={<Pages/shineSquadGet999Page />} />
        <Route path="/collections/all" element={<Collections/allPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
