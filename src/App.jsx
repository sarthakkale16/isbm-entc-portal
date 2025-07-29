import React, { useState, useEffect, createContext, useContext } from 'react';

// --- 1. MOCK DATABASE ---
// All the data is now stored locally here. You can edit this to change the content.
const mockData = {
    toppers: [
        { id: 1, name: 'Priya Sharma', batch: '2024', achievement: 'University Rank 1', imageUrl: 'https://placehold.co/150x150/FBBF24/FFFFFF?text=PS', details: 'Priya secured the top position in the university with a GPA of 9.8. She excelled in subjects like VLSI Design and Wireless Communication.' },
        { id: 2, name: 'Amit Singh', batch: '2023', achievement: 'Gold Medalist', imageUrl: 'https://placehold.co/150x150/FBBF24/FFFFFF?text=AS', details: 'Amit was awarded the Gold Medal for his outstanding final year project on embedded systems for agriculture.' },
        { id: 3, name: 'Sneha Reddy', batch: '2024', achievement: 'Best Project Award', imageUrl: 'https://placehold.co/150x150/FBBF24/FFFFFF?text=SR', details: 'Sneha and her team won the Best Project Award for their innovative AI-based sign language translator.' },
        { id: 4, name: 'Amit Singh', batch: '2021', achievement: 'Forza', imageUrl: 'https://placehold.co/150x150/FBBF24/FFFFFF?text=AS', details: ' for his outstanding final year project on embedded systems for agriculture.' },
    ],
    achievements: [
        { id: 1, title: 'Smart India Hackathon 2023', description: 'Our team won the first prize in the software edition.', details: 'A team of four students from the ENTC department developed a solution for waste management using AI and IoT, securing the top spot among 500+ teams.' },
        { id: 2, title: 'National Robotics Competition', description: 'Secured second place in the line-follower robot category.', details: 'The Robotics Club team built an autonomous robot that navigated a complex track in record time, earning them the runner-up position.' },
        { id: 3, title: 'IEEE Paper Presentation', description: 'Best paper award for research in 5G technology.', details: 'A research paper authored by Prof. S. B. Patil and two final-year students was awarded "Best Paper" at the annual IEEE conference.' },
    ],
    faculty: [
        { id: 1, name: 'Dr. R. K. Gupta', designation: 'Head of Department', qualification: 'Ph.D. (IIT Bombay)', imageUrl: 'https://placehold.co/150x150/93C5FD/FFFFFF?text=RG', email: 'rk.gupta@isbm.ac.in', specializations: 'Wireless Communication, 5G Networks', bio: 'Dr. R. K. Gupta has over 20 years of experience in academia and research. He has published over 50 papers in international journals and conferences.' },
        { id: 2, name: 'Prof. S. B. Patil', designation: 'Professor', qualification: 'M.Tech (Signal Processing)', imageUrl: 'https://placehold.co/150x150/93C5FD/FFFFFF?text=SP', email: 'sb.patil@isbm.ac.in', specializations: 'Digital Signal Processing, Image Processing', bio: 'Prof. S. B. Patil is an expert in signal processing algorithms and has guided numerous student projects in the domain of image and speech analysis.' },
        { id: 3, name: 'Prof. M. Joshi', designation: 'Associate Professor', qualification: 'M.E. (VLSI Design)', imageUrl: 'https://placehold.co/150x150/93C5FD/FFFFFF?text=MJ', email: 'm.joshi@isbm.ac.in', specializations: 'VLSI, Embedded Systems, Low Power Design', bio: 'Prof. M. Joshi has a keen interest in low-power VLSI design and has collaborated with several semiconductor companies on research projects.' },
        { id: 4, name: 'Prof. V. Iyer', designation: 'Assistant Professor', qualification: 'M.Tech (Communication)', imageUrl: 'https://placehold.co/150x150/93C5FD/FFFFFF?text=VI', email: 'v.iyer@isbm.ac.in', specializations: 'Optical Communication, Data Networks', bio: 'Prof. V. Iyer is a passionate teacher known for making complex networking topics easy to understand. She also heads the student networking club.' },
    ],
    students: [
        { id: 1, name: 'Sarthak Deshmukh', email: 'sarthak@example.com', batch: '2025', achievements: 'Class Representative, Topper in Semester 3.' },
        { id: 2, name: 'Aisha Khan', email: 'aisha@example.com', batch: '2025', achievements: 'Lead of the Robotics Club.' },
    ],
    placementStats: {
        highestPackage: '18 LPA',
        averagePackage: '6.5 LPA',
    },
    galleryImages: [
        { id: 1, url: 'https://placehold.co/500x300/A5B4FC/FFFFFF?text=Workshop', caption: 'Robotics Workshop' },
        { id: 2, url: 'https://placehold.co/500x400/A5B4FC/FFFFFF?text=Tech+Fest', caption: 'Annual Tech Fest' },
        { id: 3, url: 'https://placehold.co/500x500/A5B4FC/FFFFFF?text=Seminar', caption: 'Guest Seminar' },
        { id: 4, url: 'https://placehold.co/500x350/A5B4FC/FFFFFF?text=Lab+Session', caption: 'Lab Session' },
    ],
    clubs: [
        { id: 1, name: 'Robotics Club', description: 'A community for students passionate about building and programming robots.', head: 'Aisha Khan', activities: 'Workshops on Arduino and Raspberry Pi, Participation in national robotics competitions.' },
        { id: 2, name: 'Coding Society', description: 'Focuses on competitive programming and software development projects.', head: 'Rohan Verma', activities: 'Weekly coding challenges, Guest lectures from industry experts, Hackathons.' },
        { id: 3, name: 'IEEE Student Branch', description: 'Organizes technical workshops, seminars, and networking events.', head: 'Prof. V. Iyer', activities: 'Seminars on latest technologies, Industrial visits, Student Professional Awareness Conferences (SPAC).' },
    ],
    projects: [
        { id: 1, title: 'IoT Based Smart Home', description: 'A project to control home appliances using a web interface.', imageUrl: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=IoT+Project', team: 'Amit, Priya, Sneha', technologies: 'Raspberry Pi, Python, React, Firebase' },
        { id: 2, title: 'AI Sign Language Translator', description: 'A real-time sign language to text/speech converter using AI.', imageUrl: 'https://placehold.co/600x400/10B981/FFFFFF?text=AI+Project', team: 'Rohan, Meera, Karan', technologies: 'Python, TensorFlow, OpenCV, Flask' },
    ],
    publications: [
        { id: 1, title: 'A Novel Approach to 5G Antenna Design', authors: 'Dr. R. K. Gupta, S. B. Patil', journal: 'IEEE Transactions on Antennas', year: '2023', abstract: 'This paper presents a novel microstrip patch antenna design for 5G communication systems, achieving wider bandwidth and higher gain compared to conventional designs. The proposed antenna utilizes a unique substrate-integrated waveguide (SIW) feeding mechanism and a defected ground structure (DGS) to enhance its radiation characteristics. Simulation results, conducted using industry-standard software, show a 25% increase in bandwidth and a 3dB improvement in peak gain over existing models. The compact size and efficient performance make it a suitable candidate for next-generation mobile handsets and base stations.' },
        { id: 2, title: 'Low-Power VLSI Architectures for Deep Learning Accelerators', authors: 'Prof. M. Joshi, Priya Sharma', journal: 'Journal of Low Power Electronics', year: '2024', abstract: 'This research explores various architectural techniques to reduce power consumption in hardware accelerators for deep neural networks without compromising performance. We introduce a novel dataflow architecture that minimizes off-chip memory access, a primary source of power drain. Furthermore, we implement clock gating and power gating strategies at both the architectural and circuit levels. Our proposed accelerator, fabricated using a 28nm CMOS process, demonstrates a 40% reduction in power consumption for standard deep learning workloads like ResNet-50, making it ideal for edge computing devices.' },
    ]
};

// --- 2. CONTEXT FOR APP STATE MANAGEMENT ---
const AppContext = createContext();

// --- 3. HELPER COMPONENTS ---

// Loading Spinner
const Spinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
    </div>
);

