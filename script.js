// ===== Cybersecurity Profile Data =====
const skillsData = {
    tools: [
        { name: "Nmap", level: 85 },
        { name: "Burp Suite", level: 80 },
        { name: "Metasploit", level: 75 },
        { name: "OWASP ZAP", level: 70 },
        { name: "Kali Linux", level: 85 }
    ],
    programming: [
        { name: "Python", level: 70 },
        { name: "JavaScript", level: 75 },
        { name: "HTML/CSS", level: 85 },
        { name: "MySQL", level: 70 }
    ],
    cyber: [
        { name: "Ethical Hacking", level: 80 },
        { name: "Vulnerability Assessment", level: 75 },
        { name: "Web App Security", level: 80 },
        { name: "Network Security", level: 70 }
    ],
    platforms: [
        { name: "TryHackMe", level: 85 },
        { name: "Hack The Box", level: 70 },
        { name: "OWASP Top 10", level: 80 },
        { name: "Security Fundamentals", level: 85 }
    ]
};

const projectsData = [
    {
        id: 1,
        title: "HM-BGRemover – Secure Web Application",
        category: "websec",
        description: "Implemented secure API integration with emphasis on input validation and error handling",
        technologies: ["HTML", "CSS", "JavaScript", "Flask", "REST APIs"],
        date: "May - Jul 2025",
        findings: "Learned secure coding practices and vulnerability prevention",
        liveDemo: true
    },
    {
        id: 2,
        title: "TeacherX – AI Learning Platform",
        category: "websec",
        description: "Applied secure UI practices and client-side validation techniques",
        technologies: ["HTML", "CSS", "JavaScript", "Tailwind CSS"],
        date: "Jul - Aug 2025",
        findings: "Gained exposure to authentication flows and frontend security",
        liveDemo: true
    },
    {
        id: 3,
        title: "YT-Downloader – Web Tool",
        category: "webapp",
        description: "Improved controlled input handling and application stability",
        technologies: ["Flask", "JavaScript", "yt-dlp"],
        date: "Aug - Sep 2025",
        findings: "Optimized error handling to minimize misuse scenarios",
        liveDemo: true
    }
];

const certificationsData = [
    {
        id: 1,
        title: "Certified Ethical Hacker (CEH)",
        issuer: "Training Completed",
        date: "2024",
        icon: "fas fa-user-secret",
        description: "Ethical hacking and penetration testing fundamentals"
    },
    {
        id: 2,
        title: "Cybersecurity Analyst Job Simulation",
        issuer: "Forage",
        date: "2024",
        icon: "fas fa-chart-line",
        description: "Practical cybersecurity analyst simulation"
    },
    {
        id: 3,
        title: "Cyber Job Simulation",
        issuer: "Deloitte",
        date: "2024",
        icon: "fas fa-building",
        description: "Industry-focused cyber simulation experience"
    },
    {
        id: 4,
        title: "Python Basics",
        issuer: "HackerRank",
        date: "2024",
        icon: "fab fa-python",
        description: "Programming fundamentals certification"
    }
];

// ===== Dynamic Portfolio Data Loader & Global Handlers =====
async function loadPortfolioData() {
    try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) throw new Error('Failed to fetch portfolio data');
        const data = await response.json();
        
        // Update data models
        if (data.skills) {
            Object.assign(skillsData, data.skills);
        }
        if (data.projects) {
            projectsData.length = 0;
            projectsData.push(...data.projects);
        }
        if (data.certifications) {
            certificationsData.length = 0;
            certificationsData.push(...data.certifications);
        }
        
        // Update static DOM texts
        if (data.about) {
            const aboutTitle = document.querySelector('.about-title');
            const aboutDesc = document.querySelector('.about-description');
            if (typeof data.about === 'object') {
                if (aboutTitle) aboutTitle.textContent = data.about.title || '';
                if (aboutDesc) aboutDesc.textContent = data.about.description || '';
            } else {
                if (aboutTitle) aboutTitle.textContent = '';
                if (aboutDesc) aboutDesc.textContent = data.about;
            }
        }
        
        if (data.hero) {
            const heroDesc = document.querySelector('.hero-description');
            if (heroDesc) heroDesc.textContent = data.hero.description;
        }
        
        // Re-initialize skills, projects, certifications in DOM
        initSkills();
        initProjects();
        initCertifications();
        
        console.log('✅ Dynamic portfolio data loaded from backend');
    } catch (error) {
        console.warn('⚠️ Server unreachable, falling back to static offline data:', error);
        // If we fail, init DOM with the default hardcoded data
        initSkills();
        initProjects();
        initCertifications();
    }
}

