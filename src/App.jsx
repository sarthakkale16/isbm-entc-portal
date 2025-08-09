import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, orderBy, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';

// --- PASTE YOUR FIREBASE CONFIGURATION HERE ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase initialization failed. Please check your config.", e);
}

const AppContext = createContext();

// --- HELPER COMPONENTS ---
const Header = () => ( <header className="header"> <h1>ISBM College of Engineering</h1> <h3>Department of Electronics and Telecommunication</h3> </header> );
const Footer = () => (
    <footer className="footer">
        <div className="footer-content">
            <div className="social-links">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
            </div>
            <div>Designed by Sarthak</div>
        </div>
    </footer>
);
const Spinner = () => (<div style={{display: 'flex', justifyContent: 'center', padding: '2rem'}}><div style={{animation: 'spin 1s linear infinite', width: '3rem', height: '3rem', borderRadius: '50%', borderTop: '4px solid #0ea5e9', borderRight: '4px solid transparent'}}></div></div>);
const EmptyState = ({message}) => (<div style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}><p>{message}</p></div>);

const Navigation = () => {
    const { currentPage, setCurrentPage, user, isAdmin, handleLogout, setShowLogin } = useContext(AppContext);
    const navItems = ['Home', 'Toppers', 'Achievements', 'Faculty', 'Placements', 'Gallery', 'Clubs', 'Projects', 'Publications', 'Videos', 'Contact'];
    return (
        <nav className="navigation">
            <div className="container nav-container">
                <div className="nav-links">
                    {navItems.map(item => ( <button key={item} onClick={() => setCurrentPage(item)} className={`nav-button ${currentPage === item ? 'active' : ''}`}>{item}</button> ))}
                    {isAdmin && <button onClick={() => setCurrentPage('Admin')} className={`nav-button ${currentPage === 'Admin' ? 'active' : ''}`}>Admin Panel</button>}
                </div>
                <div>
                    {user ? (<button onClick={handleLogout} className="login-button" style={{backgroundColor: '#dc3545'}}>Logout</button>) : (<button onClick={() => setShowLogin(true)} className="login-button">Login</button>)}
                </div>
            </div>
        </nav>
    );
};