// Empty State Message
const EmptyState = ({ message }) => (
    <div className="text-center p-8 text-gray-400">
        <p>{message}</p>
    </div>
);


// Message Box
const MessageBox = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} transition-transform duration-300 transform translate-x-0`}>
            <span>{message}</span>
            <button onClick={onDismiss} className="ml-4 font-bold">X</button>
        </div>
    );
};

// --- 4. PAGE COMPONENTS ---

// Header Component
const Header = () => {
    return (
        <header className="bg-gray-800 p-4 shadow-md text-center border-b border-gray-700">
            <h1 className="text-4xl font-bold text-white">ISBM College of Engineering</h1>
            <h3 className="text-2xl font-semibold text-gray-300 mt-1">Department of Electronics and Telecommunication</h3>
        </header>
    );
};

// Navigation Component
const Navigation = () => {
    const { currentPage, setCurrentPage, user, setShowLogin } = useContext(AppContext);
    const navItems = ['Home', 'Toppers', 'Achievements', 'Faculty', 'Placements', 'Gallery', 'Clubs', 'Projects', 'Publications', 'Contact'];

    return (
        <nav className="bg-gray-800 text-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div className="flex flex-wrap">
                        {navItems.map(item => (
                            <button
                                key={item}
                                onClick={() => setCurrentPage(item)}
                                className={`py-4 px-2 font-medium transition duration-300 ${currentPage === item ? 'text-blue-400 border-b-4 border-blue-400' : 'hover:text-blue-300'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div>
                        {user ? (
                             <button onClick={() => setCurrentPage('StudentInfo')} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold transition">My Profile</button>
                        ) : (
                            <button onClick={() => setShowLogin(true)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold transition">Login</button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};


// Home Page
const HomePage = () => (
    <div className="p-8">
  <div className="text-center mb-12">
    <h2 className="text-3xl font-bold text-white">
      Welcome to the ENTC Department
    </h2>
    <p className="text-gray-400 mt-2">
      A hub of innovation and excellence in engineering.
    </p>

    {/* Centered PEG image */}
    <div className="flex justify-center mt-6">
      <img
        src="https://www.isbmcoe.org/images/PEG.jpg"
        alt="ENTC Department Image – PEG"
        className="w-64 h-auto rounded-lg shadow-lg"
      />
    </div>
  </div>

  <div className="p-6 bg-gray-800 rounded-lg border-l-4 border-blue-500">
    <h3 className="font-bold text-xl text-blue-400">About This Portal</h3>
    <p className="mt-2 text-gray-300">
      This portal is a central hub for the Electronics and Telecommunication
      department. Here you can find information about our top‑performing
      students, recent achievements, distinguished faculty members,
      placement statistics, and much more. Use the navigation bar above to
      explore the various sections.
    </p>
  </div>
</div>
);

// Toppers Page
const ToppersPage = () => {
    const { data, showDetails } = useContext(AppContext);
    
    if (!data.toppers) return <Spinner />;
    if (data.toppers.length === 0) return <EmptyState message="No toppers to display at this time." />;

    return (
        <div className="p-8 bg-gray-900">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Department Toppers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.toppers.map(topper => (
                    <div key={topper.id} className="bg-gray-800 p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer" onClick={() => showDetails(topper, 'topper')}>
                        <img src={topper.imageUrl} alt={topper.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-yellow-400 object-cover" />
                        <h3 className="text-xl font-bold text-blue-400">{topper.name}</h3>
                        <p className="text-gray-300 font-semibold">{topper.batch}</p>
                        <p className="text-yellow-500 font-bold mt-1">{topper.achievement}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Achievements Page
const AchievementsPage = () => {
    const { data, showDetails } = useContext(AppContext);
    
    if (!data.achievements) return <Spinner />;
    if (data.achievements.length === 0) return <EmptyState message="No achievements have been recorded yet." />;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Our Achievements</h2>
            <ul className="space-y-4 max-w-4xl mx-auto">
                {data.achievements.map(ach => (
                    <li key={ach.id} className="bg-gray-800 p-4 rounded-md shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => showDetails(ach, 'achievement')}>
                        <span className="font-semibold text-blue-400">{ach.title}: </span>
                        <span className="text-gray-300">{ach.description}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Faculty Page
const FacultyPage = () => {
    const { data, showDetails } = useContext(AppContext);

    if (!data.faculty) return <Spinner />;
    if (data.faculty.length === 0) return <EmptyState message="Faculty information is not available at this time." />;

    return (
        <div className="p-8 bg-gray-900">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Our Faculty</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.faculty.map(fac => (
                    <div 
                        key={fac.id} 
                        className="bg-gray-800 p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                        onClick={() => showDetails(fac, 'faculty')}
                    >
                        <img src={fac.imageUrl} alt={fac.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                        <h3 className="text-xl font-bold text-white">{fac.name}</h3>
                        <p className="text-blue-400">{fac.designation}</p>
                        <p className="text-gray-400 text-sm mt-1">{fac.qualification}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Student Info Page (Protected Route)
const StudentInfoPage = () => {
    const { user, data, handleLogout } = useContext(AppContext);

    if (!user) {
        return <div className="p-8 text-center text-gray-300"><p>Please log in to view this page.</p></div>;
    }
    
    if (!data.students) return <Spinner />;
    
    const studentData = data.students.find(s => s.email === user.email);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Student Profile</h2>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition">Logout</button>
            </div>
            {studentData ? (
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-gray-200">
                    <p><strong>Name:</strong> {studentData.name}</p>
                    <p><strong>Email:</strong> {studentData.email}</p>
                    <p><strong>Batch:</strong> {studentData.batch}</p>
                    <h4 className="text-xl font-semibold mt-4 text-blue-400">Academic Achievements:</h4>
                    <p>{studentData.achievements}</p>
                </div>
            ) : <EmptyState message="No profile information found for your account." />}
        </div>
    );
};

// Placements Page
const PlacementsPage = () => {
    const { data } = useContext(AppContext);
    
    if (!data.placementStats) return <Spinner />;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Placement Highlights</h2>
            <div className="text-center mb-8">
                <div className="flex justify-center space-x-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-4xl font-bold text-blue-400">{data.placementStats.highestPackage || 'N/A'}</p>
                        <p className="text-gray-400">Highest Package</p>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-4xl font-bold text-green-400">{data.placementStats.averagePackage || 'N/A'}</p>
                        <p className="text-gray-400">Average Package</p>
                    </div>
                </div>
            </div>
            <h3 className="text-2xl font-bold text-center my-8 text-white">Our Recruiters</h3>
            {/* Add recruiter logos here */}
        </div>
    );
};

// Gallery Page
const GalleryPage = () => {
    const { data, showDetails } = useContext(AppContext);

    if (!data.galleryImages) return <Spinner />;
    if (data.galleryImages.length === 0) return <EmptyState message="There are no photos in the gallery yet." />;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.galleryImages.map(img => (
                    <div key={img.id} className="overflow-hidden rounded-lg shadow-lg cursor-pointer" onClick={() => showDetails(img, 'gallery')}>
                        <img src={img.url} alt={img.caption} className="w-full h-full object-cover transform hover:scale-110 transition duration-500" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Clubs Page
const ClubsPage = () => {
    const { data, showDetails } = useContext(AppContext);
    
    if (!data.clubs) return <Spinner />;
    if (data.clubs.length === 0) return <EmptyState message="Information about student clubs is coming soon." />;

    return (
        <div className="p-8 bg-gray-900">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Student Clubs & Activities</h2>
            <div className="space-y-6 max-w-4xl mx-auto">
                 {data.clubs.map(club => (
                    <div key={club.id} className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => showDetails(club, 'club')}>
                        <h3 className="text-2xl font-bold text-blue-400">{club.name}</h3>
                        <p className="text-gray-300 mt-2">{club.description}</p>
                    </div>
                 ))}
            </div>
        </div>
    );
};

// Projects Page
const ProjectsPage = () => {
    const { data, showDetails, setShowProjectGenerator } = useContext(AppContext);
    
    if (!data.projects) return <Spinner />;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-bold text-white">Student Projects</h2>
                 <button onClick={() => setShowProjectGenerator(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                    ✨ Get Project Ideas
                 </button>
            </div>
            {data.projects.length === 0 ? <EmptyState message="Student projects will be showcased here soon." /> : (
                <div className="grid md:grid-cols-2 gap-8">
                    {data.projects.map(proj => (
                        <div key={proj.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer" onClick={() => showDetails(proj, 'project')}>
                            <img src={proj.imageUrl} alt={proj.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                                <p className="text-gray-400 mt-2">{proj.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Publications Page
const PublicationsPage = () => {
    const { data, showDetails } = useContext(AppContext);

    if (!data.publications) return <Spinner />;
    if (data.publications.length === 0) return <EmptyState message="No publications have been listed yet." />;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Journal Publications</h2>
            <ul className="space-y-4 max-w-4xl mx-auto">
                {data.publications.map(pub => (
                     <li key={pub.id} className="bg-gray-800 p-4 rounded-md shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => showDetails(pub, 'publication')}>
                        <p className="font-semibold text-white">{pub.title}</p>
                        <p className="text-sm text-gray-400">{pub.authors} - <i>{pub.journal}</i></p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Contact Page
const ContactPage = () => {
    const { handleFormSubmit } = useContext(AppContext);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleFormSubmit(formData);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="p-8 bg-gray-900">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Contact Us</h2>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-md">
                 <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-300 font-medium mb-2">Name</label>
                    <input type="text" id="name" name="name" value={formData.name} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-300 font-medium mb-2">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-300 font-medium mb-2">Subject</label>
                    <input type="text" id="subject" name="subject" value={formData.subject} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-300 font-medium mb-2">Message</label>
                    <textarea id="message" name="message" rows="5" value={formData.message} className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                </div>
                <div className="text-center">
                    <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 transition duration-300">
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    );
};

// Login Modal
const LoginModal = () => {
    const { showLogin, setShowLogin, handleLogin } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!showLogin) return null;

    const onLogin = (e) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">Department Login</h2>
                <form onSubmit={onLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-300">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600" required />
                    </div>
                    <div className="mb-6">
                         <label className="block text-gray-300">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600" required />
                    </div>
                    <div className="flex justify-between items-center">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Login</button>
                        <button type="button" onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-white">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Detail Modal for showing more info
const DetailModal = ({ item, type, onClose }) => {
    const { summarizeAbstract, geminiSummary, geminiLoading } = useContext(AppContext);
    if (!item) return null;

    const renderContent = () => {
        switch (type) {
            case 'faculty':
                return (
                    <div className="text-white">
                        <img src={item.imageUrl} alt={item.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                        <h2 className="text-2xl font-bold text-center">{item.name}</h2>
                        <p className="text-center text-blue-400">{item.designation}</p>
                        <p className="text-center text-gray-400 text-sm mb-4">{item.qualification}</p>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <h4 className="font-semibold text-lg">Biography</h4>
                            <p className="text-gray-300 mt-1">{item.bio}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold text-lg">Specializations</h4>
                            <p className="text-gray-300 mt-1">{item.specializations}</p>
                        </div>
                         <div className="mt-4">
                            <h4 className="font-semibold text-lg">Contact</h4>
                            <p className="text-gray-300 mt-1">{item.email}</p>
                        </div>
                    </div>
                );
            case 'topper':
                return (
                     <div className="text-white">
                        <img src={item.imageUrl} alt={item.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                        <h2 className="text-2xl font-bold text-center">{item.name}</h2>
                        <p className="text-center text-blue-400">{item.achievement}</p>
                        <p className="text-center text-gray-400 text-sm mb-4">Batch of {item.batch}</p>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <p className="text-gray-300 mt-1">{item.details}</p>
                        </div>
                    </div>
                );
            case 'achievement':
                 return (
                     <div className="text-white">
                        <h2 className="text-2xl font-bold text-center mb-4">{item.title}</h2>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <p className="text-gray-300 mt-1">{item.details}</p>
                        </div>
                    </div>
                );
            case 'gallery':
                return (
                    <div>
                        <img src={item.url} alt={item.caption} className="w-full h-auto rounded-lg mx-auto mb-4 object-contain" style={{maxHeight: '70vh'}}/>
                        <p className="text-center text-gray-200 font-semibold">{item.caption}</p>
                    </div>
                );
            case 'club':
                 return (
                     <div className="text-white">
                        <h2 className="text-2xl font-bold text-center mb-4">{item.name}</h2>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <h4 className="font-semibold text-lg">About the Club</h4>
                            <p className="text-gray-300 mt-1">{item.description}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold text-lg">Key Activities</h4>
                            <p className="text-gray-300 mt-1">{item.activities}</p>
                        </div>
                         <div className="mt-4">
                            <h4 className="font-semibold text-lg">Faculty/Student Head</h4>
                            <p className="text-gray-300 mt-1">{item.head}</p>
                        </div>
                    </div>
                );
            case 'project':
                return (
                     <div className="text-white">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-48 rounded-lg mx-auto mb-4 object-cover"/>
                        <h2 className="text-2xl font-bold text-center mb-4">{item.title}</h2>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <h4 className="font-semibold text-lg">Description</h4>
                            <p className="text-gray-300 mt-1">{item.description}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold text-lg">Team Members</h4>
                            <p className="text-gray-300 mt-1">{item.team}</p>
                        </div>
                         <div className="mt-4">
                            <h4 className="font-semibold text-lg">Technologies Used</h4>
                            <p className="text-gray-300 mt-1">{item.technologies}</p>
                        </div>
                    </div>
                );
            case 'publication':
                 return (
                     <div className="text-white">
                        <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                        <p className="text-sm text-gray-400 mb-4">{item.authors} ({item.year})</p>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <h4 className="font-semibold text-lg">Journal</h4>
                            <p className="text-gray-300 mt-1 italic">{item.journal}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold text-lg">Abstract</h4>
                            <p className="text-gray-300 mt-1">{item.abstract}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                             <button onClick={() => summarizeAbstract(item.abstract)} disabled={geminiLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition w-full disabled:bg-gray-500">
                                {geminiLoading ? 'Summarizing...' : '✨ Summarize Abstract'}
                             </button>
                             {geminiSummary && (
                                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                                    <h5 className="font-semibold text-md text-blue-300">Simplified Summary:</h5>
                                    <p className="text-gray-300 mt-1">{geminiSummary}</p>
                                </div>
                             )}
                        </div>
                    </div>
                );
            default:
                return <p>Details not available.</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl relative border border-gray-700" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                {renderContent()}
            </div>
        </div>
    );
};

// Gemini Project Idea Generator Modal
const ProjectGeneratorModal = () => {
    const { showProjectGenerator, setShowProjectGenerator, generateProjectIdeas, geminiIdeas, geminiLoading } = useContext(AppContext);
    const [keywords, setKeywords] = useState('');

    if (!showProjectGenerator) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        generateProjectIdeas(keywords);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={() => setShowProjectGenerator(false)}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl relative border border-gray-700" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowProjectGenerator(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-4 text-white">✨ Project Idea Generator</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="keywords" className="block text-gray-300 font-medium mb-2">Enter keywords (e.g., IoT, healthcare, robotics)</label>
                    <input 
                        type="text" 
                        id="keywords"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="machine learning, signal processing..."
                    />
                    <button type="submit" disabled={geminiLoading} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition w-full disabled:bg-gray-500">
                        {geminiLoading ? 'Generating...' : 'Generate Ideas'}
                    </button>
                </form>
                {geminiIdeas && (
                    <div className="mt-6 pt-4 border-t border-gray-600">
                        <h3 className="font-semibold text-lg text-blue-300">Generated Ideas:</h3>
                        <div className="text-gray-300 mt-2 whitespace-pre-wrap p-4 bg-gray-700 rounded-lg">{geminiIdeas}</div>
                    </div>
                )}
            </div>
        </div>
    );
};


// Footer Component
const Footer = () => (
    <footer className="bg-gray-900 text-gray-400 text-center p-4">
        <p>Designed by Sarthak</p>
    </footer>
);


// --- 5. MAIN APP COMPONENT ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('Home');
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [viewingItem, setViewingItem] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [showProjectGenerator, setShowProjectGenerator] = useState(false);
    
    // State for Gemini API interactions
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiSummary, setGeminiSummary] = useState('');
    const [geminiIdeas, setGeminiIdeas] = useState('');
    
    // Use the local mock data
    const [data, setData] = useState(mockData);

    // --- Gemini API Functions ---
    const callGeminiAPI = async (prompt) => {
        setGeminiLoading(true);
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = ""; // Leave empty
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Invalid response structure from API.");
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            setMessage({ text: 'AI feature failed. Please try again.', type: 'error' });
            return null;
        } finally {
            setGeminiLoading(false);
        }
    };

    const summarizeAbstract = async (abstract) => {
        setGeminiSummary(''); // Clear previous summary
        const prompt = `Summarize the following technical abstract in simple, easy-to-understand terms for a first-year engineering student. Focus on the core problem and the proposed solution. Abstract: "${abstract}"`;
        const summary = await callGeminiAPI(prompt);
        if (summary) {
            setGeminiSummary(summary);
        }
    };
    
    const generateProjectIdeas = async (keywords) => {
        setGeminiIdeas('');
        const prompt = `Generate 5 innovative project ideas for undergraduate Electronics and Telecommunication (ENTC) engineering students. The ideas should be based on the following keywords: "${keywords}". For each idea, provide a title and a brief, one-sentence description. Format the output as a numbered list.`;
        const ideas = await callGeminiAPI(prompt);
        if (ideas) {
            setGeminiIdeas(ideas);
        }
    };


    // Mock Authentication Logic
    const handleLogin = (email, password) => {
        const student = mockData.students.find(s => s.email === email);
        if (student) {
            setUser(student);
            setShowLogin(false);
            setMessage({ text: 'Login successful!', type: 'success' });
            setCurrentPage('StudentInfo');
        } else {
            setMessage({ text: 'Login failed. User not found.', type: 'error' });
        }
    };
    
    const handleLogout = () => {
        setUser(null);
        setCurrentPage('Home');
        setMessage({ text: 'You have been logged out.', type: 'success' });
    };

    // Mock Form Submission
    const handleFormSubmit = (formData) => {
        console.log("Form Submitted (mock):", formData);
        setMessage({ text: 'Message sent successfully! (This is a demo)', type: 'success' });
    };
    
    const showDetails = (item, type) => {
        setGeminiSummary(''); // Clear summary when opening a new modal
        setViewingItem(item);
        setModalType(type);
    };

    const closeDetails = () => {
        setViewingItem(null);
        setModalType(null);
    };
    
    const clearMessage = () => setMessage({ text: '', type: '' });

    const renderPage = () => {
        switch (currentPage) {
            case 'Home': return <HomePage />;
            case 'Toppers': return <ToppersPage />;
            case 'Achievements': return <AchievementsPage />;
            case 'Faculty': return <FacultyPage />;
            case 'StudentInfo': return <StudentInfoPage />;
            case 'Placements': return <PlacementsPage />;
            case 'Gallery': return <GalleryPage />;
            case 'Clubs': return <ClubsPage />;
            case 'Projects': return <ProjectsPage />;
            case 'Publications': return <PublicationsPage />;
            case 'Contact': return <ContactPage />;
            default: return <HomePage />;
        }
    };
    
    const contextValue = {
        currentPage, setCurrentPage,
        user,
        showLogin, setShowLogin,
        handleLogin, handleLogout,
        data,
        handleFormSubmit,
        showDetails,
        showProjectGenerator, setShowProjectGenerator,
        generateProjectIdeas, geminiIdeas,
        summarizeAbstract, geminiSummary,
        geminiLoading
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="bg-gray-900 min-h-screen font-sans text-gray-200" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%231f2937\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}>
                <MessageBox message={message.text} type={message.type} onDismiss={clearMessage} />
                <LoginModal />
                <DetailModal item={viewingItem} type={modalType} onClose={closeDetails} />
                <ProjectGeneratorModal />
                <Header />
                <Navigation />
                <main className="container mx-auto my-8 bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-xl min-h-[60vh] border border-gray-700">
                    {renderPage()}
                </main>
                <Footer />
            </div>
        </AppContext.Provider>
    );
}