// Bind to window for HTML onclick triggers
window.approveChange = async (id) => {
    try {
        const response = await fetch(`/api/portfolio/changes/${id}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const result = await response.json();
        if (response.ok && result.success) {
            showNotification('Change proposal approved and merged live!', 'success');
            await loadPortfolioData(); // refresh live site
            await loadAdminDashboardData(); // refresh dashboard
        } else {
            showNotification(`Approval failed: ${result.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
};

window.rejectChange = async (id) => {
    try {
        const response = await fetch(`/api/portfolio/changes/${id}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const result = await response.json();
        if (response.ok && result.success) {
            showNotification('Change proposal rejected and discarded.', 'success');
            await loadAdminDashboardData(); // refresh dashboard
        } else {
            showNotification(`Rejection failed: ${result.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
};

window.markMessageRead = async (id) => {
    try {
        const response = await fetch(`/api/messages/${id}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (response.ok) {
            await loadAdminDashboardData(); // refresh dashboard
        }
    } catch (error) {
        console.error('Error marking message read:', error);
    }
};

window.deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        const response = await fetch(`/api/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (response.ok) {
            showNotification('Message deleted successfully', 'success');
            await loadAdminDashboardData(); // refresh dashboard
        }
    } catch (error) {
        console.error('Error deleting message:', error);
    }
};

// ===== DOM Elements =====
const terminalLoader = document.getElementById('terminalLoader');
const matrixBg = document.getElementById('matrixBg');
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const themeToggle = document.getElementById('themeToggle');
const terminalBtn = document.getElementById('terminalBtn');
const terminalWindow = document.getElementById('terminalWindow');
const terminalClose = document.getElementById('terminalClose');
const terminalBody = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');
const typingText = document.getElementById('typingText');
const projectsGrid = document.getElementById('projectsGrid');
const certificationsGrid = document.getElementById('certificationsGrid');
const contactForm = document.getElementById('contactForm');
const statNumbers = document.querySelectorAll('.stat-number');

// ===== State Variables =====
let currentTheme = localStorage.getItem('theme') || 'dark';
let terminalHistory = [];
let historyIndex = -1;
const typingWords = ['CYBERSECURITY', 'SOC ANALYSIS', 'VAPT', 'PENETRATION TESTING'];
let currentWordIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingTimeout;

// ===== Terminal Commands =====
const terminalCommands = {
    help: {
        description: 'Display available commands',
        execute: () => {
            return `
Available Commands:
• help          - Show this help message
• about         - Display professional profile
• education     - Show academic background
• skills        - Show technical skills
• projects      - List security projects
• experience    - Show internship learning
• certifications - List certifications
• status        - Availability and career goals
• clear         - Clear terminal
• theme         - Toggle dark/light theme
• matrix        - Toggle matrix background
• date          - Show current date
• whoami        - Display current user
• contact       - Show contact information
• hireme        - Why hire me
            `;
        }
    },
    about: {
        description: 'About the cybersecurity professional',
        execute: () => {
            return `
Professional Profile:
Name: Mahesh Garlapally
Status: Cybersecurity Specialist
Education: BCA Graduate (90% aggregate)
Certification: CEH Training Completed
Availability: Ready for cybersecurity challenges
Target Roles: SOC Analyst, VAPT Engineer, Security Analyst
Location: Hyderabad, Telangana
Ready to Start: Immediately
            `;
        }
    },
    status: {
        description: 'Availability and career goals',
        execute: () => {
            return `
Professional Status:
✅ Status: Available for security roles
🎓 Education: BCA (90% aggregate) - Completed
📜 Certification: CEH - Completed
💼 Experience: Cybersecurity Internship - Completed
🎯 Target Roles: SOC Analyst, VAPT Engineer, Security Analyst
📍 Location: Hyderabad, willing to relocate
📅 Start Date: Can join immediately
🎯 Career Goal: Protect digital assets and strengthen organization security posture
            `;
        }
    },
    hireme: {
        description: 'Reasons to hire me',
        execute: () => {
            return `
Why Hire Me:
1. Strong Academic Background (90% BCA aggregate)
2. CEH Certification completed
3. Hands-on internship experience
4. Practical project portfolio
5. Active on TryHackMe (50+ rooms)
6. Technical skills in security tools
7. Ready to start immediately
8. Strong foundation in cybersecurity
9. Passionate about security operations
10. Rapid learner and proactive problem solver
            `;
        }
    },
    education: {
        description: 'Display academic background',
        execute: () => {
            return `
Academic Background:
• BCA (Bachelor of Computer Applications)
  Chaitanya Deemed To Be University, Hyderabad
  2023-2026 | Aggregate: 90%
  Status: Completed - Ready for professional role

• Class XII
  TSWER / JC Boys Hathnoora, Sangareddy
  2021-2023 | Percentage: 81.6%
            `;
        }
    },
    skills: {
        description: 'Display technical skills',
        execute: () => {
            return `
Cybersecurity Skills:
• Ethical Hacking & Vulnerability Assessment
• Web Application Security
• Network Security Fundamentals
• Security Tools Proficiency

Technical Competencies:
• Nmap, Burp Suite, Metasploit
• OWASP ZAP, Kali Linux
• Python, JavaScript, HTML/CSS
            `;
        }
    },
    projects: {
        description: 'List security projects',
        execute: () => {
            return `
Security Projects:
1. HM-BGRemover - Secure Web App (2025)
2. TeacherX - AI Learning Platform (2025)
3. YT-Downloader - Web Tool (2025)

All projects demonstrate practical security implementation!
            `;
        }
    },
    experience: {
        description: 'Show internship learning',
        execute: () => {
            return `
Internship Learning:
Cybersecurity Intern @ Uptoskills
May 2025 - Aug 2025 (Online Internship)

Practical Experience:
• Learned vulnerability scanning with Nmap, Burp Suite
• Practiced penetration testing using Metasploit
• Applied OWASP Top 10 for web security assessment
• Assisted in risk assessment documentation
            `;
        }
    },
    certifications: {
        description: 'List certifications',
        execute: () => {
            return `
Professional Certifications:
1. Certified Ethical Hacker (CEH) - Training Completed
2. Cybersecurity Analyst Job Simulation - Forage
3. Cyber Job Simulation - Deloitte
4. Python Basics - HackerRank
            `;
        }
    },
    clear: {
        description: 'Clear terminal screen',
        execute: () => {
            const output = terminalBody.querySelector('.terminal-output');
            output.innerHTML = '';
            return '';
        }
    },
    theme: {
        description: 'Toggle dark/light theme',
        execute: () => {
            toggleTheme();
            return 'Theme toggled successfully';
        }
    },
    matrix: {
        description: 'Toggle matrix background',
        execute: () => {
            const matrixCanvas = document.getElementById('matrixCanvas');
            if (matrixCanvas) {
                matrixCanvas.style.display = matrixCanvas.style.display === 'none' ? 'block' : 'none';
                return 'Matrix background toggled';
            }
            return 'Matrix background not available';
        }
    },
    date: {
        description: 'Show current date and time',
        execute: () => {
            return new Date().toLocaleString();
        }
    },
    whoami: {
        description: 'Display current user',
        execute: () => {
            return 'mahesh@cyberportfolio';
        }
    },
    contact: {
        description: 'Show contact information',
        execute: () => {
            return `
Contact for Job Opportunities:
Email: mahesh7780376316@gmail.com
Phone: +91 7780376316
Location: Hyderabad, Telangana
Status: Actively seeking entry-level roles
Available: Immediately
Target Roles: SOC Analyst, VAPT Engineer, Security Analyst
            `;
        }
    }
};

// ===== Matrix Background =====
function createMatrixBackground() {
    if (document.getElementById('matrixCanvas')) {
        return; // Already created
    }
    
    const canvas = document.createElement('canvas');
    canvas.id = 'matrixCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.3';
    canvas.style.display = 'none';
    matrixBg.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    
    const characters = '01';
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    
    function draw() {
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        ctx.fillStyle = isLightTheme ? 'rgba(247, 244, 235, 0.05)' : 'rgba(12, 11, 10, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#d4b27a';
        ctx.fillStyle = primaryColor;
        ctx.font = `${fontSize}px monospace`;
        
        // Update columns if window resized
        columns = Math.floor(canvas.width / fontSize);
        while (drops.length < columns) drops.push(1);
        while (drops.length > columns) drops.pop();
        
        for (let i = 0; i < drops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    const matrixInterval = setInterval(draw, 33);
    
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    
    // Store interval ID for cleanup
    canvas.dataset.intervalId = matrixInterval;
}

// ===== Preloader =====
function initPreloader() {
    // Hide body overflow during loader
    document.body.style.overflow = 'hidden';
    
    // Animate terminal lines
    const lines = document.querySelectorAll('.terminal-loader .terminal-line');
    lines.forEach((line, index) => {
        line.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Hide loader after animation completes
    const animationTime = lines.length * 500 + 1000; // 0.5s per line + 1s buffer
    
    setTimeout(() => {
        terminalLoader.style.transition = 'opacity 0.5s ease';
        terminalLoader.style.opacity = '0';
        
        setTimeout(() => {
            terminalLoader.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Initialize main content
            startTypingAnimation();
            initCounters();
            createMatrixBackground();
            console.log('🚀 Cybersecurity Portfolio loaded successfully');
        }, 500);
    }, animationTime);
}

// ===== Typing Animation =====
function startTypingAnimation() {
    function type() {
        const currentWord = typingWords[currentWordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, currentCharIndex - 1);
            currentCharIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, currentCharIndex + 1);
            currentCharIndex++;
        }
        
        if (!isDeleting && currentCharIndex === currentWord.length) {
            isDeleting = true;
            typingTimeout = setTimeout(type, 1500);
            return;
        }
        
        if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentWordIndex = (currentWordIndex + 1) % typingWords.length;
            typingTimeout = setTimeout(type, 500);
            return;
        }
        
        const speed = isDeleting ? 50 : 100;
        typingTimeout = setTimeout(type, speed);
    }
    
    // Clear any existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);
    type();
}

// ===== Theme Management =====
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const moonIcon = themeToggle.querySelector('.fa-moon');
    const sunIcon = themeToggle.querySelector('.fa-sun');
    
    if (currentTheme === 'dark') {
        moonIcon.style.opacity = '1';
        moonIcon.style.transform = 'scale(1)';
        sunIcon.style.opacity = '0';
        sunIcon.style.transform = 'scale(0)';
    } else {
        moonIcon.style.opacity = '0';
        moonIcon.style.transform = 'scale(0)';
        sunIcon.style.opacity = '1';
        sunIcon.style.transform = 'scale(1)';
    }
}

// ===== Navigation =====
// ===== Improved Navigation =====
function initNavigation() {
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = mobileMenuBtn.classList.contains('active');
        
        // Toggle menu
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = !isActive ? 'hidden' : '';
        
        // Toggle the entire nav-right container
        const navRight = document.querySelector('.nav-right');
        if (navRight) {
            navRight.classList.toggle('active');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-container') && 
            mobileMenuBtn.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuBtn.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Active link on scroll
    window.addEventListener('scroll', setActiveNavLink);
    
    // Initial call to set active link
    setActiveNavLink();
}

function closeMobileMenu() {
    mobileMenuBtn.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
    
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
        navRight.classList.remove('active');
    }
}

function setActiveNavLink() {
    if (window.innerWidth <= 1024) return; // Only on desktop
    
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Update the cleanup function
function setupCleanup() {
    window.addEventListener('beforeunload', () => {
        // Clear typing animation timeout
        if (typingTimeout) clearTimeout(typingTimeout);
        
        // Clear matrix animation interval
        const matrixCanvas = document.getElementById('matrixCanvas');
        if (matrixCanvas && matrixCanvas.dataset.intervalId) {
            clearInterval(parseInt(matrixCanvas.dataset.intervalId));
        }
        
        // Reset mobile menu state
        closeMobileMenu();
    });
    
    // Close mobile menu on window resize above 1024px
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && mobileMenuBtn.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}
function setActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===== Terminal =====
function initTerminal() {
    // Open terminal
    terminalBtn.addEventListener('click', () => {
        terminalWindow.classList.add('active');
        terminalInput.focus();
    });
    
    // Close terminal
    terminalClose.addEventListener('click', () => {
        terminalWindow.classList.remove('active');
    });
    
    // Close terminal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && terminalWindow.classList.contains('active')) {
            terminalWindow.classList.remove('active');
        }
    });
    
    // Terminal input handling
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            terminalInput.value = '';
            if (command) {
                processCommand(command.toLowerCase());
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (terminalHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                terminalInput.value = terminalHistory[historyIndex];
            } else if (terminalHistory.length > 0 && historyIndex === -1) {
                historyIndex = terminalHistory.length - 1;
                terminalInput.value = terminalHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (terminalHistory.length > 0 && historyIndex < terminalHistory.length - 1) {
                historyIndex++;
                terminalInput.value = terminalHistory[historyIndex];
            } else {
                terminalInput.value = '';
                historyIndex = -1;
            }
        }
    });
}

function processCommand(command) {
    // Add to history
    terminalHistory.push(command);
    historyIndex = -1;
    
    // Create output line
    const output = terminalBody.querySelector('.terminal-output');
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-line';
    inputLine.innerHTML = `<span class="prompt">mahesh@cyberportfolio:~$</span> ${command}`;
    output.appendChild(inputLine);
    
    // Process command
    let result = '';
    const commandParts = command.split(' ');
    const baseCommand = commandParts[0];
    
    if (terminalCommands[baseCommand]) {
        result = terminalCommands[baseCommand].execute();
    } else if (baseCommand === 'ls') {
        result = 'about.txt\neducation.txt\nskills.txt\nprojects.txt\nexperience.txt\ncertifications.txt\ncontact.txt\nhireme.txt';
    } else if (baseCommand === 'echo') {
        result = commandParts.slice(1).join(' ');
    } else if (baseCommand === 'pwd') {
        result = '/home/mahesh/cyberportfolio';
    } else if (baseCommand === 'tryhackme') {
        result = 'TryHackMe Profile: Active (50+ rooms completed)\nLearning Path: Complete Beginner to Junior Pentester';
    } else if (baseCommand === 'htb') {
        result = 'Hack The Box: Beginner level\nFocus: Active threat research and security labs';
    } else if (baseCommand === 'job') {
        result = 'Job Search Status: Active\nTarget: Cybersecurity Analyst & Specialist roles\nLocation: Hyderabad\nAvailability: Immediate';
    } else {
        result = 'Command not found. Type "help" for available commands.';
    }
    
    // Display result
    if (result) {
        const resultLine = document.createElement('div');
        resultLine.className = 'terminal-line';
        resultLine.textContent = result;
        output.appendChild(resultLine);
    }
    
    // Scroll to bottom
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// ===== Skills =====
function initSkills() {
    // Load tools skills
    const toolsSkills = document.getElementById('toolsSkills');
    if (toolsSkills) {
        toolsSkills.innerHTML = skillsData.tools.map(skill => `
            <span class="skill-tag">${skill.name}</span>
        `).join('');
    }
    
    // Load programming skills
    const programmingSkills = document.getElementById('programmingSkills');
    if (programmingSkills) {
        programmingSkills.innerHTML = skillsData.programming.map(skill => `
            <span class="skill-tag">${skill.name}</span>
        `).join('');
    }
    
    // Load cybersecurity skills
    const cyberSkills = document.getElementById('cyberSkills');
    if (cyberSkills) {
        cyberSkills.innerHTML = skillsData.cyber.map(skill => `
            <span class="skill-tag">${skill.name}</span>
        `).join('');
    }
    
    // Load platform skills
    const platformSkills = document.getElementById('platformSkills');
    if (platformSkills) {
        platformSkills.innerHTML = skillsData.platforms.map(skill => `
            <span class="skill-tag">${skill.name}</span>
        `).join('');
    }
}

// ===== Projects =====
function initProjects() {
    if (projectsGrid) {
        projectsGrid.innerHTML = projectsData.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <span class="project-category">
                        <i class="fas fa-${getProjectIcon(project.category)}"></i>
                        ${project.category.toUpperCase()}
                    </span>
                     ${project.liveDemo ? '<span class="project-live"><i class=""></i></span>' : ''}
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                </div>
                <div class="project-body">
                    <div class="project-tech">
                        ${project.technologies.map(tech => `
                            <span class="tech-tag">${tech}</span>
                        `).join('')}
                    </div>
                    <p class="project-findings">
                        <i class="fas fa-shield-alt"></i>
                        ${project.findings}
                    </p>
                </div>
                <div class="project-footer">
                    <span class="project-date">${project.date}</span>
                    <a href="${project.link || '#'}" class="project-link" ${project.link ? 'target="_blank"' : 'onclick="return false;"'}>
                        View Details
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }
}

function getProjectIcon(category) {
    const icons = {
        websec: 'shield-alt',
        webapp: 'laptop-code',
        security: 'user-shield'
    };
    return icons[category] || 'file-alt';
}

// ===== Certifications =====
function initCertifications() {
    if (certificationsGrid) {
        certificationsGrid.innerHTML = certificationsData.map(cert => `
            <div class="cert-card">
                <div class="cert-icon">
                    <i class="${cert.icon}"></i>
                </div>
                <h3>${cert.title}</h3>
                <p class="cert-issuer">${cert.issuer}</p>
                <p class="cert-date">Completed: ${cert.date}</p>
                <p class="cert-description">${cert.description}</p>
            </div>
        `).join('');
    }
}

// ===== Animated Counters =====
function initCounters() {
    if (statNumbers.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.dataset.count);
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;
                    
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            stat.textContent = target + '+';
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.floor(current) + '+';
                        }
                    }, 16);
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// ===== Contact Form =====
function initContactForm() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: this.querySelector('#name').value.trim(),
            email: this.querySelector('#email').value.trim(),
            inquiry: this.querySelector('#inquiry') ? this.querySelector('#inquiry').value : 'General Inquiry',
            message: this.querySelector('#message').value.trim()
        };
        
        // Validate
        if (!validateContactForm(formData)) return;
        
        // Show loading state
        const submitBtn = this.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Send to backend
        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                inquiry: formData.inquiry,
                message: formData.message,
                company: this.querySelector('#company') ? this.querySelector('#company').value.trim() : ''
            })
        })
        .then(response => response.json().then(data => {
            if (response.ok && data.success) {
                showNotification('Opportunity details sent! I\'ll respond promptly.', 'success');
                contactForm.reset();
            } else {
                showNotification(`Failed to send message: ${data.error || 'Server error'}`, 'error');
            }
        }))
        .catch(err => {
            showNotification(`Network error: ${err.message}`, 'error');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
}

function validateContactForm(data) {
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields.', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    return true;
}

function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 51, 51, 0.1)'};
        border: 1px solid ${type === 'success' ? 'var(--primary)' : 'var(--danger)'};
        color: ${type === 'success' ? 'var(--primary)' : 'var(--danger)'};
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        backdrop-filter: blur(10px);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animation styles
function addNotificationStyles() {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== Smooth Scrolling =====
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            const targetId = href;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Cleanup on page unload =====
function setupCleanup() {
    window.addEventListener('beforeunload', () => {
        // Clear typing animation timeout
        if (typingTimeout) clearTimeout(typingTimeout);
        
        // Clear matrix animation interval
        const matrixCanvas = document.getElementById('matrixCanvas');
        if (matrixCanvas && matrixCanvas.dataset.intervalId) {
            clearInterval(parseInt(matrixCanvas.dataset.intervalId));
        }
    });
}

// ===== Initialize Everything =====
function init() {
    console.log('🚀 Cybersecurity Portfolio Initialized');
    
    // Add notification styles
    addNotificationStyles();
    
    // Initialize components
    initPreloader();
    initTheme();
    initNavigation();
    initTerminal();
    initSkills();
    initProjects();
    initCertifications();
    initContactForm();
    initSmoothScrolling();
    setupCleanup();
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Safety net for loader removal
window.addEventListener('load', function() {
    setTimeout(() => {
        const loader = document.getElementById('terminalLoader');
        if (loader && loader.style.display !== 'none') {
            loader.style.transition = 'opacity 0.5s ease';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.style.overflow = 'auto';
                console.log('Loader removed by safety net');
            }, 500);
        }
    }, 5000);
});
// ===== Permission System =====
const permissions = {
    // Commands available to normal users (read-only)
    user: [
        'help', 'about', 'education', 'skills', 'projects', 
        'experience', 'certifications', 'contact', 'hireme',
        'status', 'whoami', 'date', 'clear', 'theme', 'matrix',
        'ls', 'pwd', 'echo', 'tryhackme', 'htb', 'job',
        'su'  // Can request root access
    ],
    
    // Commands available to root users (read-write)
    root: [
        'su', 'exit', 'passwd', 'theme', 'config', 'edit',
        'reset', 'backup', 'firewall', 'scan', 'logs', 'sysinfo',
        'help', 'whoami', 'date', 'clear', 'ls', 'pwd', 'id'
    ]
};

