// Generated Router - Uses UMD globals
const { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } = ReactRouterDOM;

// Layout component
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <main>
                {children}
            </main>
        </div>
    );
};

// Page component references (loaded from inline scripts)
const HomePage = window.__PAGE_COMPONENTS__?.['home'] || (() => <div>Loading HomePage...</div>);
const BlogPage = window.__PAGE_COMPONENTS__?.['blog'] || (() => <div>Loading BlogPage...</div>);
const DownloadsPage = window.__PAGE_COMPONENTS__?.['downloads'] || (() => <div>Loading DownloadsPage...</div>);

const App = () => {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
                    <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

// Attach to window for the render script
window.App = App;
