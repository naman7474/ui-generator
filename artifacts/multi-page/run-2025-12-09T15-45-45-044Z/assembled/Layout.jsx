// Layout is embedded in App.jsx for UMD compatibility
// This file is kept for potential future use with bundled builds
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <main>
                {children}
            </main>
        </div>
    );
};

window.Layout = Layout;