// Default password (can be changed by user)
let rootPassword = "cybersecurity"; // Default
let isRootMode = false;
let adminToken = sessionStorage.getItem('adminToken') || '';

// ===== Security Modal Functions =====
function showSecurityModal() {
    const modal = document.getElementById('securityModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSecurityModal() {
    const modal = document.getElementById('securityModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showPasswordHint() {
    const modal = document.getElementById('securityModal');
    modal.classList.remove('active');
    
    setTimeout(() => {
        const hintModal = document.getElementById('hintModal');
        hintModal.classList.add('active');
    }, 300);
}

function closeHintModal() {
    const modal = document.getElementById('hintModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== Permission Checking =====
function hasPermission(command) {
    if (isRootMode) {
        return permissions.root.includes(command);
    } else {
        return permissions.user.includes(command);
    }
}

function checkPermission(command) {
    if (!hasPermission(command)) {
        if (isRootMode) {
            return `Permission denied: "${command}" not available in root mode`;
        } else {
            showSecurityModal();
            return `Permission denied. Use "su" to elevate privileges.\nRequired: root access`;
        }
    }
    return null;
}

// ===== Updated Terminal Commands (User Mode - Read Only) =====
const userCommands = {
    help: {
        description: 'Display available commands',
        execute: () => {
            let helpText = `
Available Commands (User Mode):
• help          - Show this help message
• about         - Display professional profile (read-only)
• education     - Show academic background (read-only)
• skills        - Show technical skills (read-only)
• projects      - List security projects (read-only)
• experience    - Show internship learning (read-only)
• certifications - List certifications (read-only)
• contact       - Show contact information (read-only)
• hireme        - Why hire me (read-only)
• status        - Availability and career goals
• clear         - Clear terminal
• theme         - Toggle dark/light theme
• matrix        - Toggle matrix background
• date          - Show current date
• whoami        - Display current user
• ls            - List files
• pwd           - Print working directory
• echo          - Echo text
• tryhackme     - Show TryHackMe progress
• htb           - Show Hack The Box progress
• job           - Job search status
 
🔐 Restricted Commands (require root access):
• edit          - Modify portfolio content
• config        - Open configuration panel
• reset         - Reset all changes
• backup        - Create backup
• scan          - Run security scan
• logs          - View system logs
 
Type "su [password]" to switch to root user.
Default password hint: Think about cybersecurity
            `;
            return helpText;
        }
    },
    
    about: {
        description: 'Display professional profile (read-only)',
        execute: () => {
            return `
Professional Profile (Read-Only):
Name: Mahesh Garlapally
Status: Cybersecurity Specialist
Education: BCA Graduate (90% aggregate)
Certification: CEH Training Completed
Availability: Ready for cybersecurity challenges
Target Roles: SOC Analyst, VAPT Engineer, Security Analyst
Location: Hyderabad, Telangana
Ready to Start: Immediately
 
🔒 To modify this information, use: su [password]
            `;
        }
    },
    
    skills: {
        description: 'Show technical skills (read-only)',
        execute: () => {
            return `
Technical Skills (Read-Only):
• Ethical Hacking & Vulnerability Assessment
• Web Application Security
• Network Security Fundamentals
• Security Tools Proficiency

Tools: Nmap, Burp Suite, Metasploit, OWASP ZAP, Kali Linux
Programming: Python, JavaScript, HTML/CSS, MySQL

🔒 To modify skills, use: su [password]
            `;
        }
    },
    
    projects: {
        description: 'List security projects (read-only)',
        execute: () => {
            return `
Security Projects (Read-Only):
1. HM-BGRemover - Secure Web App (2025)
2. TeacherX - AI Learning Platform (2025)
3. YT-Downloader - Web Tool (2025)

🔒 To modify projects, use: su [password]
            `;
        }
    },
    
    experience: {
        description: 'Show internship learning (read-only)',
        execute: () => {
            return `
Internship Experience (Read-Only):
Cybersecurity Intern @ Uptoskills
May 2025 - Aug 2025 (Online Internship)

Practical Experience:
• Learned vulnerability scanning with Nmap, Burp Suite
• Practiced penetration testing using Metasploit
• Applied OWASP Top 10 for web security assessment
• Assisted in risk assessment documentation

🔒 To modify experience, use: su [password]
            `;
        }
    },
    
    certifications: {
        description: 'List certifications (read-only)',
        execute: () => {
            return `
Professional Certifications (Read-Only):
1. Certified Ethical Hacker (CEH) - Training Completed
2. Cybersecurity Analyst Job Simulation - Forage
3. Cyber Job Simulation - Deloitte
4. Python Basics - HackerRank

🔒 To modify certifications, use: su [password]
            `;
        }
    },
    
    su: {
        description: 'Switch to root user (elevated privileges)',
        execute: async (args) => {
            if (args.length > 0) {
                let password = args[0];
                if ((password.startsWith('[') && password.endsWith(']')) ||
                    (password.startsWith('"') && password.endsWith('"')) ||
                    (password.startsWith("'") && password.endsWith("'"))) {
                    password = password.slice(1, -1);
                }
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: password })
                    });
                    const data = await response.json();
                    if (response.ok && data.success) {
                        sessionStorage.setItem('adminToken', data.token);
                        adminToken = data.token;
                        activateRootMode();
                        return '✅ Root access granted. Elevated privileges activated.\nType "help" for root commands.';
                    } else {
                        return `❌ Access denied. ${data.error || 'Incorrect password.'}`;
                    }
                } catch (error) {
                    return `❌ Authentication error: ${error.message}`;
                }
            } else {
                return 'Usage: su [password]\nTo modify portfolio details, root access is required.';
            }
        }
    },
    
    // Read-only versions of other commands
    education: terminalCommands.education,
    contact: terminalCommands.contact,
    status: terminalCommands.status,
    hireme: terminalCommands.hireme,
    clear: terminalCommands.clear,
    theme: terminalCommands.theme,
    matrix: terminalCommands.matrix,
    date: terminalCommands.date,
    whoami: terminalCommands.whoami
};

// ===== Root Commands (Write Access) =====
const rootCommands = {
    su: {
        description: 'Already in root mode',
        execute: () => {
            return 'You are already in root mode. Use "exit" to return to user mode.';
        }
    },
    
    exit: {
        description: 'Exit root mode',
        execute: () => {
            deactivateRootMode();
            return 'Exited root mode. Returning to user mode.';
        }
    },
    
    passwd: {
        description: 'Change root password',
        execute: (args) => {
            if (args.length >= 2) {
                const [oldPass, newPass] = args;
                if (oldPass === rootPassword) {
                    rootPassword = newPass;
                    return '✅ Password changed successfully.';
                } else {
                    return '❌ Current password incorrect.';
                }
            }
            return 'Usage: passwd [current_password] [new_password]';
        }
    },
    
    edit: {
        description: 'Edit portfolio content',
        execute: (args) => {
            if (args.length < 2) {
                return 'Usage: edit [section] [content]\nSections: about, skills, projects, experience';
            }
            
            const section = args[0];
            const content = args.slice(1).join(' ');
            
            const sections = {
                about: {
                    element: document.querySelector('.about-description'),
                    default: 'As a recent BCA graduate with strong academic performance (90% aggregate) and CEH certification, I have built a solid foundation in cybersecurity. I\'m actively seeking my first professional role where I can contribute, learn from experienced teams, and grow into a valuable security professional.'
                },
                skills: {
                    element: document.querySelector('.skills-container'),
                    default: skillsData
                },
                projects: {
                    element: document.getElementById('projectsGrid'),
                    default: projectsData
                },
                experience: {
                    element: document.querySelector('.experience-content p'),
                    default: 'Gained practical experience in cybersecurity fundamentals during this online internship, applying theoretical knowledge to real-world scenarios.'
                }
            };
            
            if (!sections[section]) {
                return `❌ Invalid section. Available: ${Object.keys(sections).join(', ')}`;
            }
            
            if (section === 'skills' || section === 'projects') {
                return `⚠️ Use config panel for ${section} editing`;
            } else {
                sections[section].element.textContent = content;
                saveChange(`Edited ${section} section via terminal`);
                return `✅ "${section}" section updated successfully.`;
            }
        }
    },
    
    config: {
        description: 'Open configuration panel',
        execute: () => {
            openRootControls();
            return 'Opening root configuration panel...';
        }
    },
    
    reset: {
        description: 'Reset all changes to default',
        execute: () => {
            if (confirm('⚠️ WARNING: This will reset ALL changes to default. Continue?')) {
                resetToDefault();
                return '✅ All changes reset. Page reloading...';
            }
            return 'Reset cancelled.';
        }
    },
    
    backup: {
        description: 'Create backup of current configuration',
        execute: () => {
            createBackup();
            return '✅ Backup created successfully.';
        }
    },
    
    scan: {
        description: 'Run security scan',
        execute: () => {
            return runSecurityScan();
        }
    },
    
    logs: {
        description: 'View system logs',
        execute: () => {
            return viewSystemLogs();
        }
    },
    
    sysinfo: {
        description: 'Show system information',
        execute: () => {
            return `
System Information (Root Mode):
• User: root
• Access Level: Administrator
• Session Start: ${new Date().toLocaleString()}
• Changes Made: ${localStorage.getItem('changesCount') || 0}
• Theme: ${currentTheme}
• Terminal Version: 2.0 (Root Edition)
• Security Status: ${isRootMode ? 'Elevated' : 'Normal'}
            `;
        }
    },
    
    help: {
        description: 'Display root commands',
        execute: () => {
            return `
Root Commands (Elevated Privileges):
• exit          - Exit root mode
• passwd        - Change root password
• edit          - Edit portfolio content
• config        - Open configuration panel
• reset         - Reset all changes
• backup        - Create backup
• scan          - Run security scan
• logs          - View system logs
• sysinfo       - Show system information

🔓 Write access enabled for all sections
⚠️ Use with caution - changes are permanent
            `;
        }
    }
};

