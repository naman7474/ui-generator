// Generated Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './pages/home/App';
import PagesOurPoliciesPage from './pages/pages-our-policies/App';
import PagesContactUsPage from './pages/pages-contact-us/App';

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pages-our-policies" element={<PagesOurPoliciesPage />} />
        <Route path="/pages-contact-us" element={<PagesContactUsPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
