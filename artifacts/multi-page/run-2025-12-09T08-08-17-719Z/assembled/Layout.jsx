// Generated Layout
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            {/* Shared Header/Nav would go here */}
            <main>
                {children}
            </main>
            {/* Shared Footer would go here */}
        </div>
    );
};

export default Layout;