// ===== Command Execution Handler =====
async function executeCommand(baseCommand, args) {
    // Check permissions first
    const permissionError = checkPermission(baseCommand);
    if (permissionError) {
        return permissionError;
    }
    
    // Execute based on mode
    if (isRootMode) {
        // Root mode commands
        if (rootCommands[baseCommand]) {
            return await rootCommands[baseCommand].execute(args);
        }
    } else {
        // User mode commands
        if (userCommands[baseCommand]) {
            return await userCommands[baseCommand].execute(args);
        }
    }
    
    // Handle built-in commands
    switch(baseCommand) {
        case 'ls':
            if (isRootMode) {
                return 'about.txt\nskills.txt\nprojects.txt\nexperience.txt\nconfig.txt\nbackup.txt\nlogs.txt\nroot_commands.txt';
            } else {
                return 'about.txt\neducation.txt\nskills.txt\nprojects.txt\nexperience.txt\ncertifications.txt\ncontact.txt\nhireme.txt\nREADME.md';
            }
        case 'pwd':
            return isRootMode ? '/root/cyberportfolio' : '/home/mahesh/cyberportfolio';
        case 'echo':
            return args.join(' ');
        case 'tryhackme':
            return 'TryHackMe Profile: Active (50+ rooms completed)\nLearning Path: Complete Beginner to Junior Pentester\nStatus: Read-only (User mode)';
        case 'htb':
            return 'Hack The Box: Beginner level\nFocus: Active threat research and security labs\nStatus: Read-only (User mode)';
        case 'job':
            return 'Job Search Status: Active\nTarget: Cybersecurity Analyst & Specialist roles\nLocation: Hyderabad\nAvailability: Immediate\nStatus: Read-only (User mode)';
        default:
            return 'Command not found. Type "help" for available commands.';
    }
}

// ===== Updated processCommand Function =====
async function processCommand(command) {
    // Add to history
    terminalHistory.push(command);
    historyIndex = -1;
    
    // Create output line
    const output = terminalBody.querySelector('.terminal-output');
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-line';
    
    // Set prompt based on mode
    let promptText;
    if (isRootMode) {
        promptText = '<span class="prompt root-prompt">root@cyberportfolio:~#</span>';
    } else {
        promptText = '<span class="prompt">mahesh@cyberportfolio:~$</span>';
    }
    
    inputLine.innerHTML = `${promptText} ${command}`;
    output.appendChild(inputLine);
    
    // Process command
    const commandParts = command.split(' ');
    const baseCommand = commandParts[0].toLowerCase();
    const args = commandParts.slice(1);
    
    try {
        // Execute command
        const result = await executeCommand(baseCommand, args);
        
        // Display result
        if (result) {
            const resultLine = document.createElement('div');
            resultLine.className = 'terminal-line';
            resultLine.innerHTML = result.replace(/\n/g, '<br>');
            output.appendChild(resultLine);
        }
    } catch (err) {
        const errorLine = document.createElement('div');
        errorLine.className = 'terminal-line';
        errorLine.style.color = 'var(--danger)';
        errorLine.innerHTML = `Error: ${err.message}`;
        output.appendChild(errorLine);
    }
    
    // Scroll to bottom
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// ===== Root Mode Activation/Deactivation =====
function activateRootMode() {
    isRootMode = true;
    
    // Update UI
    const rootIndicator = document.getElementById('rootModeIndicator');
    if (rootIndicator) rootIndicator.classList.add('active');
    
    // Update terminal prompt
    const prompts = document.querySelectorAll('.prompt');
    prompts.forEach(prompt => {
        prompt.textContent = 'root@cyberportfolio:~#';
        prompt.classList.add('root-prompt');
    });
    
    // Add security notice
    const output = terminalBody.querySelector('.terminal-output');
    const notice = document.createElement('div');
    notice.className = 'terminal-line';
    notice.innerHTML = `
        <span style="color: #ff3333; font-weight: bold;">⚠️ ROOT ACCESS ACTIVATED</span><br>
        <span style="color: var(--warning);">All security restrictions lifted.</span><br>
        <span style="color: var(--success);">Write access enabled for portfolio modification.</span>
    `;
    output.appendChild(notice);
    
    terminalBody.scrollTop = terminalBody.scrollHeight;
    console.log('🔓 Root mode activated');
}

function deactivateRootMode() {
    isRootMode = false;
    
    // Update UI
    const rootIndicator = document.getElementById('rootModeIndicator');
    if (rootIndicator) rootIndicator.classList.remove('active');
    
    // Update terminal prompt
    const prompts = document.querySelectorAll('.prompt');
    prompts.forEach(prompt => {
        prompt.textContent = 'mahesh@cyberportfolio:~$';
        prompt.classList.remove('root-prompt');
    });
    
    console.log('🔒 Root mode deactivated');
}

// ===== Helper Functions =====
function resetToDefault() {
    // Clear all customizations
    localStorage.removeItem('portfolioChanges');
    localStorage.removeItem('changesCount');
    localStorage.removeItem('themeChanges');
    
    // Reset theme
    document.documentElement.style.removeProperty('--primary');
    currentTheme = 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Reload after delay
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function createBackup() {
    const backup = {
        theme: currentTheme,
        skills: skillsData,
        projects: projectsData,
        timestamp: new Date().toISOString(),
        changes: JSON.parse(localStorage.getItem('portfolioChanges') || '[]')
    };
    
    localStorage.setItem('portfolioBackup', JSON.stringify(backup));
    
    // Download as file
    const dataStr = JSON.stringify(backup, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `portfolio-backup-${Date.now()}.json`);
    link.click();
}

function runSecurityScan() {
    const issues = [];
    const warnings = [];
    
    if (isRootMode) {
        warnings.push('Root mode active - Elevated privileges');
    }
    
    if (localStorage.getItem('portfolioChanges')) {
        const changes = JSON.parse(localStorage.getItem('portfolioChanges') || '[]');
        if (changes.length > 0) {
            issues.push(`${changes.length} modifications detected`);
        }
    }
    
    let scanResult = 'Security Scan Results:\n';
    scanResult += '────────────────────\n';
    
    if (issues.length > 0) {
        scanResult += '⚠️ Issues Found:\n';
        issues.forEach(issue => scanResult += `• ${issue}\n`);
    }
    
    if (warnings.length > 0) {
        scanResult += '\n📝 Warnings:\n';
        warnings.forEach(warning => scanResult += `• ${warning}\n`);
    }
    
    if (issues.length === 0 && warnings.length === 0) {
        scanResult += '✅ No security issues detected.\n';
    }
    
    scanResult += `\nScan completed: ${new Date().toLocaleString()}`;
    
    return scanResult;
}

function viewSystemLogs() {
    const logs = JSON.parse(localStorage.getItem('portfolioChanges') || '[]');
    
    if (logs.length === 0) {
        return 'No system logs found.';
    }
    
    let logText = 'System Logs:\n';
    logText += '────────────\n';
    
    logs.slice(-10).reverse().forEach(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        logText += `[${time}] ${log.description} (${log.user})\n`;
    });
    
    logText += `\nTotal entries: ${logs.length}`;
    
    return logText;
}

// ===== Initialize Security System =====
function initSecuritySystem() {
    // Initialize security modal
    const closeBtn = document.getElementById('closeSecurityModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSecurityModal);
    }
    
    // Close modals on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSecurityModal();
            closeHintModal();
        }
    });
    
    // Create readonly indicator
    const readonlyIndicator = document.createElement('div');
    readonlyIndicator.className = 'readonly-indicator';
    readonlyIndicator.innerHTML = `
        <i class="fas fa-eye"></i>
        <span>Read-Only Mode</span>
        <span class="access-tag access-user">USER</span>
    `;
    document.body.appendChild(readonlyIndicator);
    
    // Update indicator on root mode change
    const updateAccessIndicator = () => {
        if (isRootMode) {
            readonlyIndicator.innerHTML = `
                <i class="fas fa-edit"></i>
                <span>Read-Write Mode</span>
                <span class="access-tag access-root">ROOT</span>
            `;
        } else {
            readonlyIndicator.innerHTML = `
                <i class="fas fa-eye"></i>
                <span>Read-Only Mode</span>
                <span class="access-tag access-user">USER</span>
            `;
        }
    };
    
    // Override activate/deactivate functions
    const originalActivate = activateRootMode;
    const originalDeactivate = deactivateRootMode;
    
    activateRootMode = function() {
        originalActivate();
        updateAccessIndicator();
    };
    
    deactivateRootMode = function() {
        originalDeactivate();
        updateAccessIndicator();
    };
}

// ===== Update Initialization =====
function init() {
    console.log('🚀 Cybersecurity Portfolio Initialized');
    
    // Initialize all systems
    addNotificationStyles();
    initPreloader();
    initTheme();
    initNavigation();
    initTerminal();
    initSkills();
    initProjects();
    initCertifications();
    initContactForm();
    initSmoothScrolling();
    initRootControls();
    initSecuritySystem(); // Add security system
    setupCleanup();
}
// ===== Save System Configuration =====
let saveMode = localStorage.getItem('saveMode') || 'permanent'; // permanent, temporary, none
let unsavedChanges = [];
let autoSaveInterval = null;
let lastSaveTime = null;
let isSaving = false;

// Storage configurations
const storageConfig = {
    permanent: {
        name: 'LocalStorage',
        duration: 'Persistent',
        description: 'Changes saved permanently in browser',
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear(),
        getAllKeys: () => Object.keys(localStorage)
    },
    temporary: {
        name: 'SessionStorage',
        duration: 'Session Only',
        description: 'Changes saved for current session only',
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, value) => sessionStorage.setItem(key, value),
        removeItem: (key) => sessionStorage.removeItem(key),
        clear: () => sessionStorage.clear(),
        getAllKeys: () => Object.keys(sessionStorage)
    },
    none: {
        name: 'Memory Only',
        duration: 'Until Refresh',
        description: 'Changes not saved - preview mode',
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        getAllKeys: () => []
    }
};

// ===== Save System Initialization =====
function initSaveSystem() {
    // Load save mode
    const savedMode = localStorage.getItem('portfolioSaveMode');
    if (savedMode) {
        saveMode = savedMode;
    }
    
    // Apply save mode to HTML
    document.documentElement.setAttribute('data-save-mode', saveMode);
    
    // Initialize UI
    updateSaveUI();
    initSaveModals();
    startAutoSave();
    
    // Load saved changes if any
    loadSavedChanges();
    
    // Warn before leaving with unsaved changes
    setupBeforeUnloadWarning();
    
    console.log(`💾 Save system initialized: ${saveMode} mode`);
}

// ===== Save Mode Management =====
function setSaveMode(mode) {
    if (!['permanent', 'temporary', 'none'].includes(mode)) {
        console.error('Invalid save mode:', mode);
        return false;
    }
    
    // Save current changes before switching
    if (unsavedChanges.length > 0 && saveMode !== 'none') {
        saveChanges();
    }
    
    // Clear current mode data if switching from 'none'
    if (saveMode === 'none') {
        unsavedChanges = [];
    }
    
    // Set new mode
    saveMode = mode;
    document.documentElement.setAttribute('data-save-mode', mode);
    
    // Save mode preference
    localStorage.setItem('portfolioSaveMode', mode);
    
    // Update UI
    updateSaveUI();
    
    // Show notification
    showSaveNotification(`Save mode changed to: ${mode}`);
    
    console.log(`💾 Save mode changed to: ${mode}`);
    return true;
}