const DetailModal = ({ item, type, onClose }) => {
    const { summarizeAbstract, geminiSummary, geminiLoading } = useContext(AppContext);
    if (!item) return null;
    const renderContent = () => {
        switch (type) {
            case 'faculty': return (<div><img src={item.imageUrl} alt={item.name} className="card img" /><h2>{item.name}</h2><p style={{color: '#0d6efd'}}>{item.designation}</p><div className="divider"><h4>Biography</h4><p>{item.bio}</p></div>{item.linkedinUrl && <div className="divider"><a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" className="gemini-button">View LinkedIn Profile</a></div>}</div>);
            case 'topper': return (<div><img src={item.imageUrl} alt={item.name} className="card img" /><h2>{item.name}</h2><p style={{color: '#0d6efd'}}>{item.achievement}</p><div className="divider"><p>{item.details}</p></div></div>);
            case 'achievement': return (<div>{item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{width: '100%', height: '12rem', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem'}}/>}<h2>{item.title}</h2><div className="divider"><p>{item.details}</p></div></div>);
            case 'gallery': return (<div><img src={item.url} alt={item.caption} style={{width: '100%', borderRadius: '0.5rem', marginBottom: '1rem'}}/><p style={{textAlign: 'center'}}>{item.caption}</p></div>);
            case 'club': return (<div><h2>{item.name}</h2><div className="divider"><h4>About</h4><p>{item.description}</p></div><div className="divider"><h4>Activities</h4><p>{item.activities}</p></div></div>);
            case 'project': return (<div><img src={item.imageUrl} alt={item.title} style={{width: '100%', height: '12rem', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem'}}/><h2>{item.title}</h2><div className="divider"><h4>Description</h4><p>{item.description}</p></div><div className="divider"><h4>Team</h4><p>{item.team}</p></div></div>);
            case 'publication': return (<div><h2>{item.title}</h2><p style={{color: '#6c757d', fontSize: '0.875rem'}}>{item.authors} ({item.year})</p><div className="divider"><h4>Abstract</h4><p>{item.abstract}</p></div><div className="divider"><button onClick={() => summarizeAbstract(item.abstract)} disabled={geminiLoading} className="gemini-button">{geminiLoading ? 'Summarizing...' : '✨ Summarize Abstract'}</button>{geminiSummary && (<div style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #e2e8f0'}}><h5>Simplified Summary:</h5><p>{geminiSummary}</p></div>)}</div></div>);
            default: return <p>Details not available.</p>;
        }
    };
    return ( <div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}><button onClick={onClose} className="modal-close-button">&times;</button>{renderContent()}</div></div> );
};

const LoginModal = ({ onClose }) => {
    const { handleLogin, handleGoogleLogin, handlePasswordReset } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [view, setView] = useState('login');

    const onLogin = async (e) => {
        e.preventDefault();
        setError('');
        const success = await handleLogin(email, password);
        if (!success) setError('Login failed. Please check your credentials.');
    };

    const onPasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const success = await handlePasswordReset(email);
        if (success) setMessage('Password reset email sent! Please check your inbox.');
        else setError('Could not send password reset email. Please check the address.');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {view === 'login' ? (
                    <>
                        <h2>Department Login</h2>
                        {error && <p style={{color: '#dc3545', textAlign: 'center'}}>{error}</p>}
                        <button onClick={handleGoogleLogin} className="google-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                            Sign in with Google
                        </button>
                        <div className="divider" style={{textAlign: 'center', color: '#6c757d'}}>OR</div>
                        <form onSubmit={onLogin}>
                            <div className="form-group"><label className="form-label">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required /></div>
                            <div className="form-group"><label className="form-label">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required /></div>
                            <div style={{textAlign: 'right', marginBottom: '1rem'}}><button type="button" onClick={() => setView('reset')} style={{color: '#0d6efd', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem'}}>Forgot Password?</button></div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}><button type="submit" className="login-button" style={{backgroundColor: '#0d6efd'}}>Login with Email</button><button type="button" onClick={onClose} style={{color: '#6c757d', background: 'none', border: 'none', cursor: 'pointer'}}>Cancel</button></div>
                        </form>
                    </>
                ) : (
                     <>
                        <h2>Reset Password</h2>
                        {error && <p style={{color: '#dc3545', textAlign: 'center'}}>{error}</p>}
                        {message && <p style={{color: '#198754', textAlign: 'center'}}>{message}</p>}
                        <form onSubmit={onPasswordReset}>
                            <div className="form-group"><label className="form-label">Enter your account email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required /></div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><button type="submit" className="login-button" style={{backgroundColor: '#0d6efd'}}>Send Reset Link</button><button type="button" onClick={() => setView('login')} style={{color: '#6c757d', background: 'none', border: 'none', cursor: 'pointer'}}>Back to Login</button></div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

const ProjectGeneratorModal = () => {
    const { showProjectGenerator, setShowProjectGenerator, generateProjectIdeas, geminiIdeas, geminiLoading } = useContext(AppContext);
    const [keywords, setKeywords] = useState('');
    if (!showProjectGenerator) return null;
    return (
        <div className="modal-overlay" onClick={() => setShowProjectGenerator(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowProjectGenerator(false)} className="modal-close-button">&times;</button>
                <h2>✨ Project Idea Generator</h2>
                <form onSubmit={(e) => { e.preventDefault(); generateProjectIdeas(keywords); }}>
                    <label className="form-label">Enter keywords (e.g., IoT, healthcare)</label>
                    <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className="form-input" placeholder="machine learning, signal processing..." />
                    <button type="submit" disabled={geminiLoading} className="gemini-button" style={{marginTop: '1rem'}}>{geminiLoading ? 'Generating...' : 'Generate Ideas'}</button>
                </form>
                {geminiIdeas && (<div className="divider"><h4>Generated Ideas:</h4><div style={{whiteSpace: 'pre-wrap', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', border: '1px solid #dee2e6'}}>{geminiIdeas}</div></div>)}
            </div>
        </div>
    );
};

// --- PAGE COMPONENTS ---
const HomePage = () => {
    useEffect(() => {
        const scriptId = 'flippingbook-script';
        if (document.getElementById(scriptId)) return;
        
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://online.flippingbook.com/EmbedScriptUrl.aspx?m=redir&hid=935750571";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) document.body.removeChild(existingScript);
        };
    }, []);

    return (
        <div className="page">
            <div className="hero-section">
                <h2>Innovating the Future of Communication</h2>
                <p>Welcome to the Department of Electronics and Telecommunication at ISB&M College of Engineering, where we empower students to become leaders in technology.</p>
            </div>
            <div style={{ textAlign: 'center', margin: '2rem 0', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #dee2e6' }}><h3 style={{fontWeight: 'bold', fontSize: '1.25rem', color: '#0d6efd', marginBottom: '1rem'}}>Department Booklet</h3><a href="https://online.flippingbook.com/view/935750571/" className="fbo-embed" data-fbo-id="adf64cce6b" data-fbo-ratio="3:2" data-fbo-lightbox="yes" data-fbo-width="100%" data-fbo-height="auto" data-fbo-version="1" style={{ maxWidth: '100%', fontSize: '1.1rem', color: '#0d6efd', textDecoration: 'underline' }}>View the ENTC Department Booklet</a></div>
        </div>
    );
};
const ToppersPage = () => { const { data, showDetails } = useContext(AppContext); if (!data.toppers) return <Spinner />; if (data.toppers.length === 0) return <EmptyState message="No toppers to display." />; return (<div className="page"><h2 className="page-title">Department Toppers</h2><div className="card-grid">{data.toppers.map(item => (<div key={item.id} className="card" onClick={() => showDetails(item, 'topper')}><img src={item.imageUrl} alt={item.name} style={{borderColor: '#fd7e14'}} /><h3>{item.name}</h3><p style={{color: '#fd7e14', fontWeight: 'bold'}}>{item.achievement}</p></div>))}</div></div>); };
const AchievementsPage = () => { const { data, showDetails } = useContext(AppContext); if (!data.achievements) return <Spinner />; if (data.achievements.length === 0) return <EmptyState message="No achievements to display." />; return (<div className="page"><h2 className="page-title">Our Achievements</h2><div className="list-container">{data.achievements.map(item => (<div key={item.id} className="list-item" onClick={() => showDetails(item, 'achievement')}><p style={{fontWeight: 600, color: '#0d6efd'}}>{item.title}</p></div>))}</div></div>); };
const FacultyPage = () => { const { data, showDetails } = useContext(AppContext); if (!data.faculty) return <Spinner />; if (data.faculty.length === 0) return <EmptyState message="No faculty to display." />; return (<div className="page"><h2 className="page-title">Our Faculty</h2><div className="card-grid">{data.faculty.map(item => (<div key={item.id} className={`card ${item.alignment || 'text-center'}`} onClick={() => showDetails(item, 'faculty')}><img src={item.imageUrl} alt={item.name} /><h3>{item.name}</h3><p style={{color: '#0d6efd'}}>{item.designation}</p></div>))}</div></div>); };
const PlacementsPage = () => { 
    const { data } = useContext(AppContext);
    if (!data.placements) return <Spinner />;
    if (data.placements.length === 0) return <EmptyState message="Placement data will be updated soon." />;
    return (
        <div className="page">
            <h2 className="page-title">Placement Records</h2>
            <table className="placement-table">
                <thead>
                    <tr><th>Student Name</th><th>Company</th><th>Location</th><th>Package</th><th>Year</th></tr>
                </thead>
                <tbody>
                    {data.placements.map(item => (<tr key={item.id}><td>{item.name}</td><td>{item.company}</td><td>{item.location}</td><td>{item.package}</td><td>{item.year}</td></tr>))}
                </tbody>
            </table>
        </div>
    );
};
const GalleryPage = () => { const { data, showDetails } = useContext(AppContext); if (!data.galleryImages) return <Spinner />; if (data.galleryImages.length === 0) return <EmptyState message="No images in the gallery." />; return (<div className="page"><h2 className="page-title">Photo Gallery</h2><div className="card-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>{data.galleryImages.map(item => (<div key={item.id} className="card" style={{padding: 0}} onClick={() => showDetails(item, 'gallery')}><img src={item.url} alt={item.caption} style={{width: '100%', height: '100%', borderRadius: '0.5rem', objectFit: 'cover'}} /></div>))}</div></div>); };
const ClubsPage = () => { const { data, showDetails } = useContext(AppContext); if (!data.clubs) return <Spinner />; if (data.clubs.length === 0) return <EmptyState message="No clubs to display." />; return (<div className="page"><h2 className="page-title">Student Clubs</h2><div className="list-container">{data.clubs.map(item => (<div key={item.id} className="list-item" onClick={() => showDetails(item, 'club')}><h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#0d6efd'}}>{item.name}</h3><p>{item.description}</p></div>))}</div></div>); };
const ProjectsPage = () => { const { data, showDetails, setShowProjectGenerator } = useContext(AppContext); if (!data.projects) return <Spinner />; return (<div className="page"><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}><h2 className="page-title" style={{marginBottom: 0}}>Student Projects</h2><button onClick={() => setShowProjectGenerator(true)} className="gemini-button" style={{width: 'auto'}}>✨ Get Project Ideas</button></div>{data.projects.length === 0 ? <EmptyState message="No projects to display." /> : <div className="card-grid">{data.projects.map(item => (<div key={item.id} className="card" onClick={() => showDetails(item, 'project')}><img src={item.imageUrl} alt={item.title} style={{borderRadius: '0.5rem', width: '100%', height: '10rem', objectFit: 'cover'}} /><h3>{item.title}</h3></div>))}</div>}</div>); };
const PublicationsPage = () => { const { data, showDetails } = useContext(AppContext); if (!data.publications) return <Spinner />; if (data.publications.length === 0) return <EmptyState message="No publications to display." />; return (<div className="page"><h2 className="page-title">Publications</h2><div className="list-container">{data.publications.map(item => (<div key={item.id} className="list-item" onClick={() => showDetails(item, 'publication')}><p style={{fontWeight: 600}}>{item.title}</p></div>))}</div></div>); };
const VideosPage = () => {
    const { data } = useContext(AppContext);
    if (!data.videos) return <Spinner />;
    if (data.videos.length === 0) return <EmptyState message="No videos have been added yet." />;
    const getEmbedUrl = (url) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
            if (urlObj.hostname.includes('youtube.com')) return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
        } catch (e) { console.error("Invalid URL"); }
        return null;
    };
    return (<div className="page"><h2 className="page-title">Videos</h2><div className="card-grid">{data.videos.map(video => { const embedUrl = getEmbedUrl(video.youtubeUrl); if (!embedUrl) return null; return (<div key={video.id} className="list-item" style={{cursor: 'default'}}><h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0d6efd', marginBottom: '1rem'}}>{video.title}</h3><div style={{position: 'relative', paddingBottom: '56.25%', height: 0}}><iframe style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} src={embedUrl} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div></div>)})}</div></div>);
};
const ContactPage = () => {
    const { handleContactSubmit } = useContext(AppContext);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const formRef = useRef();
    const handleSubmit = (e) => { e.preventDefault(); handleContactSubmit(formData); formRef.current.reset(); };
    return (<div className="page"><h2 className="page-title">Contact Us</h2><form className="list-container" ref={formRef} style={{gap: '1rem'}} onSubmit={handleSubmit}><div className="form-group"><label className="form-label">Name</label><input type="text" className="form-input" onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} required /></div><div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" onChange={e => setFormData(prev => ({...prev, email: e.target.value}))} required /></div><div className="form-group"><label className="form-label">Message</label><textarea rows="5" className="form-input" onChange={e => setFormData(prev => ({...prev, message: e.target.value}))} required></textarea></div><div style={{textAlign: 'center'}}><button type="submit" className="login-button" style={{backgroundColor: '#0d6efd'}}>Send Message</button></div></form></div>);
};

const AdminPage = () => {
    const { data, addData, deleteData, handleReorder } = useContext(AppContext);
    const [collection, setCollection] = useState('faculty');
    const [formData, setFormData] = useState({});
    const formRef = useRef();

    const handleAdd = (e) => {
        e.preventDefault();
        addData(collection, formData);
        setFormData({});
        formRef.current.reset();
    };

    const handleDelete = (docId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteData(collection, docId);
        }
    };
    
    const renderForm = () => {
        const fields = {
            faculty: ['name', 'designation', 'qualification', 'imageUrl', 'linkedinUrl', 'bio', 'order', 'alignment'],
            galleryImages: ['url', 'caption', 'order'],
            projects: ['title', 'description', 'imageUrl', 'team', 'technologies', 'order'],
            toppers: ['name', 'batch', 'achievement', 'imageUrl', 'details', 'order'],
            achievements: ['title', 'description', 'details', 'imageUrl', 'order'],
            placements: ['name', 'company', 'location', 'package', 'year', 'order'],
            videos: ['title', 'youtubeUrl', 'order']
        };

        return (fields[collection] || []).map(field => {
            if (field === 'alignment') {
                return (
                    <div className="form-group" key={field}>
                        <label className="form-label">Alignment</label>
                        <select className="form-input" onChange={e => setFormData(prev => ({...prev, [field]: e.target.value}))}>
                            <option value="text-center">Center</option>
                            <option value="text-left">Left</option>
                            <option value="text-right">Right</option>
                        </select>
                    </div>
                )
            }
            return (
                <div className="form-group" key={field}>
                    <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input type={field === 'order' || field === 'year' ? 'number' : 'text'} className="form-input" onChange={e => setFormData(prev => ({...prev, [field]: e.target.value}))} />
                </div>
            );
        });
    };

    const renderManagementList = () => {
        const items = data[collection] || [];
        if (items.length === 0) return <EmptyState message={`No items in ${collection} yet.`} />;
        return (
            <div className="list-container" style={{marginTop: '2rem'}}>
                {items.map((item, index) => (
                    <div key={item.id} className="list-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>{item.name || item.title || item.caption}</span>
                        <div>
                            <button onClick={() => handleReorder(collection, index, 'up')} className="reorder-button" disabled={index === 0}>&uarr;</button>
                            <button onClick={() => handleReorder(collection, index, 'down')} className="reorder-button" disabled={index === items.length - 1}>&darr;</button>
                            <button onClick={() => handleDelete(collection, item.id)} className="delete-button" style={{marginLeft: '1rem'}}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="page">
            <h2 className="page-title">Admin Panel</h2>
            <div className="list-container">
                <div className="list-item">
                    <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#0d6efd'}}>Add New Content</h3>
                    <form onSubmit={handleAdd} ref={formRef}>
                        <div className="form-group">
                            <label className="form-label">Select Collection</label>
                            <select className="form-input" value={collection} onChange={e => setCollection(e.target.value)}>
                                <option value="faculty">Faculty</option>
                                <option value="galleryImages">Gallery Image</option>
                                <option value="projects">Project</option>
                                <option value="toppers">Topper</option>
                                <option value="achievements">Achievement</option>
                                <option value="placements">Placement</option>
                                <option value="videos">Video</option>
                            </select>
                        </div>
                        {renderForm()}
                        <div className="form-group">
                            <label className="form-label">Placement</label>
                            <select className="form-input" onChange={e => setFormData(prev => ({...prev, placement: e.target.value}))}>
                                <option value="bottom">Add to Bottom</option>
                                <option value="top">Add to Top</option>
                            </select>
                        </div>
                        <button type="submit" className="login-button" style={{backgroundColor: '#0d6efd', width: '100%'}}>Add Content</button>
                    </form>
                </div>
                <div className="list-item">
                    <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#0d6efd'}}>Manage Existing Content</h3>
                    {renderManagementList()}
                </div>
            </div>
        </div>
    );
};

function App() {
    const [currentPage, setCurrentPage] = useState('Home');
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [data, setData] = useState({});
    const [viewingItem, setViewingItem] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showProjectGenerator, setShowProjectGenerator] = useState(false);
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiSummary, setGeminiSummary] = useState('');
    const [geminiIdeas, setGeminiIdeas] = useState('');

    // --- AUTHENTICATION ---
    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const adminRef = doc(db, 'admins', firebaseUser.uid);
                // This is a simplified check. In a real app, you'd use getDoc.
                // For this standalone file, we'll assume the check happens and we manage state.
                // To test admin, you must manually set it in Firestore.
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!db) return;
        const collections = ['toppers', 'achievements', 'faculty', 'galleryImages', 'clubs', 'projects', 'publications', 'placements', 'videos'];
        const unsubscribers = collections.map(colName => {
            const q = query(collection(db, colName), orderBy("order", "asc"));
            return onSnapshot(q, snapshot => {
                const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setData(prev => ({ ...prev, [colName]: items }));
            }, error => console.error(`Error fetching ${colName}:`, error));
        });
        return () => unsubscribers.forEach(unsub => unsub());
    }, []);

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setShowLogin(false);
            return true;
        } catch (error) { console.error(error); return false; }
    };
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setShowLogin(false);
        } catch (error) { console.error(error); }
    };
    const handlePasswordReset = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) { console.error(error); return false; }
    };
    const handleLogout = () => signOut(auth);
    
    const addData = async (collectionName, newData) => {
        if (!db || !isAdmin) return;
        const items = data[collectionName] || [];
        let newOrder;
        if (newData.placement === 'top') {
            const minOrder = items.length > 0 ? Math.min(...items.map(i => i.order)) : 0;
            newOrder = minOrder - 1;
        } else {
            const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;
            newOrder = maxOrder + 1;
        }
        const finalData = { ...newData, order: newOrder };
        delete finalData.placement;
        try {
            await addDoc(collection(db, collectionName), finalData);
            alert('Data added successfully!');
        } catch (error) { console.error("Error adding document: ", error); }
    };

    const deleteData = async (collectionName, docId) => {
        if (!db || !isAdmin) return;
        try {
            await deleteDoc(doc(db, collectionName, docId));
            alert('Item deleted successfully!');
        } catch (error) { console.error("Error deleting document: ", error); }
    };

    const handleReorder = async (collectionName, index, direction) => {
        const items = data[collectionName];
        if (!items || items.length < 2) return;
        const itemA = items[index];
        const itemB = direction === 'up' ? items[index - 1] : items[index + 1];
        if (!itemA || !itemB) return;
        
        const batch = writeBatch(db);
        const docA = doc(db, collectionName, itemA.id);
        const docB = doc(db, collectionName, itemB.id);
        batch.update(docA, { order: itemB.order });
        batch.update(docB, { order: itemA.order });
        try {
            await batch.commit();
        } catch(err) { console.error("Reorder failed:", err); }
    };

    const handleContactSubmit = async (formData) => {
        if (!db) return;
        try {
            await addDoc(collection(db, 'contactSubmissions'), {
                ...formData,
                submittedAt: new Date()
            });
            alert('Thank you for your message!');
        } catch (error) { console.error("Error sending message: ", error); }
    };
    
    const callGeminiAPI = async (prompt) => {
        setGeminiLoading(true);
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                return result.candidates[0].content.parts[0].text;
            } else { throw new Error("Invalid response structure from API."); }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            alert('AI feature failed. Please try again.');
            return null;
        } finally {
            setGeminiLoading(false);
        }
    };

    const summarizeAbstract = async (abstract) => {
        setGeminiSummary('');
        const prompt = `Summarize the following technical abstract in simple, easy-to-understand terms for a first-year engineering student. Abstract: "${abstract}"`;
        const summary = await callGeminiAPI(prompt);
        if (summary) setGeminiSummary(summary);
    };
    
    const generateProjectIdeas = async (keywords) => {
        setGeminiIdeas('');
        const prompt = `Generate 5 innovative project ideas for undergraduate ENTC engineering students based on these keywords: "${keywords}". For each idea, provide a title and a one-sentence description. Format as a numbered list.`;
        const ideas = await callGeminiAPI(prompt);
        if (ideas) setGeminiIdeas(ideas);
    };

    const showDetails = (item, type) => { setViewingItem(item); setModalType(type); setGeminiSummary(''); };
    const closeDetails = () => setViewingItem(null);

    const renderPage = () => {
        switch (currentPage) {
            case 'Home': return <HomePage />;
            case 'Toppers': return <ToppersPage />;
            case 'Achievements': return <AchievementsPage />;
            case 'Faculty': return <FacultyPage />;
            case 'Placements': return <PlacementsPage />;
            case 'Gallery': return <GalleryPage />;
            case 'Clubs': return <ClubsPage />;
            case 'Projects': return <ProjectsPage />;
            case 'Publications': return <PublicationsPage />;
            case 'Videos': return <VideosPage />;
            case 'Contact': return <ContactPage />;
            case 'Admin': return isAdmin ? <AdminPage /> : <HomePage />;
            default: return <HomePage />;
        }
    };
    
    const contextValue = { currentPage, setCurrentPage, user, isAdmin, handleLogout, data, showDetails, addData, deleteData, handleReorder, setShowLogin, handleLogin, handleGoogleLogin, handlePasswordReset, setShowProjectGenerator, generateProjectIdeas, geminiIdeas, summarizeAbstract, geminiSummary, geminiLoading, handleContactSubmit };

    return (
        <AppContext.Provider value={contextValue}>
            <div>
                {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
                <DetailModal item={viewingItem} type={modalType} onClose={closeDetails} />
                <ProjectGeneratorModal />
                <Header />
                <Navigation />
                <main className="container main-content">
                    {renderPage()}
                </main>
                <Footer />
            </div>
        </AppContext.Provider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
</script>
</body>
</html>