function updateSaveUI() {
    // Update status bar
    const modeTag = document.getElementById('modeTag');
    const currentSaveMode = document.getElementById('currentSaveMode');
    const saveModeDetail = document.getElementById('saveModeDetail');
    const saveStatusText = document.getElementById('saveStatusText');
    
    if (modeTag) {
        modeTag.textContent = saveMode.toUpperCase();
        modeTag.className = `mode-tag ${saveMode === 'temporary' ? 'temp' : saveMode === 'none' ? 'none' : ''}`;
    }
    
    if (currentSaveMode) {
        currentSaveMode.textContent = saveMode.toUpperCase();
    }
    
    if (saveModeDetail) {
        saveModeDetail.textContent = storageConfig[saveMode].description;
    }
    
    if (saveStatusText) {
        const changeCount = unsavedChanges.length;
        if (changeCount > 0) {
            saveStatusText.textContent = `${changeCount} unsaved change${changeCount > 1 ? 's' : ''}`;
            saveStatusText.style.color = 'var(--warning)';
        } else {
            saveStatusText.textContent = 'All changes saved';
            saveStatusText.style.color = 'var(--success)';
        }
    }
    
    // Show/hide status bar
    const statusBar = document.getElementById('saveStatusBar');
    if (statusBar) {
        if (isRootMode) {
            statusBar.classList.add('active');
        } else {
            statusBar.classList.remove('active');
        }
    }
}

// ===== Change Tracking =====
function trackChange(change) {
    const changeObj = {
        ...change,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        saveMode: saveMode
    };
    
    unsavedChanges.push(changeObj);
    
    // Highlight the changed element
    if (change.elementId) {
        const element = document.getElementById(change.elementId);
        if (element) {
            element.classList.add('change-highlight');
            setTimeout(() => {
                element.classList.remove('change-highlight');
            }, 1000);
        }
    }
    
    // Update UI
    updateSaveUI();
    
    // Auto-save if enabled
    if (saveMode !== 'none') {
        scheduleAutoSave();
    }
    
    console.log(`📝 Change tracked:`, changeObj);
    return changeObj.id;
}

function saveChanges() {
    if (isSaving || saveMode === 'none' || unsavedChanges.length === 0) {
        return;
    }
    
    isSaving = true;
    showAutoSaveIndicator(true);
    
    try {
        const storage = storageConfig[saveMode];
        const changesToSave = [...unsavedChanges];
        
        // Get existing changes
        const existingChanges = JSON.parse(storage.getItem('portfolioChanges') || '[]');
        
        // Merge changes
        const allChanges = [...existingChanges, ...changesToSave];
        
        // Save to appropriate storage
        storage.setItem('portfolioChanges', JSON.stringify(allChanges));
        
        // Also save to permanent storage for backup if in temp mode
        if (saveMode === 'temporary') {
            const permChanges = JSON.parse(storageConfig.permanent.getItem('portfolioTempChanges') || '[]');
            storageConfig.permanent.setItem('portfolioTempChanges', 
                JSON.stringify([...permChanges, ...changesToSave]));
        }
        
        // Update counts
        const totalChanges = parseInt(storage.getItem('changeCount') || '0') + changesToSave.length;
        storage.setItem('changeCount', totalChanges.toString());
        
        // Clear unsaved changes
        unsavedChanges = [];
        
        lastSaveTime = new Date();
        
        console.log(`💾 Saved ${changesToSave.length} changes to ${saveMode} storage`);
        
        // Show success message
        showSaveNotification(`${changesToSave.length} change${changesToSave.length > 1 ? 's' : ''} saved`);
        
    } catch (error) {
        console.error('❌ Save failed:', error);
        showSaveNotification('Save failed!', 'error');
    } finally {
        isSaving = false;
        showAutoSaveIndicator(false);
        updateSaveUI();
    }
}

function loadSavedChanges() {
    if (saveMode === 'none') return;
    
    try {
        const storage = storageConfig[saveMode];
        const savedChanges = JSON.parse(storage.getItem('portfolioChanges') || '[]');
        
        console.log(`📂 Loaded ${savedChanges.length} saved changes from ${saveMode} storage`);
        
        // Show storage info
        updateStorageInfo();
        
        return savedChanges;
    } catch (error) {
        console.error('❌ Load failed:', error);
        return [];
    }
}

function clearAllChanges() {
    if (!confirm('⚠️ Clear ALL saved changes? This cannot be undone.')) {
        return false;
    }
    
    // Clear from all storage types
    Object.values(storageConfig).forEach(storage => {
        storage.removeItem('portfolioChanges');
        storage.removeItem('changeCount');
    });
    
    // Clear unsaved changes
    unsavedChanges = [];
    
    // Clear UI
    updateSaveUI();
    
    showSaveNotification('All changes cleared', 'warning');
    console.log('🗑️ All changes cleared');
    return true;
}

// ===== Auto-save System =====
function startAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    if (saveMode !== 'none') {
        // Auto-save every 30 seconds if there are unsaved changes
        autoSaveInterval = setInterval(() => {
            if (unsavedChanges.length > 0) {
                saveChanges();
            }
        }, 30000);
        
        console.log('⏱️ Auto-save started (30s interval)');
    }
}

function scheduleAutoSave() {
    // Debounce auto-save to prevent too frequent saves
    if (saveMode === 'none') return;
    
    clearTimeout(window.autoSaveTimeout);
    window.autoSaveTimeout = setTimeout(() => {
        if (unsavedChanges.length > 0) {
            saveChanges();
        }
    }, 5000); // Save 5 seconds after last change
}

function showAutoSaveIndicator(show) {
    const indicator = document.getElementById('autosaveIndicator');
    if (indicator) {
        if (show) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }
}

// ===== Save Modals & UI =====
function initSaveModals() {
    const saveModal = document.getElementById('saveModal');
    const cancelSaveBtn = document.getElementById('cancelSave');
    const confirmSaveBtn = document.getElementById('confirmSave');
    const exportChangesBtn = document.getElementById('exportChanges');
    const quickSaveBtn = document.getElementById('quickSave');
    const changeSaveModeBtn = document.getElementById('changeSaveMode');
    
    // Open save modal
    if (changeSaveModeBtn) {
        changeSaveModeBtn.addEventListener('click', () => {
            openSaveModal();
        });
    }
    
    // Quick save
    if (quickSaveBtn) {
        quickSaveBtn.addEventListener('click', () => {
            if (unsavedChanges.length > 0) {
                saveChanges();
            } else {
                showSaveNotification('No changes to save', 'info');
            }
        });
    }
    
    // Save option selection
    const saveOptions = document.querySelectorAll('.save-option');
    saveOptions.forEach(option => {
        option.addEventListener('click', () => {
            saveOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    // Confirm save mode change
    if (confirmSaveBtn) {
        confirmSaveBtn.addEventListener('click', () => {
            const selectedOption = document.querySelector('.save-option.selected');
            if (selectedOption) {
                const newMode = selectedOption.dataset.type;
                setSaveMode(newMode);
                closeSaveModal();
            } else {
                alert('Please select a save mode');
            }
        });
    }
    
    // Cancel save modal
    if (cancelSaveBtn) {
        cancelSaveBtn.addEventListener('click', closeSaveModal);
    }
    
    // Export changes
    if (exportChangesBtn) {
        exportChangesBtn.addEventListener('click', exportChanges);
    }
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && saveModal.classList.contains('active')) {
            closeSaveModal();
        }
    });
}

function openSaveModal() {
    const saveModal = document.getElementById('saveModal');
    const saveOptions = document.querySelectorAll('.save-option');
    
    // Select current mode
    saveOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.type === saveMode) {
            option.classList.add('selected');
        }
    });
    
    saveModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSaveModal() {
    const saveModal = document.getElementById('saveModal');
    saveModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== Export/Import System =====
function exportChanges() {
    const allChanges = {
        permanent: JSON.parse(localStorage.getItem('portfolioChanges') || '[]'),
        temporary: JSON.parse(sessionStorage.getItem('portfolioChanges') || '[]'),
        config: {
            saveMode: saveMode,
            theme: currentTheme,
            exportDate: new Date().toISOString(),
            totalChanges: parseInt(localStorage.getItem('changeCount') || '0') + 
                         parseInt(sessionStorage.getItem('changeCount') || '0')
        }
    };
    
    const dataStr = JSON.stringify(allChanges, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const fileName = `portfolio-changes-${Date.now()}.json`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
    
    showSaveNotification('Changes exported successfully', 'success');
    console.log('📤 Changes exported:', fileName);
}

function importChanges(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            
            if (!imported.config) {
                throw new Error('Invalid export file');
            }
            
            // Restore changes based on type
            if (imported.permanent && imported.permanent.length > 0) {
                localStorage.setItem('portfolioChanges', JSON.stringify(imported.permanent));
                localStorage.setItem('changeCount', imported.permanent.length.toString());
            }
            
            if (imported.temporary && imported.temporary.length > 0) {
                sessionStorage.setItem('portfolioChanges', JSON.stringify(imported.temporary));
                sessionStorage.setItem('changeCount', imported.temporary.length.toString());
            }
            
            // Restore settings
            if (imported.config.saveMode) {
                setSaveMode(imported.config.saveMode);
            }
            
            if (imported.config.theme) {
                currentTheme = imported.config.theme;
                document.documentElement.setAttribute('data-theme', currentTheme);
            }
            
            showSaveNotification('Changes imported successfully! Page will reload...', 'success');
            
            // Reload to apply changes
            setTimeout(() => location.reload(), 1500);
            
        } catch (error) {
            console.error('❌ Import failed:', error);
            showSaveNotification('Import failed: Invalid file', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== Update Storage Info =====
function updateStorageInfo() {
    let storagePanel = document.getElementById('storageInfoPanel');
    
    if (!storagePanel) {
        storagePanel = document.createElement('div');
        storagePanel.id = 'storageInfoPanel';
        storagePanel.className = 'storage-info';
        document.body.appendChild(storagePanel);
    }
    
    const permChanges = JSON.parse(localStorage.getItem('portfolioChanges') || '[]');
    const tempChanges = JSON.parse(sessionStorage.getItem('portfolioChanges') || '[]');
    
    const permSize = JSON.stringify(permChanges).length;
    const tempSize = JSON.stringify(tempChanges).length;
    const totalSize = permSize + tempSize;
    
    // Calculate percentage (max 5MB for demo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const usagePercent = Math.min((totalSize / maxSize) * 100, 100);
    
    storagePanel.innerHTML = `
        <h4><i class="fas fa-database"></i> Storage Usage</h4>
        <div class="storage-usage">
            <div class="storage-bar">
                <div class="storage-used" style="width: ${usagePercent}%"></div>
            </div>
            <div class="storage-stats">
                <span>${formatBytes(totalSize)} used</span>
                <span>${formatBytes(maxSize)} total</span>
            </div>
        </div>
        <p>Permanent: ${permChanges.length} changes</p>
        <p>Temporary: ${tempChanges.length} changes</p>
        <p>Current: ${saveMode} mode</p>
    `;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ===== Updated Root Commands with Server Integration =====
const enhancedRootCommands = {
    ...rootCommands,
    
    exit: {
        description: 'Exit root mode',
        execute: () => {
            sessionStorage.removeItem('adminToken');
            adminToken = '';
            deactivateRootMode();
            return 'Exited root mode. Returning to user mode.';
        }
    },

    pending: {
        description: 'List pending change proposals',
        execute: async () => {
            try {
                const response = await fetch('/api/portfolio/changes', {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const changes = await response.json();
                const pending = changes.filter(c => c.status === 'pending');
                if (pending.length === 0) {
                    return 'No pending change proposals.';
                }
                let output = 'Pending Change Proposals:\n─────────────────────────\n';
                pending.forEach(c => {
                    output += `ID: ${c.id}\nSection: ${c.section}\nDescription: ${c.description}\nTime: ${new Date(c.timestamp).toLocaleString()}\n\n`;
                });
                output += 'Use "approve [id]" or "reject [id]" to manage these proposals.';
                return output;
            } catch (error) {
                return `Error fetching changes: ${error.message}`;
            }
        }
    },

    approve: {
        description: 'Approve a change proposal and make it live',
        execute: async (args) => {
            if (args.length === 0) return 'Usage: approve [change_id]';
            const changeId = args[0];
            try {
                const response = await fetch(`/api/portfolio/changes/${changeId}/approve`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    await loadPortfolioData(); // refresh live site
                    return `✅ Change ${changeId} approved and applied successfully.`;
                } else {
                    return `❌ Approval failed: ${result.error || 'Unknown error'}`;
                }
            } catch (error) {
                return `Error approving change: ${error.message}`;
            }
        }
    },

    reject: {
        description: 'Reject a change proposal',
        execute: async (args) => {
            if (args.length === 0) return 'Usage: reject [change_id]';
            const changeId = args[0];
            try {
                const response = await fetch(`/api/portfolio/changes/${changeId}/reject`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    return `✅ Change ${changeId} rejected and discarded.`;
                } else {
                    return `❌ Rejection failed: ${result.error || 'Unknown error'}`;
                }
            } catch (error) {
                return `Error rejecting change: ${error.message}`;
            }
        }
    },

    messages: {
        description: 'View contact form messages',
        execute: async () => {
            try {
                const response = await fetch('/api/messages', {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                const msgs = await response.json();
                if (msgs.length === 0) {
                    return 'No contact messages received.';
                }
                let output = 'Visitor Messages:\n────────────────\n';
                msgs.forEach(m => {
                    output += `[${new Date(m.timestamp).toLocaleDateString()}] ${m.name} (${m.email})\nInquiry: ${m.inquiry}\nMessage: ${m.message}\nStatus: ${m.status.toUpperCase()}\nID: ${m.id}\n\n`;
                });
                return output;
            } catch (error) {
                return `Error fetching messages: ${error.message}`;
            }
        }
    },

    sysinfo: {
        description: 'Show system information',
        execute: () => {
            return `
System Information (Root Mode):
• User: root
• Access Level: Administrator
• Session Start: ${new Date().toLocaleString()}
• Theme: ${currentTheme}
• Backend: Node.js Express (Connected)
• Database: JSON-based file persistence
• Security Status: Elevated Privileges
            `;
        }
    },
    
    help: {
        description: 'Display root commands',
        execute: () => {
            return `
Root Commands (Elevated Privileges):
• exit          - Exit root mode
• edit          - Propose portfolio edit via terminal
• config        - Open Root Admin Dashboard UI
• pending       - List pending change proposals
• approve [id]  - Approve and apply change proposal
• reject [id]   - Reject and discard change proposal
• messages      - View visitor contact messages
• sysinfo       - Show system information
• theme         - Toggle dark/light theme
• matrix        - Toggle matrix background
• date          - Show current date
• clear         - Clear terminal
• ls            - List files
• pwd           - Print working directory
            `;
        }
    }
};

// ===== Updated Edit Command with Server Integration =====
const enhancedEditCommand = {
    ...rootCommands.edit,
    execute: async (args) => {
        if (args.length < 2) {
            return 'Usage: edit [section] [content]\nSections: about, hero';
        }
        
        const section = args[0];
        const content = args.slice(1).join(' ');
        
        const sections = {
            about: {
                element: document.querySelector('.about-description'),
                name: 'About Me Description'
            },
            hero: {
                element: document.querySelector('.hero-description'),
                name: 'Hero Description'
            }
        };
        
        if (!sections[section]) {
            return `❌ Invalid section. Available: about, hero`;
        }
        
        const element = sections[section].element;
        if (!element) {
            return `❌ Section element not found.`;
        }
        
        const oldContent = element.textContent.trim();
        
        try {
            const response = await fetch('/api/portfolio/propose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    type: 'edit',
                    section: section,
                    description: `Edited ${sections[section].name} via terminal`,
                    content: content,
                    oldContent: oldContent,
                    elementId: section
                })
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                return `✅ Change proposal submitted. (Change ID: ${result.change.id})\nUse "pending" to see proposed changes, or "approve [id]" to publish it.`;
            } else {
                return `❌ Propose failed: ${result.error || 'Unknown error'}`;
            }
        } catch (error) {
            return `❌ Network error: ${error.message}`;
        }
    }
};

// Replace the edit command
rootCommands.edit = enhancedEditCommand;
// Replace all root commands with enhanced versions
Object.assign(rootCommands, enhancedRootCommands);

// ===== Save Notifications =====
function showSaveNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.save-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `save-notification notification-${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 
                     type === 'error' ? 'rgba(255, 51, 51, 0.1)' : 
                     type === 'warning' ? 'rgba(255, 170, 0, 0.1)' : 
                     'rgba(0, 136, 255, 0.1)'};
        border: 1px solid ${type === 'success' ? 'var(--primary)' : 
                            type === 'error' ? 'var(--danger)' : 
                            type === 'warning' ? 'var(--warning)' : 
                            'var(--secondary)'};
        color: ${type === 'success' ? 'var(--primary)' : 
                type === 'error' ? 'var(--danger)' : 
                type === 'warning' ? 'var(--warning)' : 
                'var(--secondary)'};
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        backdrop-filter: blur(10px);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Before Unload Warning =====
function setupBeforeUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
        if (unsavedChanges.length > 0 && saveMode !== 'none') {
            // Save changes before leaving
            saveChanges();
            
            // Show warning for unsaved changes
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    });
}

// ===== Root Control Panel and Admin Dashboard =====
let tempSkills = null;
let tempProjects = null;
let tempCertifications = null;

function initRootControls() {
    const closeBtn = document.getElementById('closeAdminPanelBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAdminControls);
    }
    
    // Handle tab switching
    const tabBtns = document.querySelectorAll('.admin-tabs .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.dataset.tab;
            const panes = document.querySelectorAll('.admin-tab-content .tab-pane');
            panes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) pane.classList.add('active');
            });
        });
    });
    
    // Render dynamic form when section changes
    const editSelect = document.getElementById('editSectionSelect');
    if (editSelect) {
        editSelect.addEventListener('change', () => {
            renderEditForm(editSelect.value);
        });
    }
    
    console.log('🔒 Root Admin Dashboard initialized');
}

function openRootControls() {
    if (!isRootMode) {
        showAccessDenied();
        return;
    }
    
    // Initialize temp copies
    tempSkills = JSON.parse(JSON.stringify(skillsData));
    tempProjects = JSON.parse(JSON.stringify(projectsData));
    tempCertifications = JSON.parse(JSON.stringify(certificationsData));
    
    // Render default dynamic form (About)
    const editSelect = document.getElementById('editSectionSelect');
    if (editSelect) {
        editSelect.value = 'about';
        renderEditForm('about');
    }
    
    // Load data from backend
    loadAdminDashboardData();
    
    // Open modal
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAdminControls() {
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function renderEditForm(section) {
    const container = document.getElementById('dynamicEditFormContainer');
    if (!container) return;
    
    if (section === 'about') {
        const aboutTitle = document.querySelector('.about-title');
        const aboutDesc = document.querySelector('.about-description');
        const currentTitle = aboutTitle ? aboutTitle.textContent.trim() : '';
        const currentDesc = aboutDesc ? aboutDesc.textContent.trim() : '';
        
        container.innerHTML = `
            <div class="form-group-admin">
                <label for="aboutTitleInput">About Title:</label>
                <input type="text" id="aboutTitleInput" class="admin-input" value="${escapeHtml(currentTitle)}">
            </div>
            <div class="form-group-admin">
                <label for="aboutDescInput">About Description:</label>
                <textarea id="aboutDescInput" class="admin-input" rows="6">${escapeHtml(currentDesc)}</textarea>
            </div>
            <button class="btn btn-primary" onclick="proposeAboutChanges()">
                <i class="fas fa-paper-plane"></i> Propose About Updates
            </button>
        `;
    } else if (section === 'hero') {
        const heroDesc = document.querySelector('.hero-description');
        const currentDesc = heroDesc ? heroDesc.textContent.trim() : '';
        
        container.innerHTML = `
            <div class="form-group-admin">
                <label for="heroDescInput">Hero Description:</label>
                <textarea id="heroDescInput" class="admin-input" rows="6">${escapeHtml(currentDesc)}</textarea>
            </div>
            <button class="btn btn-primary" onclick="proposeHeroChanges()">
                <i class="fas fa-paper-plane"></i> Propose Hero Updates
            </button>
        `;
    } else if (section === 'skills') {
        renderSkillsEditForm();
    } else if (section === 'projects') {
        renderProjectsEditForm();
    } else if (section === 'certifications') {
        renderCertificationsEditForm();
    }
}

// ===== SKILLS FORM =====
function renderSkillsEditForm() {
    const container = document.getElementById('dynamicEditFormContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="admin-sub-section">
            <h4 class="admin-sub-section-title">Add New Skill</h4>
            <div class="form-row-admin">
                <div class="form-group-admin">
                    <label for="newSkillName">Skill Name:</label>
                    <input type="text" id="newSkillName" class="admin-input" placeholder="e.g. Wireshark">
                </div>
                <div class="form-group-admin">
                    <label for="newSkillLevel">Skill Level (0-100%):</label>
                    <input type="number" id="newSkillLevel" class="admin-input" min="0" max="100" value="80">
                </div>
            </div>
            <div class="form-group-admin">
                <label for="newSkillCategory">Skill Category:</label>
                <select id="newSkillCategory" class="admin-input">
                    <option value="tools">Security Tools</option>
                    <option value="programming">Programming Languages</option>
                    <option value="cyber">Cybersecurity Areas</option>
                    <option value="platforms">Platforms & Knowledge</option>
                </select>
            </div>
            <button class="btn btn-primary btn-sm" onclick="addSkillLocal()">
                <i class="fas fa-plus"></i> Add Skill to Draft
            </button>
        </div>

        <h4 style="font-family: var(--font-heading); font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase;">Current Skills Draft</h4>
        <div id="adminSkillsListContainer" class="admin-list-container"></div>

        <button class="btn btn-primary" onclick="proposeSkillsChanges()">
            <i class="fas fa-paper-plane"></i> Propose Skills Changes
        </button>
    `;

    renderSkillsEditList();
}

function renderSkillsEditList() {
    const listContainer = document.getElementById('adminSkillsListContainer');
    if (!listContainer) return;

    if (!tempSkills || Object.keys(tempSkills).length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No skills defined in draft.</div>';
        return;
    }

    let itemsHtml = '';
    const categories = {
        tools: 'Security Tools',
        programming: 'Programming',
        cyber: 'Cybersecurity Areas',
        platforms: 'Platforms & Knowledge'
    };

    Object.keys(categories).forEach(catKey => {
        const catName = categories[catKey];
        const list = tempSkills[catKey] || [];
        if (list.length > 0) {
            itemsHtml += `<div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--primary); margin: 0.5rem 0.25rem 0.25rem;">[${catName.toUpperCase()}]</div>`;
            list.forEach((skill, idx) => {
                itemsHtml += `
                    <div class="admin-list-item">
                        <div class="admin-list-item-info">
                            <span class="admin-list-item-title">${escapeHtml(skill.name)}</span>
                            <span class="admin-list-item-subtitle">Level: ${skill.level}%</span>
                        </div>
                        <div class="admin-list-item-actions">
                            <button class="btn btn-sm btn-primary" onclick="editSkillLocal('${catKey}', ${idx})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="removeSkillLocal('${catKey}', ${idx})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
    });

    listContainer.innerHTML = itemsHtml || '<div class="empty-state">No skills defined in draft.</div>';
}

window.addSkillLocal = () => {
    const nameInput = document.getElementById('newSkillName');
    const levelInput = document.getElementById('newSkillLevel');
    const catInput = document.getElementById('newSkillCategory');
    if (!nameInput || !levelInput || !catInput) return;

    const name = nameInput.value.trim();
    const level = parseInt(levelInput.value);
    const cat = catInput.value;

    if (!name || isNaN(level)) {
        showNotification('Please enter a valid skill name and level.', 'warning');
        return;
    }

    if (!tempSkills[cat]) tempSkills[cat] = [];
    tempSkills[cat].push({ name, level });

    // Reset inputs
    nameInput.value = '';
    
    // Refresh list
    renderSkillsEditList();
    showNotification(`Added ${name} to your skills draft. Click Propose changes when done.`, 'info');
};

window.removeSkillLocal = (cat, idx) => {
    if (tempSkills[cat] && tempSkills[cat][idx]) {
        const removed = tempSkills[cat].splice(idx, 1)[0];
        renderSkillsEditList();
        showNotification(`Removed ${removed.name} from skills draft.`, 'info');
    }
};

window.editSkillLocal = (cat, idx) => {
    if (tempSkills[cat] && tempSkills[cat][idx]) {
        const skill = tempSkills[cat][idx];
        document.getElementById('newSkillName').value = skill.name || '';
        document.getElementById('newSkillLevel').value = skill.level || '';
        document.getElementById('newSkillCategory').value = cat || '';
        
        // Remove from list so it can be re-added after editing
        tempSkills[cat].splice(idx, 1);
        renderSkillsEditList();
        showNotification(`Editing ${skill.name}. Make your changes and click 'Add Skill'.`, 'info');
    }
};

// ===== PROJECTS FORM =====
function renderProjectsEditForm() {
    const container = document.getElementById('dynamicEditFormContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="admin-sub-section">
            <h4 class="admin-sub-section-title">Add New Project</h4>
            <div class="form-row-admin">
                <div class="form-group-admin">
                    <label for="newProjTitle">Project Title:</label>
                    <input type="text" id="newProjTitle" class="admin-input" placeholder="e.g. HM-BGRemover">
                </div>
                <div class="form-group-admin">
                    <label for="newProjCategory">Category:</label>
                    <select id="newProjCategory" class="admin-input">
                        <option value="websec">Web Security (websec)</option>
                        <option value="webapp">Web Application (webapp)</option>
                        <option value="security">Security Infrastructure (security)</option>
                    </select>
                </div>
            </div>
            <div class="form-group-admin">
                <label for="newProjDesc">Description:</label>
                <textarea id="newProjDesc" class="admin-input" rows="3" placeholder="Describe the project goal and design..."></textarea>
            </div>
            <div class="form-row-admin">
                <div class="form-group-admin">
                    <label for="newProjTech">Technologies (comma separated):</label>
                    <input type="text" id="newProjTech" class="admin-input" placeholder="HTML, CSS, Flask, APIs">
                </div>
                <div class="form-group-admin">
                    <label for="newProjDate">Date/Period:</label>
                    <input type="text" id="newProjDate" class="admin-input" placeholder="e.g. Jul - Aug 2025">
                </div>
            </div>
            <div class="form-row-admin">
                <div class="form-group-admin">
                    <label for="newProjFindings">Findings / Learnings:</label>
                    <textarea id="newProjFindings" class="admin-input" rows="2" placeholder=" learnings, security controls implemented..."></textarea>
                </div>
                <div class="form-group-admin">
                    <label for="newProjLink">Project URL Link:</label>
                    <input type="text" id="newProjLink" class="admin-input" placeholder="e.g. https://github.com/maheshgarlapally/HM-BGRemover">
                </div>
            </div>
            <div class="admin-checkbox-group">
                <input type="checkbox" id="newProjLive">
                <label for="newProjLive">Include Live Demo link indicator</label>
            </div>
            <button class="btn btn-primary btn-sm" onclick="addProjectLocal()">
                <i class="fas fa-plus"></i> Add Project to Draft
            </button>
        </div>

        <h4 style="font-family: var(--font-heading); font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase;">Current Projects Draft</h4>
        <div id="adminProjectsListContainer" class="admin-list-container"></div>

        <button class="btn btn-primary" onclick="proposeProjectsChanges()">
            <i class="fas fa-paper-plane"></i> Propose Projects Changes
        </button>
    `;

    renderProjectsEditList();
}

function renderProjectsEditList() {
    const listContainer = document.getElementById('adminProjectsListContainer');
    if (!listContainer) return;

    if (!tempProjects || tempProjects.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No projects in draft.</div>';
        return;
    }

    listContainer.innerHTML = tempProjects.map((proj, idx) => `
        <div class="admin-list-item">
            <div class="admin-list-item-info">
                <span class="admin-list-item-title">${escapeHtml(proj.title)}</span>
                <span class="admin-list-item-subtitle">${proj.date} | Category: ${proj.category}</span>
            </div>
            <div class="admin-list-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editProjectLocal(${idx})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="removeProjectLocal(${idx})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.addProjectLocal = () => {
    const titleInput = document.getElementById('newProjTitle');
    const catInput = document.getElementById('newProjCategory');
    const descInput = document.getElementById('newProjDesc');
    const techInput = document.getElementById('newProjTech');
    const dateInput = document.getElementById('newProjDate');
    const findingsInput = document.getElementById('newProjFindings');
    const linkInput = document.getElementById('newProjLink');
    const liveInput = document.getElementById('newProjLive');

    if (!titleInput || !descInput) return;

    const title = titleInput.value.trim();
    const category = catInput.value;
    const description = descInput.value.trim();
    const technologies = techInput.value.split(',').map(t => t.trim()).filter(Boolean);
    const date = dateInput.value.trim() || '2025';
    const findings = findingsInput.value.trim();
    const link = linkInput ? linkInput.value.trim() : '';
    const liveDemo = liveInput.checked;

    if (!title || !description) {
        showNotification('Please enter a project title and description.', 'warning');
        return;
    }

    const newId = tempProjects.length > 0 ? Math.max(...tempProjects.map(p => p.id)) + 1 : 1;

    tempProjects.push({
        id: newId,
        title,
        category,
        description,
        technologies,
        date,
        findings,
        link,
        liveDemo
    });

    // Reset inputs
    titleInput.value = '';
    descInput.value = '';
    techInput.value = '';
    dateInput.value = '';
    findingsInput.value = '';
    if (linkInput) linkInput.value = '';
    liveInput.checked = false;

    renderProjectsEditList();
    showNotification(`Added project "${title}" to draft list.`, 'info');
};

window.removeProjectLocal = (idx) => {
    if (tempProjects && tempProjects[idx]) {
        const removed = tempProjects.splice(idx, 1)[0];
        renderProjectsEditList();
        showNotification(`Removed project "${removed.title}" from draft.`, 'info');
    }
};

window.editProjectLocal = (idx) => {
    if (tempProjects && tempProjects[idx]) {
        const proj = tempProjects[idx];
        document.getElementById('newProjTitle').value = proj.title || '';
        document.getElementById('newProjCategory').value = proj.category || 'websec';
        document.getElementById('newProjDesc').value = proj.description || '';
        document.getElementById('newProjTech').value = (proj.technologies || []).join(', ');
        document.getElementById('newProjDate').value = proj.date || '';
        document.getElementById('newProjFindings').value = proj.findings || '';
        if (document.getElementById('newProjLink')) document.getElementById('newProjLink').value = proj.link || '';
        if (document.getElementById('newProjLive')) document.getElementById('newProjLive').checked = proj.liveDemo || false;
        
        // Remove from list so it can be re-added after editing
        tempProjects.splice(idx, 1);
        renderProjectsEditList();
        showNotification(`Editing project "${proj.title}". Make changes and click 'Add Project'.`, 'info');
    }
};

// ===== CERTIFICATIONS FORM =====
function renderCertificationsEditForm() {
    const container = document.getElementById('dynamicEditFormContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="admin-sub-section">
            <h4 class="admin-sub-section-title">Add New Certification</h4>
            <div class="form-row-admin">
                <div class="form-group-admin">
                    <label for="newCertTitle">Certification Title:</label>
                    <input type="text" id="newCertTitle" class="admin-input" placeholder="e.g. CompTIA Security+">
                </div>
                <div class="form-group-admin">
                    <label for="newCertIssuer">Issuer:</label>
                    <input type="text" id="newCertIssuer" class="admin-input" placeholder="e.g. CompTIA">
                </div>
            </div>
            <div class="form-row-admin">
                <div class="form-group-admin">
                    <label for="newCertDate">Completion Date:</label>
                    <input type="text" id="newCertDate" class="admin-input" placeholder="e.g. 2025">
                </div>
                <div class="form-group-admin">
                    <label for="newCertIcon">Icon Class (FontAwesome):</label>
                    <input type="text" id="newCertIcon" class="admin-input" value="fas fa-certificate" placeholder="e.g. fas fa-user-secret">
                </div>
            </div>
            <div class="form-group-admin">
                <label for="newCertDesc">Short Description:</label>
                <textarea id="newCertDesc" class="admin-input" rows="2" placeholder="Brief details about the certification syllabus or highlights..."></textarea>
            </div>
            <button class="btn btn-primary btn-sm" onclick="addCertLocal()">
                <i class="fas fa-plus"></i> Add Certification to Draft
            </button>
        </div>

        <h4 style="font-family: var(--font-heading); font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase;">Current Certifications Draft</h4>
        <div id="adminCertsListContainer" class="admin-list-container"></div>

        <button class="btn btn-primary" onclick="proposeCertificationsChanges()">
            <i class="fas fa-paper-plane"></i> Propose Certifications Changes
        </button>
    `;

    renderCertificationsEditList();
}

function renderCertificationsEditList() {
    const listContainer = document.getElementById('adminCertsListContainer');
    if (!listContainer) return;

    if (!tempCertifications || tempCertifications.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No certifications in draft.</div>';
        return;
    }

    listContainer.innerHTML = tempCertifications.map((cert, idx) => `
        <div class="admin-list-item">
            <div class="admin-list-item-info">
                <span class="admin-list-item-title">${escapeHtml(cert.title)}</span>
                <span class="admin-list-item-subtitle">${cert.issuer} (${cert.date})</span>
            </div>
            <div class="admin-list-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editCertLocal(${idx})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="removeCertLocal(${idx})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.addCertLocal = () => {
    const titleInput = document.getElementById('newCertTitle');
    const issuerInput = document.getElementById('newCertIssuer');
    const dateInput = document.getElementById('newCertDate');
    const iconInput = document.getElementById('newCertIcon');
    const descInput = document.getElementById('newCertDesc');

    if (!titleInput || !issuerInput) return;

    const title = titleInput.value.trim();
    const issuer = issuerInput.value.trim();
    const date = dateInput.value.trim() || '2025';
    const icon = iconInput.value.trim() || 'fas fa-certificate';
    const description = descInput.value.trim();

    if (!title || !issuer) {
        showNotification('Please enter a certification title and issuer.', 'warning');
        return;
    }

    const newId = tempCertifications.length > 0 ? Math.max(...tempCertifications.map(c => c.id)) + 1 : 1;

    tempCertifications.push({
        id: newId,
        title,
        issuer,
        date,
        icon,
        description
    });

    // Reset inputs
    titleInput.value = '';
    issuerInput.value = '';
    dateInput.value = '';
    descInput.value = '';

    renderCertificationsEditList();
    showNotification(`Added certification "${title}" to draft.`, 'info');
};

window.removeCertLocal = (idx) => {
    if (tempCertifications && tempCertifications[idx]) {
        const removed = tempCertifications.splice(idx, 1)[0];
        renderCertificationsEditList();
        showNotification(`Removed certification "${removed.title}" from draft.`, 'info');
    }
};

window.editCertLocal = (idx) => {
    if (tempCertifications && tempCertifications[idx]) {
        const cert = tempCertifications[idx];
        document.getElementById('newCertTitle').value = cert.title || '';
        document.getElementById('newCertIssuer').value = cert.issuer || '';
        document.getElementById('newCertDate').value = cert.date || '';
        document.getElementById('newCertIcon').value = cert.icon || 'fas fa-certificate';
        document.getElementById('newCertDesc').value = cert.description || '';
        
        // Remove from list so it can be re-added after editing
        tempCertifications.splice(idx, 1);
        renderCertificationsEditList();
        showNotification(`Editing certification "${cert.title}". Make changes and click 'Add Certification'.`, 'info');
    }
};


// ===== DASHBOARD PROPOSAL SUBMISSIONS =====
async function proposeAboutChanges() {
    const title = document.getElementById('aboutTitleInput').value.trim();
    const description = document.getElementById('aboutDescInput').value.trim();
    
    if (!title || !description) {
        showNotification('Title and Description cannot be empty.', 'warning');
        return;
    }

    const currentTitle = document.querySelector('.about-title') ? document.querySelector('.about-title').textContent.trim() : '';
    const currentDesc = document.querySelector('.about-description') ? document.querySelector('.about-description').textContent.trim() : '';

    const content = { title, description };
    const oldContent = { title: currentTitle, description: currentDesc };

    await submitProposal('about', 'Updated About Me details', content, oldContent, 'about');
}

async function proposeHeroChanges() {
    const description = document.getElementById('heroDescInput').value.trim();
    
    if (!description) {
        showNotification('Hero description cannot be empty.', 'warning');
        return;
    }

    const heroDesc = document.querySelector('.hero-description');
    const currentDesc = heroDesc ? heroDesc.textContent.trim() : '';

    const content = { description };
    const oldContent = { description: currentDesc };

    await submitProposal('hero', 'Updated Hero Section details', content, oldContent, 'home');
}

async function proposeSkillsChanges() {
    await submitProposal('skills', 'Updated technical skills list', tempSkills, skillsData, 'skills');
}

async function proposeProjectsChanges() {
    await submitProposal('projects', 'Updated projects list', tempProjects, projectsData, 'projects');
}

async function proposeCertificationsChanges() {
    await submitProposal('certifications', 'Updated certifications list', tempCertifications, certificationsData, 'certifications');
}

async function submitProposal(section, description, content, oldContent, elementId) {
    try {
        const response = await fetch('/api/portfolio/propose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                type: 'edit',
                section: section,
                description: description,
                content: content,
                oldContent: oldContent,
                elementId: elementId
            })
        });

        const result = await response.json();
        if (response.ok && result.success) {
            showNotification('Content change proposed successfully! Check the Pending Approval tab to review.', 'success');
            await loadAdminDashboardData();
            
            // Switch to Pending Approval tab
            const pendingTabBtn = document.querySelector('.admin-tabs button[data-tab="pending-changes-tab"]');
            if (pendingTabBtn) pendingTabBtn.click();
        } else {
            showNotification(`Propose failed: ${result.error || 'Server error'}`, 'error');
        }
    } catch (error) {
        showNotification(`Network error: ${error.message}`, 'error');
    }
}

async function loadAdminDashboardData() {
    if (!adminToken) return;
    
    try {
        // 1. Fetch pending changes
        const changesRes = await fetch('/api/portfolio/changes', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const changes = await changesRes.json();
        const pendingChanges = changes.filter(c => c.status === 'pending');
        
        // Update badge
        const changesBadge = document.getElementById('pendingChangesBadge');
        if (changesBadge) changesBadge.textContent = pendingChanges.length;
        
        // Render pending changes
        const pendingList = document.getElementById('pendingChangesList');
        if (pendingList) {
            if (pendingChanges.length === 0) {
                pendingList.innerHTML = '<div class="empty-state">No pending changes to review.</div>';
            } else {
                pendingList.innerHTML = pendingChanges.map(change => {
                    let proposedText = typeof change.content === 'object' ? JSON.stringify(change.content, null, 2) : change.content;
                    let originalText = typeof change.oldContent === 'object' ? JSON.stringify(change.oldContent, null, 2) : change.oldContent;
                    if (!originalText) originalText = '(Empty)';
                    
                    return `
                        <div class="change-item">
                            <div class="change-item-header">
                                <span class="change-section-badge">${change.section}</span>
                                <span class="change-time">${new Date(change.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="change-desc">${change.description}</div>
                            <div class="change-diff">
                                <div>
                                    <div style="font-size: 0.75rem; color: var(--danger); font-family: var(--font-mono); margin-bottom: 0.25rem;">CURRENT LIVE CONTENT:</div>
                                    <div class="diff-box old">${escapeHtml(originalText)}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.75rem; color: var(--primary); font-family: var(--font-mono); margin-bottom: 0.25rem;">PROPOSED CONTENT:</div>
                                    <div class="diff-box new">${escapeHtml(proposedText)}</div>
                                </div>
                            </div>
                            <div class="change-actions">
                                <button class="btn btn-sm btn-danger" onclick="rejectChange('${change.id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                                <button class="btn btn-sm btn-success" onclick="approveChange('${change.id}')">
                                    <i class="fas fa-check"></i> Approve & Apply
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
        
        // 2. Fetch contact messages
        const msgsRes = await fetch('/api/messages', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const messages = await msgsRes.json();
        const unreadCount = messages.filter(m => m.status === 'unread').length;
        
        // Update badge
        const msgsBadge = document.getElementById('visitorMessagesBadge');
        if (msgsBadge) msgsBadge.textContent = unreadCount;
        
        // Render contact messages
        const messagesList = document.getElementById('visitorMessagesList');
        if (messagesList) {
            if (messages.length === 0) {
                messagesList.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">No messages received yet.</td>
                    </tr>
                `;
            } else {
                const sortedMsgs = [...messages].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
                messagesList.innerHTML = sortedMsgs.map(msg => `
                    <tr class="${msg.status}">
                        <td class="change-time">${new Date(msg.timestamp).toLocaleDateString()}<br>${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td>
                            <strong>${escapeHtml(msg.name)}</strong><br>
                            <span style="color: var(--text-muted); font-size: 0.8rem;">${escapeHtml(msg.email)}</span>
                            ${msg.company ? `<br><span style="font-size: 0.8rem; font-style: italic;">${escapeHtml(msg.company)}</span>` : ''}
                        </td>
                        <td><span class="change-section-badge" style="border-color: var(--border); color: var(--text-secondary);">${escapeHtml(msg.inquiry)}</span></td>
                        <td style="white-space: pre-wrap; max-width: 300px;">${escapeHtml(msg.message)}</td>
                        <td>
                            <div style="display: flex; gap: 0.25rem;">
                                ${msg.status === 'unread' ? `
                                    <button class="btn btn-sm btn-success" onclick="markMessageRead('${msg.id}')" title="Mark as Read">
                                        <i class="fas fa-check"></i>
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-danger" onclick="deleteMessage('${msg.id}')" title="Delete Message">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ===== Update Init Function =====
function init() {
    console.log('🚀 Cybersecurity Portfolio Initialized');
    
    // Initialize all systems
    addNotificationStyles();
    initPreloader();
    initTheme();
    initNavigation();
    initTerminal();
    
    // Load dynamic content from backend
    loadPortfolioData();
    
    initContactForm();
    initSmoothScrolling();
    initRootControls();
    initSecuritySystem();
    setupCleanup();
}
// ===== Simplified Security Functions =====
function showAccessDenied() {
    const deniedNotification = document.getElementById('accessDeniedNotification');
    if (!deniedNotification) return;
    
    deniedNotification.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideAccessDenied();
    }, 3000);
}

function hideAccessDenied() {
    const deniedNotification = document.getElementById('accessDeniedNotification');
    if (!deniedNotification) return;
    
    deniedNotification.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== Update Permission Checking =====
function checkPermission(command) {
    if (!hasPermission(command)) {
        if (isRootMode) {
            return `Permission denied: "${command}" not available in root mode`;
        } else {
            showAccessDenied(); // Show simple notification
            return `Access denied. Use "su" to elevate privileges.`;
        }
    }
    return null;
}

// ===== Initialize Security System (Simplified) =====
function initSecuritySystem() {
    // Close notification on click
    const deniedNotification = document.getElementById('accessDeniedNotification');
    if (deniedNotification) {
        deniedNotification.addEventListener('click', hideAccessDenied);
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAccessDenied();
        }
    });
    
    // Auto-restore root mode session if token exists
    if (adminToken) {
        activateRootMode();
    }
    
    console.log('🔐 Security system initialized (simplified)');
}

// ===== Update User Commands Help Text =====
const simplifiedUserCommands = {
    ...userCommands,
    
    help: {
        description: 'Display available commands',
        execute: () => {
            return `
Available Commands (User Mode):
• help          - Show this help message
• about         - Display professional profile
• education     - Show academic background
• skills        - Show technical skills
• projects      - List security projects
• experience    - Show internship learning
• certifications - List certifications
• contact       - Show contact information
• hireme        - Why hire me
• status        - Availability and career goals
• clear         - Clear terminal
• theme         - Toggle dark/light theme
• matrix        - Toggle matrix background
• date          - Show current date
• whoami        - Display current user
• ls            - List files
• pwd           - Print working directory
• echo          - Echo text
• tryhackme     - Show TryHackMe progress
• htb           - Show Hack The Box progress
• job           - Job search status

🔐 Restricted Commands (Root access required):
• edit          - Modify portfolio content
• config        - Open configuration panel
• reset         - Reset all changes
• backup        - Create backup
• scan          - Run security scan

Type "su [password]" to switch to root user.
            `;
        }
    },
    
    su: {
        description: 'Switch to root user',
        execute: async (args) => {
            if (args.length > 0) {
                let password = args[0];
                if ((password.startsWith('[') && password.endsWith(']')) ||
                    (password.startsWith('"') && password.endsWith('"')) ||
                    (password.startsWith("'") && password.endsWith("'"))) {
                    password = password.slice(1, -1);
                }
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: password })
                    });
                    const data = await response.json();
                    if (response.ok && data.success) {
                        sessionStorage.setItem('adminToken', data.token);
                        adminToken = data.token;
                        activateRootMode();
                        return '✅ Root access granted.\nType "help" for root commands.';
                    } else {
                        return `❌ Access denied. ${data.error || 'Incorrect password.'}`;
                    }
                } catch (error) {
                    return `❌ Authentication error: ${error.message}`;
                }
            } else {
                return 'Usage: su [password]\nRoot access required for modifications.';
            }
        }
    }
};

// Replace user commands
Object.assign(userCommands, simplifiedUserCommands);

// Resume Upload Logic
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadResumeBtn');
    const uploadInput = document.getElementById('resumeUploadInput');
    const uploadStatus = document.getElementById('resumeUploadStatus');

    if (uploadBtn && uploadInput && uploadStatus) {
        uploadBtn.addEventListener('click', async () => {
            const file = uploadInput.files[0];
            if (!file) {
                uploadStatus.innerHTML = '<span style="color: #ff4c4c;">Please select a PDF file first.</span>';
                return;
            }
            if (file.type !== 'application/pdf') {
                uploadStatus.innerHTML = '<span style="color: #ff4c4c;">Only PDF files are allowed.</span>';
                return;
            }

            // 'adminToken' might be defined globally, but check sessionStorage as fallback
            const token = sessionStorage.getItem('adminToken') || (typeof adminToken !== 'undefined' ? adminToken : null);
            if (!token) {
                uploadStatus.innerHTML = '<span style="color: #ff4c4c;">Not authenticated. Root access required.</span>';
                return;
            }

            const formData = new FormData();
            formData.append('resume', file);

            uploadStatus.innerHTML = '<span style="color: #00d2ff;">Uploading...</span>';
            uploadBtn.disabled = true;

            try {
                const response = await fetch('/api/admin/resume', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    uploadStatus.innerHTML = '<span style="color: #00ff00;">Resume uploaded successfully!</span>';
                    uploadInput.value = '';
                } else {
                    uploadStatus.innerHTML = `<span style="color: #ff4c4c;">Upload failed: ${data.error || 'Unknown error'}</span>`;
                }
            } catch (error) {
                uploadStatus.innerHTML = `<span style="color: #ff4c4c;">Upload error: ${error.message}</span>`;
            } finally {
                uploadBtn.disabled = false;
            }
        });
    }
});
