

        // Global Variables
        let currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        let currentTheme = localStorage.getItem('preferredTheme') || 'light';
        let userLocation = null;
        let isTracking = false;
        let map = null;
        let currentFilter = 'all';
        let watchId = null;

        // App State
        class AppState {
            constructor() {
                this.visited = JSON.parse(localStorage.getItem('visitedPandals')) || [];
                this.bookmarked = JSON.parse(localStorage.getItem('bookmarkedPandals')) || [];
                this.points = parseInt(localStorage.getItem('userPoints')) || 0;
                this.badges = JSON.parse(localStorage.getItem('userBadges')) || [];
                this.routes = JSON.parse(localStorage.getItem('userRoutes')) || [];
            }

            save() {
                localStorage.setItem('visitedPandals', JSON.stringify(this.visited));
                localStorage.setItem('bookmarkedPandals', JSON.stringify(this.bookmarked));
                localStorage.setItem('userPoints', this.points.toString());
                localStorage.setItem('userBadges', JSON.stringify(this.badges));
                localStorage.setItem('userRoutes', JSON.stringify(this.routes));
            }
        }

        let appState = new AppState();

        // Pandal Data with Bengali names
        const pandalData = [
            // Heritage Pandals
            { id: 'tala-prattoy', name: 'Tala Prattoy', nameBn: 'তালা প্রত্যয়', type: 'heritage', area: 'Tala', areaBn: 'তালা', lat: 22.608846, lng: 88.382502, theme: 'Traditional Bengali Architecture', themeBn: 'ঐতিহ্যবাহী বাঙালি স্থাপত্য', hours: '6 AM - 11 PM', transport: '2.5 km from Dum Dum Metro', crowd: 'medium', accessible: false },
            { id: 'kumartuli-sarbojanin', name: 'Kumartuli Sarbojanin', nameBn: 'কুমারটুলি সর্বজনীন', type: 'heritage', area: 'Kumartuli', areaBn: 'কুমারটুলি', lat: 22.599058253797256, lng: 88.36145439677378, theme: 'Clay Artist Heritage', themeBn: 'মৃৎশিল্পীদের ঐতিহ্য', hours: '5 AM - 11 PM', transport: 'Near Sovabazar Metro', crowd: 'high', accessible: false },
            { id: 'baghbazar-sarbojanin', name: 'Baghbazar Sarbojanin', nameBn: 'বাগবাজার সর্বজনীন', type: 'heritage', area: 'Baghbazar', areaBn: 'বাগবাজার', lat: 22.604667910075644, lng: 88.36562569985544, theme: 'Traditional Pandal Art', themeBn: 'ঐতিহ্যবাহী পণ্ডেল শিল্প', hours: '6 AM - 11 PM', transport: 'Shyambazar Metro', crowd: 'medium', accessible: true },
            { id: 'sovabazar-rajbari', name: 'Sovabazar Rajbari', nameBn: 'শোভাবাজার রাজবাড়ি', type: 'heritage', area: 'Sovabazar', areaBn: 'শোভাবাজার', lat: 22.596048876948696, lng: 88.36721188946015, theme: 'Royal Heritage', themeBn: 'রাজকীয় ঐতিহ্য', hours: '6 AM - 10 PM', transport: 'Sovabazar Metro', crowd: 'low', accessible: false },
            { id: 'shyambazar-nabadurga', name: 'Shyambazar Nabadurga', nameBn: 'শ্যামবাজার নবদুর্গা', type: 'heritage', area: 'Shyambazar', areaBn: 'শ্যামবাজার', lat: 22.5989, lng: 88.3731, theme: 'Ancient Traditions', themeBn: 'প্রাচীন ঐতিহ্য', hours: '5 AM - 11 PM', transport: 'Shyambazar Metro', crowd: 'high', accessible: true },
            { id: 'jorasanko-thakur-bari', name: 'Jorasanko Thakur Bari', nameBn: 'জোড়াসাঁকো ঠাকুরবাড়ি', type: 'heritage', area: 'Jorasanko', areaBn: 'জোড়াসাঁকো', lat: 22.585103506532562, lng: 88.3591643226664, theme: 'Tagore Family Heritage', themeBn: 'ঠাকুর পরিবারের ঐতিহ্য', hours: '6 AM - 10 PM', transport: 'Girish Park Metro', crowd: 'medium', accessible: false },
            { id: 'college-square', name: 'College Square', nameBn: 'কলেজ স্কোয়ার', type: 'heritage', area: 'College Street', areaBn: 'কলেজ স্ট্রিট', lat: 22.574666574660924, lng: 88.36444020917365, theme: 'Educational Heritage', themeBn: 'শিক্ষার ঐতিহ্য', hours: '6 AM - 12 AM', transport: 'College Street', crowd: 'medium', accessible: true },
            { id: 'hatibagan-nabin-palli', name: 'Hatibagan Nabin Palli', nameBn: 'হাতিবাগান নবীন পল্লী', type: 'heritage', area: 'Hatibagan', areaBn: 'হাতিবাগান', lat: 22.594535337634657, lng: 88.37201415600829, theme: 'Traditional Craftsmanship', themeBn: 'ঐতিহ্যবাহী কারুকাজ', hours: '6 AM - 11 PM', transport: 'Shyambazar area', crowd: 'medium', accessible: false },
            
            // Community Pandals
            { id: 'dum-dum-tarun-sangha', name: 'Dum Dum Tarun Sangha', nameBn: 'দমদম তরুণ সংঘ', type: 'community', area: 'Dum Dum', areaBn: 'দমদম', lat: 22.611150114746334, lng: 88.41388348657216, theme: 'Community Celebration', themeBn: 'কমিউনিটি উৎসব', hours: '6 AM - 12 AM', transport: 'Dum Dum Metro', crowd: 'high', accessible: true },
            { id: 'lake-town-adhibasi-brinda', name: 'Lake Town Adhibasi Brinda', nameBn: 'লেক টাউন আদিবাসী বৃন্দ', type: 'community', area: 'Lake Town', areaBn: 'লেক টাউন', lat: 22.604629063063634, lng: 88.40397009568207, theme: 'Tribal Culture', themeBn: 'উপজাতীয় সংস্কৃতি', hours: '6 AM - 11 PM', transport: 'Lake Town', crowd: 'medium', accessible: true },
            { id: 'salt-lake-fd-block', name: 'Salt Lake FD Block', nameBn: 'সল্ট লেক এফডি ব্লক', type: 'community', area: 'Salt Lake', areaBn: 'সল্ট লেক', lat: 22.58371511476005, lng: 88.41226667452867, theme: 'Modern Community', themeBn: 'আধুনিক কমিউনিটি', hours: '6 AM - 12 AM', transport: 'Salt Lake Stadium', crowd: 'high', accessible: true },
            { id: 'belgachia-club', name: 'Belgachia Club', nameBn: 'বেলগাছিয়া ক্লাব', type: 'community', area: 'Belgachia', areaBn: 'বেলগাছিয়া', lat: 22.605685067219326, lng: 88.3235694456533, theme: 'Local Community Spirit', themeBn: 'স্থানীয় কমিউনিটির চেতনা', hours: '6 AM - 11 PM', transport: 'Belgachia area', crowd: 'medium', accessible: false },
            { id: 'madhyamgram-chhatri-sangha', name: 'Madhyamgram Chhatri Sangha', nameBn: 'মধ্যমগ্রাম ছাত্রী সংঘ', type: 'community', area: 'Madhyamgram', areaBn: 'মধ্যমগ্রাম', lat: 22.6700, lng: 88.4600, theme: 'Student Community', themeBn: 'ছাত্র কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Madhyamgram Station', crowd: 'medium', accessible: false },
            { id: 'barasat-sarbojanin', name: 'Barasat Sarbojanin', nameBn: 'বারাসাত সর্বজনীন', type: 'community', area: 'Barasat', areaBn: 'বারাসাত', lat: 22.7200, lng: 88.4800, theme: 'Rural Community', themeBn: 'গ্রামীণ কমিউনিটি', hours: '5 AM - 11 PM', transport: 'Barasat Station', crowd: 'high', accessible: false },
            
            // Theme Pandals
            { id: 'sree-bhumi-sporting-club', name: 'Sree Bhumi Sporting Club', nameBn: 'শ্রীভূমি স্পোর্টিং ক্লাব', type: 'theme', area: 'Dum Dum', areaBn: 'দমদম', lat: 22.600473996675507, lng:  88.40264529965181, theme: 'Grand Spectacular Theme', themeBn: 'মহান দর্শনীয় থিম', hours: '24 Hours', transport: 'Dum Dum Metro', crowd: 'high', accessible: false },
            { id: 'santosh-mitra-square', name: 'Santosh Mitra Square', nameBn: 'সন্তোষ মিত্র স্কোয়ার', type: 'theme', area: 'Central Kolkata', areaBn: 'মধ্য কলকাতা', lat: 22.566206670311463, lng:  88.36565080732241, theme: 'Modern Art Installation', themeBn: 'আধুনিক শিল্প ইনস্টলেশন', hours: '6 AM - 12 AM', transport: 'Central Metro', crowd: 'medium', accessible: true },
            { id: 'triangular-park', name: 'Triangular Park', nameBn: 'ত্রিভুজাকার পার্ক', type: 'theme', area: 'Gariahat', areaBn: 'গড়িয়াহাট', lat: 22.517767387211045, lng: 88.35890325206616, theme: 'Contemporary Design', themeBn: 'সমসাময়িক ডিজাইন', hours: '6 AM - 12 AM', transport: 'Gariahat Metro', crowd: 'high', accessible: true },
            
            // Additional pandals to reach 31 total
            { id: 'girish-park-sarbojanin', name: 'Girish Park Sarbojanin', nameBn: 'গিরিশ পার্ক সর্বজনীন', type: 'community', area: 'Girish Park', areaBn: 'গিরিশ পার্ক', lat: 22.5800, lng: 88.3600, theme: 'Theatre Community', themeBn: 'নাট্য কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Girish Park Metro', crowd: 'medium', accessible: false },
            { id: 'mg-road-durgotsab', name: 'MG Road Durgotsab', nameBn: 'এমজি রোড দুর্গোৎসব', type: 'heritage', area: 'MG Road', areaBn: 'এমজি রোড', lat: 22.586598335674434, lng: 88.36239486887767, theme: 'Commercial Heritage', themeBn: 'বাণিজ্যিক ঐতিহ্য', hours: '6 AM - 12 AM', transport: 'Central Metro', crowd: 'high', accessible: true },
            { id: 'ahiritola-sarbojanin', name: 'Ahiritola Sarbojanin', nameBn: 'আহিরিটোলা সর্বজনীন', type: 'heritage', area: 'Ahiritola', areaBn: 'আহিরিটোলা', lat: 22.59510885849594, lng: 88.35721408033837, theme: 'River Ghat Heritage', themeBn: 'নদীর ঘাটের ঐতিহ্য', hours: '5 AM - 11 PM', transport: 'Near Bagbazar Ghat', crowd: 'medium', accessible: false },
            { id: 'chitpur-sarbojanin', name: 'Chitpur Sarbojanin', nameBn: 'চিৎপুর সর্বজনীন', type: 'heritage', area: 'Chitpur', areaBn: 'চিৎপুর', lat: 22.5950, lng: 88.3800, theme: 'Traditional North Kolkata', themeBn: 'ঐতিহ্যবাহী উত্তর কলকাতা', hours: '6 AM - 11 PM', transport: 'Chitpur area', crowd: 'medium', accessible: true },
            { id: 'sinthi-sarbojanin', name: 'Sinthi Sarbojanin', nameBn: 'সিন্থি সর্বজনীন', type: 'community', area: 'Sinthi', areaBn: 'সিন্থি', lat: 22.627251854893327, lng: 88.38964196684697, theme: 'Riverside Community', themeBn: 'নদীর পাড়ের কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Sinthi area', crowd: 'medium', accessible: false },
            { id: 'agarpara-sarbojanin', name: 'Agarpara Sarbojanin', nameBn: 'আগরপাড়া সর্বজনীন', type: 'community', area: 'Agarpara', areaBn: 'আগরপাড়া', lat: 22.6400, lng: 88.3700, theme: 'Industrial Community', themeBn: 'শিল্প কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Agarpara Station', crowd: 'low', accessible: false },
            { id: 'jessore-road-sarbojanin', name: 'Jessore Road Sarbojanin', nameBn: 'যশোর রোড সর্বজনীন', type: 'community', area: 'Jessore Road', areaBn: 'যশোর রোড', lat: 22.6400, lng: 88.4200, theme: 'Highway Community', themeBn: 'হাইওয়ে কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Jessore Road', crowd: 'medium', accessible: false },
            { id: 'airport-gate-sarbojanin', name: 'Airport Gate Sarbojanin', nameBn: 'বিমানবন্দর গেট সর্বজনীন', type: 'community', area: 'Airport', areaBn: 'বিমানবন্দর', lat: 22.6500, lng: 88.4500, theme: 'Aviation Community', themeBn: 'বিমান চলাচল কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Airport area', crowd: 'medium', accessible: true },
            { id: 'pathuriaghata-ghosh-bari', name: 'Pathuriaghata Ghosh Bari', nameBn: 'পাথুরিয়াঘাটা ঘোষ বাড়ি', type: 'heritage', area: 'Pathuriaghata', areaBn: 'পাথুরিয়াঘাটা', lat: 22.5900, lng: 88.3600, theme: 'Zamindari Heritage', themeBn: 'জমিদারি ঐতিহ্য', hours: '6 AM - 10 PM', transport: 'Central Metro', crowd: 'low', accessible: false },
            { id: 'beadon-street', name: 'Beadon Street', nameBn: 'বিডন স্ট্রিট', type: 'heritage', area: 'Beadon Street', areaBn: 'বিডন স্ট্রিট', lat: 22.58934992539946, lng: 88.36758110917404, theme: 'Colonial Heritage', themeBn: 'ঔপনিবেশিক ঐতিহ্য', hours: '6 AM - 11 PM', transport: 'Central Kolkata', crowd: 'low', accessible: false },
            { id: 'rajarhat-new-town', name: 'Rajarhat New Town', nameBn: 'রাজারহাট নিউ টাউন', type: 'community', area: 'New Town', areaBn: 'নিউ টাউন', lat: 22.584334183757967, lng: 88.45919232199338, theme: 'Modern Township', themeBn: 'আধুনিক টাউনশিপ', hours: '6 AM - 12 AM', transport: 'New Town area', crowd: 'high', accessible: true },
            { id: 'baguiati-sporting', name: 'Baguiati Sporting', nameBn: 'বাগুইআটি স্পোর্টিং', type: 'community', area: 'Baguiati', areaBn: 'বাগুইআটি', lat: 22.6300, lng: 88.4400, theme: 'Sports Community', themeBn: 'ক্রীড়া কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Baguiati area', crowd: 'medium', accessible: false },
            { id: 'dakshineswar-ramkrishna-sangha', name: 'Dakshineswar Ramkrishna Sangha', nameBn: 'দক্ষিণেশ্বর রামকৃষ্ণ সংঘ', type: 'community', area: 'Dakshineswar', areaBn: 'দক্ষিণেশ্বর', lat: 22.6550, lng: 88.3580, theme: 'Spiritual Community', themeBn: 'আধ্যাত্মিক কমিউনিটি', hours: '5 AM - 10 PM', transport: 'Dakshineswar Metro', crowd: 'high', accessible: false },
            { id: 'nager-bazaar-sarbojanin', name: 'Nager Bazaar Sarbojanin', nameBn: 'নগর বাজার সর্বজনীন', type: 'community', area: 'Nager Bazaar', areaBn: 'নগর বাজার', lat: 22.605626765853383, lng: 88.37011305699241, theme: 'Market Community', themeBn: 'বাজার কমিউনিটি', hours: '6 AM - 11 PM', transport: 'Nager Bazaar Metro', crowd: 'medium', accessible: false }
        ];

        // Food Data
        const foodData = [
            { name: 'Kathi Roll', nameBn: 'কাঠি রোল', type: 'street', location: 'Nizam\'s, New Market', locationBn: 'নিজাম, নিউ মার্কেট', rating: 4.8, price: '₹80 - ₹120', lat: 22.5726, lng: 88.3639 },
            { name: 'Rasgulla', nameBn: 'রসগোল্লা', type: 'sweets', location: 'KC Das, Esplanade', locationBn: 'কেসি দাস, এসপ্ল্যানেড', rating: 4.9, price: '₹15 - ₹25 per piece', lat: 22.5726, lng: 88.3639 },
            { name: 'Phuchka', nameBn: 'ফুচকা', type: 'street', location: 'College Street Corner', locationBn: 'কলেজ স্ট্রিট কর্নার', rating: 4.2, price: '₹30 - ₹50', lat: 22.5726, lng: 88.3639 },
            { name: 'Fish Curry & Rice', nameBn: 'মাছের ঝোল ভাত', type: 'traditional', location: 'Bhojohori Manna, Shyambazar', locationBn: 'ভোজোহরি মান্না, শ্যামবাজার', rating: 4.6, price: '₹200 - ₹350', lat: 22.5989, lng: 88.3731 },
            { name: 'Sandesh', nameBn: 'সন্দেশ', type: 'sweets', location: 'Girish Chandra Dey, Bagbazar', locationBn: 'গিরীশচন্দ্র দে, বাগবাজার', rating: 4.7, price: '₹20 - ₹40 per piece', lat: 22.5900, lng: 88.3700 },
            { name: 'Kheer', nameBn: 'ক্ষীর', type: 'traditional', location: 'Paramount, Shyama Charan Street', locationBn: 'প্যারামাউন্ট, শ্যামাচরণ স্ট্রিট', rating: 4.3, price: '₹60 - ₹100', lat: 22.5700, lng: 88.3650 },
            { name: 'Jhal Muri', nameBn: 'ঝালমুড়ি', type: 'street', location: 'Victoria Memorial Area', locationBn: 'ভিক্টোরিয়া মেমোরিয়াল এলাকা', rating: 4.0, price: '₹20 - ₹40', lat: 22.5448, lng: 88.3426 },
            { name: 'Mishti Doi', nameBn: 'মিষ্টি দই', type: 'sweets', location: 'Banchharam, Taltala', locationBn: 'বাঁচারাম, তালতলা', rating: 4.5, price: '₹30 - ₹50', lat: 22.5726, lng: 88.3639 },
            { name: 'Biryani', nameBn: 'বিরিয়ানি', type: 'restaurants', location: 'Arsalan, Park Circus', locationBn: 'আর্সালান, পার্ক সার্কাস', rating: 4.8, price: '₹300 - ₹500', lat: 22.5448, lng: 88.3735 },
            { name: 'Kosha Mangsho', nameBn: 'কষা মাংস', type: 'restaurants', location: 'Peter Cat, Park Street', locationBn: 'পিটার ক্যাট, পার্ক স্ট্রিট', rating: 4.7, price: '₹400 - ₹600', lat: 22.5448, lng: 88.3637 },
            { name: 'Luchi Alur Dom', nameBn: 'লুচি আলুর দম', type: 'traditional', location: 'Kewpie\'s, Elgin Road', locationBn: 'কিউপিজ, এলগিন রোড', rating: 4.4, price: '₹150 - ₹250', lat: 22.5448, lng: 88.3637 },
            { name: 'Chingri Malai Curry', nameBn: 'চিংড়ি মালাই কারি', type: 'restaurants', location: 'Oh! Calcutta, Forum Mall', locationBn: 'ওহ! ক্যালকাটা, ফোরাম মল', rating: 4.6, price: '₹500 - ₹800', lat: 22.5448, lng: 88.3637 }
        ];
// Theme Archive
function showThemeArchive() {
    openModal('themeArchiveModal');
    closeSideMenu();
}

function showThemeDetails(year) {
    const themes = {
        2024: {
            title: 'Save Our Planet',
            description: 'Environmental conservation and climate change awareness through traditional art.',
            details: 'Pandals featured recycled materials, solar power, and eco-friendly decorations.'
        },
        2023: {
            title: 'Unity in Diversity',
            description: 'Celebrating India\'s multicultural heritage and unity.',
            details: 'Showcased different states\' cultures integrated with Bengali traditions.'
        },
        2022: {
            title: 'Tribute to Healthcare Workers',
            description: 'Honoring COVID-19 frontline warriors and medical professionals.',
            details: 'Many pandals featured hospital themes and healthcare worker tributes.'
        },
        2021: {
            title: 'Hope Amidst Crisis',
            description: 'Representing resilience and hope during pandemic times.',
            details: 'Smaller celebrations with focus on community support and solidarity.'
        },
        2020: {
            title: 'Simplified Celebration',
            description: 'COVID-19 restrictions led to smaller, community-focused celebrations.',
            details: 'First year with major restrictions, virtual darshan became popular.'
        },
        2019: {
            title: 'Bengali Heritage Revival',
            description: 'Showcasing traditional Bengali art, culture, and mythology.',
            details: 'Focus on preserving and promoting traditional Bengali craftsmanship.'
        }
    };
    
    const theme = themes[year];
    if (theme) {
        alert(`${year} Theme: ${theme.title}\n\n${theme.description}\n\n${theme.details}`);
    }
}

        // Initialize App
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        function initializeApp() {
            // Hide preloader after 3 seconds
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.classList.add('hide');
                }
            }, 3000);

            // Initialize components
            updateClock();
            setInterval(updateClock, 1000);
            updateLanguage();
            generatePandalCards();
            generateFoodCards();
            updateProgress();
            updateStats();
            setupEventListeners();
            
            // Set initial theme
            document.body.setAttribute('data-theme', currentTheme);
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            const langText = document.getElementById('langText');
            if (langText) {
                langText.textContent = currentLanguage === 'en' ? 'বাং' : 'Eng';
            }
        }

        // Clock Function
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            const clockElement = document.getElementById('live-clock');
            if (clockElement) {
                clockElement.textContent = timeString;
            }
        }

        // Event Listeners
        function setupEventListeners() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', handleSearch);
            }
            
            const foodSearchInput = document.getElementById('foodSearchInput');
            if (foodSearchInput) {
                foodSearchInput.addEventListener('input', handleFoodSearch);
            }
            
            const overlay = document.getElementById('sideMenuOverlay');
            if (overlay) {
                overlay.addEventListener('click', closeSideMenu);
            }

            // Add keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeAllModals();
                }
            });
        }

        // Theme Management
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', currentTheme);
            
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            localStorage.setItem('preferredTheme', currentTheme);
        }

        // Language Management
        function toggleLanguage() {
            currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';
            updateLanguage();
            
            const langText = document.getElementById('langText');
            if (langText) {
                langText.textContent = currentLanguage === 'en' ? 'বাং' : 'Eng';
            }
            
            localStorage.setItem('preferredLanguage', currentLanguage);
            generatePandalCards();
            generateFoodCards();
        }

        function updateLanguage() {
            const elements = document.querySelectorAll('[data-' + currentLanguage + ']');
            elements.forEach(element => {
                element.textContent = element.getAttribute('data-' + currentLanguage);
            });

            const placeholders = document.querySelectorAll('[data-placeholder-' + currentLanguage + ']');
            placeholders.forEach(element => {
                element.placeholder = element.getAttribute('data-placeholder-' + currentLanguage);
            });
        }

        // Navigation
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Remove active from all tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected section
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }
            
            // Activate corresponding tab
            const clickedTab = event?.target?.closest('.nav-tab');
            if (clickedTab) {
                clickedTab.classList.add('active');
            }

            // Initialize map if map section is selected
            if (sectionId === 'map') {
                setTimeout(initializeMap, 100);
            }
        }

        // Side Menu Functions
        function toggleSideMenu() {
            const menu = document.getElementById('sideMenu');
            const overlay = document.getElementById('sideMenuOverlay');
            
            if (menu && overlay) {
                menu.classList.toggle('open');
                overlay.classList.toggle('active');
            }
        }

        function closeSideMenu() {
            const menu = document.getElementById('sideMenu');
            const overlay = document.getElementById('sideMenuOverlay');
            
            if (menu) menu.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }

        // Generate Pandal Cards
        function generatePandalCards() {
            const grid = document.getElementById('pandalGrid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            pandalData.forEach(pandal => {
                const card = createPandalCard(pandal);
                grid.appendChild(card);
            });

            updateStats();
        }

        function createPandalCard(pandal) {
            const div = document.createElement('div');
            const isBookmarked = appState.bookmarked.includes(pandal.id);
            const isVisited = appState.visited.includes(pandal.id);
            
            div.className = `pandal-card ${isVisited ? 'visited' : ''}`;
            div.setAttribute('data-type', pandal.type);
            div.setAttribute('data-name', pandal.name.toLowerCase());
            div.setAttribute('data-location', pandal.area.toLowerCase());
            div.setAttribute('data-accessible', pandal.accessible);
            div.setAttribute('data-id', pandal.id);
            
            const crowdClass = `crowd-${pandal.crowd}`;
            const crowdText = pandal.crowd.charAt(0).toUpperCase() + pandal.crowd.slice(1);
            
            const displayName = currentLanguage === 'bn' ? pandal.nameBn : pandal.name;
            const displayArea = currentLanguage === 'bn' ? pandal.areaBn : pandal.area;
            const displayTheme = currentLanguage === 'bn' ? pandal.themeBn : pandal.theme;
            
            // Add distance info if user location is available
            let distanceHTML = '';
            if (userLocation) {
                const distance = calculateDistance(userLocation.lat, userLocation.lng, pandal.lat, pandal.lng);
                distanceHTML = `<div class="distance-info">📍 ${distance.toFixed(1)} km away</div>`;
            }
            
            div.innerHTML = `
                ${distanceHTML}
                <div class="crowd-indicator ${crowdClass}">${crowdText}</div>
                <div class="pandal-name">${displayName}</div>
                <div class="pandal-type">${pandal.type.charAt(0).toUpperCase() + pandal.type.slice(1)}</div>
                <div class="pandal-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt detail-icon"></i>
                        <span>${displayArea}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-palette detail-icon"></i>
                        <span>${displayTheme}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock detail-icon"></i>
                        <span>${pandal.hours}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-subway detail-icon"></i>
                        <span>${pandal.transport}</span>
                    </div>
                    ${pandal.accessible ? `
                        <div class="detail-item">
                            <i class="fas fa-wheelchair detail-icon"></i>
                            <span>Wheelchair Accessible</span>
                        </div>
                    ` : ''}
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('${pandal.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                    <button class="btn ${isVisited ? 'visited-btn' : ''}" onclick="markVisited('${pandal.id}')">
                        <i class="fas fa-${isVisited ? 'check-circle' : 'check'}"></i>
                        <span>${isVisited ? 'Visited' : 'Mark Visited'}</span>
                    </button>
                    <button class="btn" onclick="openGoogleMaps(${pandal.lat}, ${pandal.lng}, '${pandal.name}')">
                        <i class="fas fa-directions"></i>
                        <span>Directions</span>
                    </button>
                </div>
            `;
            
            return div;
        }

        // Generate Food Cards
        function generateFoodCards() {
            const grid = document.getElementById('foodGrid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            foodData.forEach(food => {
                const card = createFoodCard(food);
                grid.appendChild(card);
            });
        }

        function createFoodCard(food) {
            const div = document.createElement('div');
            div.className = 'food-card';
            div.setAttribute('data-type', food.type);
            
            const displayName = currentLanguage === 'bn' ? food.nameBn : food.name;
            const displayLocation = currentLanguage === 'bn' ? food.locationBn : food.location;
            
            const stars = '★'.repeat(Math.floor(food.rating)) + '☆'.repeat(5 - Math.floor(food.rating));
            
            div.innerHTML = `
                <h4>${displayName}</h4>
                <div class="food-rating">
                    <span style="color: var(--gold);">${stars}</span>
                    <span>${food.rating}/5</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <span>${displayLocation}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">💰</span>
                    <span>${food.price}</span>
                </div>
                <button class="btn" onclick="openGoogleMaps(${food.lat}, ${food.lng}, '${food.location}')">
                    <i class="fas fa-directions"></i>
                    <span data-en="Get Directions" data-bn="নির্দেশাবলী পান">Get Directions</span>
                </button>
            `;
            
            return div;
        }

        // Filter Functions
        function filterPandals(type) {
            currentFilter = type;
            const cards = document.querySelectorAll('.pandal-card');
            const filterBtns = document.querySelectorAll('#pandals .filter-btn');
            
            // Update filter button states
            filterBtns.forEach(btn => btn.classList.remove('active'));
            if (event && event.target) {
                event.target.classList.add('active');
            }
            
            let visibleCount = 0;
            
            cards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                const cardId = card.getAttribute('data-id');
                const isAccessible = card.getAttribute('data-accessible') === 'true';
                
                let shouldShow = false;
                
                switch(type) {
                    case 'all':
                        shouldShow = true;
                        break;
                    case 'accessible':
                        shouldShow = isAccessible;
                        break;
                    case 'bookmarked':
                        shouldShow = appState.bookmarked.includes(cardId);
                        break;
                    default:
                        shouldShow = cardType === type;
                }
                
                if (shouldShow) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            showToast(`Showing ${visibleCount} pandals`, 'info');
        }

        function handleSearch(event) {
            const query = event.target.value.toLowerCase();
            const cards = document.querySelectorAll('.pandal-card');
            let visibleCount = 0;
            
            cards.forEach(card => {
                const name = card.getAttribute('data-name');
                const location = card.getAttribute('data-location');
                
                const matchesSearch = query === '' || 
                    name.includes(query) || 
                    location.includes(query);
                
                let matchesFilter = true;
                if (currentFilter !== 'all') {
                    const cardType = card.getAttribute('data-type');
                    const cardId = card.getAttribute('data-id');
                    const isAccessible = card.getAttribute('data-accessible') === 'true';
                    
                    switch(currentFilter) {
                        case 'accessible':
                            matchesFilter = isAccessible;
                            break;
                        case 'bookmarked':
                            matchesFilter = appState.bookmarked.includes(cardId);
                            break;
                        default:
                            matchesFilter = cardType === currentFilter;
                    }
                }
                
                if (matchesSearch && matchesFilter) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Food Filter
        function filterFood(type) {
            const cards = document.querySelectorAll('.food-card');
            const filterBtns = document.querySelectorAll('#food .filter-btn');
            
            filterBtns.forEach(btn => btn.classList.remove('active'));
            if (event && event.target) {
                event.target.classList.add('active');
            }
            
            cards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                const shouldShow = type === 'all' || cardType === type;
                card.style.display = shouldShow ? 'block' : 'none';
            });
        }

        function handleFoodSearch(event) {
            const query = event.target.value.toLowerCase();
            const cards = document.querySelectorAll('.food-card');
            
            cards.forEach(card => {
                const name = card.querySelector('h4').textContent.toLowerCase();
                const shouldShow = query === '' || name.includes(query);
                card.style.display = shouldShow ? 'block' : 'none';
            });
        }

        // Bookmark Functions
        function toggleBookmark(pandalId) {
            const index = appState.bookmarked.indexOf(pandalId);
            const pandal = pandalData.find(p => p.id === pandalId);
            
            if (index > -1) {
                appState.bookmarked.splice(index, 1);
                showToast(`Removed ${pandal.name} from bookmarks`, 'info');
            } else {
                appState.bookmarked.push(pandalId);
                showToast(`Added ${pandal.name} to bookmarks`, 'success');
                awardPoints(5, 'Bookmark added');
            }
            
            appState.save();
            generatePandalCards();
            updateStats();
        }

        function markVisited(pandalId) {
            if (!appState.visited.includes(pandalId)) {
                appState.visited.push(pandalId);
                const pandal = pandalData.find(p => p.id === pandalId);
                
                awardPoints(10, 'Pandal visited');
                showToast(`Visited ${pandal.name}! +10 points`, 'success');
                
                appState.save();
                generatePandalCards();
                updateProgress();
                updateStats();
                checkAchievements();
            } else {
                showToast('Already marked as visited', 'info');
            }
        }

        // Location Functions
        function openGoogleMaps(lat, lng, name) {
    const confirmOpen = confirm(`Do you want to open Google Maps for directions to ${name}?`);
    
    if (confirmOpen) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&query=${encodeURIComponent(name)}`;
        window.open(url, '_blank');
        showToast(`Opening directions to ${name}`, 'info');
    } else {
        showToast('Cancelled opening Google Maps', 'warning');
    }
}

        function getCurrentLocation() {
            if (navigator.geolocation) {
                showToast('Finding your location...', 'info');
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        showNearbyPandals();
                        showToast('Location found! Showing nearby pandals', 'success');
                        generatePandalCards(); // Refresh to show distances
                        
                        if (map) {
                            map.setView([userLocation.lat, userLocation.lng], 13);
                            L.marker([userLocation.lat, userLocation.lng])
                                .addTo(map)
                                .bindPopup('Your Location')
                                .openPopup();
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        showToast('Could not get your location', 'error');
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                );
            } else {
                showToast('Geolocation is not supported', 'error');
            }
        }

        function showNearbyPandals() {
            if (!userLocation) {
                getCurrentLocation();
                return;
            }
            
            const distances = pandalData.map(pandal => {
                const distance = calculateDistance(userLocation.lat, userLocation.lng, pandal.lat, pandal.lng);
                return { pandal, distance };
            });
            
            distances.sort((a, b) => a.distance - b.distance);
            
            // Show top 5 nearest pandals
            const cards = document.querySelectorAll('.pandal-card');
            cards.forEach(card => {
                card.style.display = 'none';
            });
            
            distances.slice(0, 5).forEach(item => {
                const card = document.querySelector(`[data-id="${item.pandal.id}"]`);
                if (card) {
                    card.style.display = 'block';
                }
            });
            
            showToast('Showing 5 nearest pandals', 'success');
        }

        function calculateDistance(lat1, lng1, lat2, lng2) {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        // Route Functions
        function showRouteType(type) {
            filterPandals(type);
            showToast(`Showing ${type} route pandals`, 'info');
            
            // Initialize interactive map for the specific route type
            if (map) {
                // Clear existing markers
                map.eachLayer((layer) => {
                    if (layer instanceof L.CircleMarker) {
                        map.removeLayer(layer);
                    }
                });
                
                // Add markers for filtered pandals
                const filteredPandals = pandalData.filter(p => p.type === type);
                filteredPandals.forEach((pandal, index) => {
                    const marker = L.circleMarker([pandal.lat, pandal.lng], {
                        radius: 8,
                        fillColor: '#FF6B35',
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);
                    
                    const displayName = currentLanguage === 'bn' ? pandal.nameBn : pandal.name;
                    marker.bindPopup(`
                        <div style="min-width: 200px;">
                            <h4>${displayName}</h4>
                            <p><strong>${index + 1}.</strong> ${pandal.type.toUpperCase()} Route Stop</p>
                            <button onclick="openGoogleMaps(${pandal.lat}, ${pandal.lng}, '${pandal.name}')" style="width: 100%; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Get Directions
                            </button>
                        </div>
                    `);
                });
                
                // Fit map to show all markers
                if (filteredPandals.length > 0) {
                    const group = new L.featureGroup(map._layers);
                    if (Object.keys(group._layers).length > 0) {
                        map.fitBounds(group.getBounds().pad(0.1));
                    }
                }
            }
        }

        function optimizeRoute() {
            if (appState.bookmarked.length < 2) {
                showToast('Please bookmark at least 2 pandals to optimize route', 'warning');
                return;
            }
            
            showToast('Optimizing your route...', 'info');
            
            setTimeout(() => {
                const route = {
                    id: Date.now(),
                    name: `Optimized Route ${new Date().toLocaleDateString()}`,
                    pandals: appState.bookmarked.slice(),
                    type: 'optimized',
                    created: new Date().toISOString()
                };
                
                appState.routes.push(route);
                appState.save();
                
                showToast('Route optimized! Check "My Routes" to view', 'success');
                awardPoints(25, 'Route optimization');
            }, 2000);
        }

        function trackRoute() {
            if (isTracking) {
                stopTracking();
                return;
            }
            
            if (!navigator.geolocation) {
                showToast('GPS tracking not supported', 'error');
                return;
            }
            
            isTracking = true;
            showToast('GPS tracking started', 'success');
            
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    generatePandalCards(); // Update distance info
                    checkNearbyPandals();
                },
                (error) => {
                    console.error('GPS tracking error:', error);
                    showToast('GPS tracking error', 'error');
                    stopTracking();
                },
                { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
            );
        }

        function stopTracking() {
            isTracking = false;
            
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            
            showToast('GPS tracking stopped', 'info');
        }

        function checkNearbyPandals() {
            if (!userLocation) return;
            
            const unvisitedPandals = pandalData.filter(p => !appState.visited.includes(p.id));
            
            unvisitedPandals.forEach(pandal => {
                const distance = calculateDistance(
                    userLocation.lat, userLocation.lng,
                    pandal.lat, pandal.lng
                );
                
                if (distance < 0.1) { // Within 100 meters
                    const displayName = currentLanguage === 'bn' ? pandal.nameBn : pandal.name;
                    showToast(`You're near ${displayName}! Mark as visited?`, 'info');
                }
            });
        }

        // Map Functions
        function initializeMap() {
            const mapContainer = document.getElementById('mapContainer');
            if (!mapContainer || map) return;
            
            try {
                mapContainer.innerHTML = '<div id="leafletMap" style="height: 100%; width: 100%;"></div>';
                
                // Initialize map centered on Kolkata
                map = L.map('leafletMap').setView([22.5726, 88.3639], 12);
                
                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18
                }).addTo(map);
                
                // Add markers for all pandals
                pandalData.forEach(pandal => {
                    const isVisited = appState.visited.includes(pandal.id);
                    const isBookmarked = appState.bookmarked.includes(pandal.id);
                    
                    let markerColor = '#FF6B35'; // Default orange
                    if (isVisited) markerColor = '#00B894'; // Green for visited
                    else if (isBookmarked) markerColor = '#E17055'; // Red for bookmarked
                    
                    const marker = L.circleMarker([pandal.lat, pandal.lng], {
                        radius: 8,
                        fillColor: markerColor,
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);
                    
                    const displayName = currentLanguage === 'bn' ? pandal.nameBn : pandal.name;
                    const displayTheme = currentLanguage === 'bn' ? pandal.themeBn : pandal.theme;
                    
                    const popupContent = `
                        <div style="min-width: 200px;">
                            <h4>${displayName}</h4>
                            <p><strong>Type:</strong> ${pandal.type}</p>
                            <p><strong>Theme:</strong> ${displayTheme}</p>
                            <div style="margin-top: 10px;">
                                <button onclick="markVisited('${pandal.id}')" style="margin-right: 5px; padding: 5px 10px; background: #00B894; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    ${isVisited ? 'Visited ✓' : 'Mark Visited'}
                                </button>
                                <button onclick="toggleBookmark('${pandal.id}')" style="padding: 5px 10px; background: #E17055; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    ${isBookmarked ? 'Bookmarked ❤️' : 'Bookmark'}
                                </button>
                            </div>
                            <div style="margin-top: 10px;">
                                <button onclick="openGoogleMaps(${pandal.lat}, ${pandal.lng}, '${pandal.name}')" style="width: 100%; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    <i class="fas fa-directions"></i> Get Google Directions
                                </button>
                            </div>
                        </div>
                    `;
                    
                    marker.bindPopup(popupContent);
                });
                
                showToast('Interactive map loaded successfully!', 'success');
            } catch (error) {
                console.error('Map initialization error:', error);
                mapContainer.innerHTML = `
                    <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border-radius: 12px; color: var(--text-secondary);">
                        <div style="text-align: center;">
                            <i class="fas fa-map" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <h3>Map Loading...</h3>
                            <p>Interactive map will appear here</p>
                        </div>
                    </div>
                `;
            }
        }

        // Weather Functions
        function showWeatherInfo() {
            const widget = document.getElementById('weatherWidget');
            widget.classList.add('show');
            updateWeatherData();
            closeSideMenu();
        }

        function hideWeatherWidget() {
            const widget = document.getElementById('weatherWidget');
            widget.classList.remove('show');
        }

        function updateWeatherData() {
            const weatherData = generateWeatherData();
            
            // Update current weather
            document.getElementById('currentTemp').textContent = `${weatherData.current.temp}°C`;
            document.getElementById('currentCondition').textContent = weatherData.current.condition[currentLanguage];
            document.getElementById('feelsLike').textContent = `${weatherData.current.feelsLike}°C`;
            document.getElementById('humidity').textContent = `${weatherData.current.humidity}%`;
            document.getElementById('windSpeed').textContent = `${weatherData.current.windSpeed} m/s`;
            document.getElementById('uvIndex').textContent = weatherData.current.uvIndex;
            
            // Update forecast
            const forecastGrid = document.getElementById('forecastGrid');
            forecastGrid.innerHTML = weatherData.forecast.map(day => `
                <div class="forecast-day">
                    <span>${day.day[currentLanguage]}</span>
                    <span>${day.icon} ${day.high}°C</span>
                </div>
            `).join('');
        }

        function generateWeatherData() {
            const conditions = [
                { en: "Sunny", bn: "রৌদ্রোজ্জ্বল" },
                { en: "Partly Cloudy", bn: "আংশিক মেঘলা" },
                { en: "Cloudy", bn: "মেঘলা" },
                { en: "Light Rain", bn: "হালকা বৃষ্টি" }
            ];
            
            const icons = ["☀️", "⛅", "☁️", "🌦️", "🌧️"];
            const days = [
                { en: "Today", bn: "আজ" },
                { en: "Tomorrow", bn: "কাল" },
                { en: "Wed", bn: "বুধ" },
                { en: "Thu", bn: "বৃহ" },
                { en: "Fri", bn: "শুক্র" }
            ];
            
            return {
                current: {
                    temp: 29,
                    condition: conditions[1],
                    feelsLike: 32,
                    humidity: 70,
                    windSpeed: 2.5,
                    uvIndex: 6
                },
                forecast: days.map((day, index) => ({
                    day: day,
                    icon: icons[index % icons.length],
                    high: 29 + Math.floor(Math.random() * 6) - 3
                }))
            };
        }

        // Calendar Functions
       function showCalendar() {
    const widget = document.getElementById('calendarWidget');
    widget.classList.add('show');
    updateCalendar();
    closeSideMenu();
}

function hideCalendarWidget() {
    const widget = document.getElementById('calendarWidget');
    widget.classList.remove('show');
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Durga Puja dates for 2025
const pujaDates2025 = {
    8: { // September
        21: 'Mahalaya',
        28: 'Sasthi', 
        29: 'Saptami', 
        30: 'Astami'
    },
    9: { // October
        1: 'Navami',
        2: 'Dashami'
    }
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function updateCurrentDateTime() {
    const now = new Date();
    const currentDateTime = document.getElementById('currentDateTime');
    if (currentDateTime) {
        currentDateTime.textContent = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function updateCalendar() {
    const monthYear = document.getElementById('monthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!calendarGrid) return;

    // Update month/year display if element exists
    if (monthYear) {
        monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Enable/disable navigation buttons if they exist
    if (prevBtn) prevBtn.disabled = (currentYear < 2020);
    if (nextBtn) nextBtn.disabled = (currentYear > 2030);

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Get previous month's last days
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const prevMonthDays = prevMonth.getDate();
    
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    let calendarHTML = '';

    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        let classes = 'calendar-day other-month';
        if (prevYear === todayYear && prevMonthIndex === todayMonth && day === todayDate) {
            classes += ' today';
        }
        
        calendarHTML += `<div class="${classes}" onclick="selectDate(${day}, ${prevMonthIndex}, ${prevYear})">${day}</div>`;
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        let classes = 'calendar-day';
        let pujaName = '';
        
        if (currentYear === todayYear && currentMonth === todayMonth && day === todayDate) {
            classes += ' today';
        }
        
        if (currentYear === 2025 && pujaDates2025[currentMonth] && pujaDates2025[currentMonth][day]) {
            classes += ' puja-day';
            pujaName = `<div class="puja-name">${pujaDates2025[currentMonth][day]}</div>`;
        }

        calendarHTML += `<div class="${classes}" onclick="selectDate(${day}, ${currentMonth}, ${currentYear})">
            ${day}
            ${pujaName}
        </div>`;
    }

    // Add next month's leading days
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
    
    for (let day = 1; day <= remainingCells; day++) {
        const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        
        let classes = 'calendar-day other-month';
        if (nextYear === todayYear && nextMonthIndex === todayMonth && day === todayDate) {
            classes += ' today';
        }
        
        calendarHTML += `<div class="${classes}" onclick="selectDate(${day}, ${nextMonthIndex}, ${nextYear})">${day}</div>`;
    }

    calendarGrid.innerHTML = calendarHTML;
    
    // Update current date/time
    updateCurrentDateTime();
}

function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    updateCalendar();
}

function selectDate(day, month, year) {
    const selectedDate = new Date(year, month, day);
    const isPujaDay = year === 2025 && pujaDates2025[month] && pujaDates2025[month][day];
    
    if (isPujaDay) {
        const pujaName = pujaDates2025[month][day];
        alert(`🎉 ${pujaName} - ${selectedDate.toDateString()}\n\nDurga Puja celebration day!`);
    } else {
        alert(`📅 Selected: ${selectedDate.toDateString()}`);
    }
}

function goToToday() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    updateCalendar();
}

// Touch/Swipe support
let startX = 0;
let startY = 0;
let isSwipeMove = false;

function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwipeMove = false;
}

function handleTouchMove(e) {
    if (!startX || !startY) return;
    
    const diffX = Math.abs(e.touches[0].clientX - startX);
    const diffY = Math.abs(e.touches[0].clientY - startY);
    
    if (diffX > diffY && diffX > 30) {
        isSwipeMove = true;
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (!isSwipeMove || !startX || !startY) return;
    
    const diffX = e.changedTouches[0].clientX - startX;
    
    if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
            changeMonth(-1); // Swipe right = previous month
        } else {
            changeMonth(1);  // Swipe left = next month
        }
    }
    
    startX = 0;
    startY = 0;
    isSwipeMove = false;
}

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add touch event listeners if calendar container exists
    const calendarContainer = document.querySelector('.calendar-container');
    if (calendarContainer) {
        calendarContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        calendarContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        calendarContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.target.closest('.calendar-widget')) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    changeMonth(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    changeMonth(1);
                    break;
                case 'Home':
                    e.preventDefault();
                    goToToday();
                    break;
            }
        }
    });

    // Navigate to September 2025 by default if current year is 2025
    if (new Date().getFullYear() === 2025) {
        currentMonth = 8; // September
        currentYear = 2025;
    }
    
    // Initialize calendar
    updateCalendar();
    
    // Update current time every minute
    setInterval(updateCurrentDateTime, 60000);
});
        // AR/VR Functions
        function showARVRFeatures() {
            openModal('arvrModal');
            closeSideMenu();
        }

        function startARExperience() {
            showToast('AR Pandal Finder would launch camera here', 'info');
            // In a real app, this would launch AR camera functionality
        }

        function startVRExperience() {
            showToast('VR Experience would start here', 'info');
            // In a real app, this would start VR experience
        }

        function openSelfieWall() {
            showToast('Selfie Wall with AR filters would open here', 'info');
            // In a real app, this would open selfie camera with AR filters
        }

        // Menu Functions
        function showBookmarks() {
            if (appState.bookmarked.length === 0) {
                showToast('No bookmarked pandals yet!', 'warning');
                closeSideMenu();
                return;
            }
            
            filterPandals('bookmarked');
            closeSideMenu();
            showSection('pandals');
            showToast(`Showing ${appState.bookmarked.length} bookmarked pandals`, 'success');
        }

        function showMyRoute() {
            openModal('routesModal');
            loadSavedRoutes();
            closeSideMenu();
        }

        function showBadges() {
            openModal('badgesModal');
            updateBadgeDisplay();
            closeSideMenu();
        }

        function shareApp() {
            const shareData = {
                title: 'Kolkata Durga Puja Guide 2025',
                text: 'Check out this amazing Durga Puja pandal hopping guide!',
                url: window.location.href
            };
            
            if (navigator.share) {
                navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(window.location.href)
                    .then(() => showToast('App link copied to clipboard!', 'success'))
                    .catch(() => showToast('Unable to share app', 'error'));
            }
            
            closeSideMenu();
        }

        function clearAllData() {
            if (confirm('Clear all app data? This cannot be undone.')) {
                localStorage.clear();
                appState = new AppState();
                generatePandalCards();
                generateFoodCards();
                updateProgress();
                updateStats();
                showToast('All data cleared successfully!', 'success');
                closeSideMenu();
            }
        }

        // Modal Functions
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }

        function closeAllModals() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = 'auto';
            hideWeatherWidget();
            hideCalendarWidget();
            closeSideMenu();
        }

        // Route Modal Functions
        function loadSavedRoutes() {
            const savedRoutes = document.getElementById('savedRoutes');
            
            if (appState.routes.length === 0) {
                savedRoutes.innerHTML = `
                    <div class="route-container">
                        <h3>Heritage Circuit Route (Default)</h3>
                        <p>Traditional pandals focusing on Bengali heritage</p>
                        <div style="margin-top: 1rem;">
                            <button class="btn" onclick="loadDefaultRoute('heritage')">
                                <i class="fas fa-play"></i>
                                Start Heritage Route
                            </button>
                            <button class="btn" onclick="createRouteFromBookmarks()">
                                <i class="fas fa-heart"></i>
                                Create from Bookmarks
                            </button>
                        </div>
                    </div>
                    <div class="route-container">
                        <h3>Community Circuit Route</h3>
                        <p>Local community celebrations and modern pandals</p>
                        <div style="margin-top: 1rem;">
                            <button class="btn" onclick="loadDefaultRoute('community')">
                                <i class="fas fa-play"></i>
                                Start Community Route
                            </button>
                        </div>
                    </div>
                    <div class="route-container">
                        <h3>Theme Based Route</h3>
                        <p>Spectacular themed pandals with grand decorations</p>
                        <div style="margin-top: 1rem;">
                            <button class="btn" onclick="loadDefaultRoute('theme')">
                                <i class="fas fa-play"></i>
                                Start Theme Route
                            </button>
                        </div>
                    </div>
                `;
            } else {
                savedRoutes.innerHTML = appState.routes.map(route => `
                    <div class="route-container">
                        <h3>${route.name}</h3>
                        <p>${route.pandals.length} pandals • ${route.type} route</p>
                        <small>Created: ${new Date(route.created).toLocaleDateString()}</small>
                        <div style="margin-top: 1rem;">
                            <button class="btn" onclick="loadRoute('${route.id}')">
                                <i class="fas fa-play"></i>
                                Start Route
                            </button>
                            <button class="btn" onclick="deleteRoute('${route.id}')">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                            <button class="btn" onclick="shareRoute('${route.id}')">
                                <i class="fas fa-share"></i>
                                Share
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        function createNewRoute() {
            if (appState.bookmarked.length < 2) {
                showToast('Please bookmark at least 2 pandals to create a route', 'warning');
                return;
            }
            
            createRouteFromBookmarks();
        }

        function createRouteFromBookmarks() {
            if (appState.bookmarked.length === 0) {
                showToast('No bookmarked pandals to create route from', 'warning');
                return;
            }
            
            const routeName = prompt('Enter route name:') || `My Route ${appState.routes.length + 1}`;
            const newRoute = {
                id: Date.now().toString(),
                name: routeName,
                pandals: [...appState.bookmarked],
                type: 'custom',
                created: new Date().toISOString()
            };
            
            appState.routes.push(newRoute);
            appState.save();
            
            showToast('New route created from bookmarked pandals!', 'success');
            awardPoints(15, 'Route creation');
            loadSavedRoutes();
        }

        function loadDefaultRoute(type) {
            const routePandals = pandalData.filter(p => p.type === type).map(p => p.id);
            const route = {
                id: Date.now().toString(),
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Route`,
                pandals: routePandals,
                type: type,
                created: new Date().toISOString()
            };
            
            appState.routes.push(route);
            appState.save();
            
            closeModal('routesModal');
            showSection('map');
            showRouteType(type);
            showToast(`${type} route loaded! GPS tracking recommended.`, 'success');
        }

        function loadRoute(routeId) {
            const route = appState.routes.find(r => r.id === routeId);
            if (route) {
                closeModal('routesModal');
                showSection('map');
                showToast(`Loading ${route.name}...`, 'success');
                
                // Show route pandals on map
                setTimeout(() => {
                    if (map) {
                        // Clear existing markers
                        map.eachLayer((layer) => {
                            if (layer instanceof L.CircleMarker) {
                                map.removeLayer(layer);
                            }
                        });
                        
                        // Add markers for route pandals
                        route.pandals.forEach((pandalId, index) => {
                            const pandal = pandalData.find(p => p.id === pandalId);
                            if (pandal) {
                                const marker = L.circleMarker([pandal.lat, pandal.lng], {
                                    radius: 10,
                                    fillColor: '#28a745',
                                    color: '#fff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                }).addTo(map);
                                
                                const displayName = currentLanguage === 'bn' ? pandal.nameBn : pandal.name;
                                marker.bindPopup(`
                                    <div style="min-width: 200px;">
                                        <h4>${displayName}</h4>
                                        <p><strong>Stop ${index + 1}</strong> of ${route.pandals.length}</p>
                                        <button onclick="openGoogleMaps(${pandal.lat}, ${pandal.lng}, '${pandal.name}')" style="width: 100%; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                            Navigate Here
                                        </button>
                                    </div>
                                `);
                            }
                        });
                    }
                    showToast('Route loaded! You can now navigate to each pandal.', 'info');
                }, 1500);
            }
        }

        function deleteRoute(routeId) {
            if (confirm('Delete this route?')) {
                appState.routes = appState.routes.filter(r => r.id !== routeId);
                appState.save();
                showToast('Route deleted', 'success');
                loadSavedRoutes();
            }
        }

        function shareRoute(routeId) {
            const route = appState.routes.find(r => r.id === routeId);
            if (route && navigator.share) {
                navigator.share({
                    title: `Durga Puja Route: ${route.name}`,
                    text: `Check out my ${route.name} with ${route.pandals.length} pandals!`,
                    url: window.location.href
                });
            } else {
                showToast('Route shared!', 'success');
            }
        }

        // Badge Functions
        function updateBadgeDisplay() {
            const userPointsEl = document.getElementById('userPoints');
            const badgeContainer = document.getElementById('badgeContainer');
            const nextBadgeEl = document.getElementById('nextBadge');
            const progressBar = document.getElementById('badgeProgressBar');
            
            if (userPointsEl) {
                const pointsText = currentLanguage === 'bn' ? `মোট পয়েন্ট: ${appState.points}` : `Total Points: ${appState.points}`;
                userPointsEl.textContent = pointsText;
            }
            
            const achievements = [
                { id: 'first-visit', name: 'First Visit', nameBn: 'প্রথম দর্শন', requirement: 1, icon: 'fas fa-star', points: 10 },
                { id: 'heritage-explorer', name: 'Heritage Explorer', nameBn: 'ঐতিহ্য অনুসন্ধানকারী', requirement: 3, icon: 'fas fa-map-marked-alt', points: 25 },
                { id: 'photo-enthusiast', name: 'Photo Enthusiast', nameBn: 'ছবি উৎসাহী', requirement: 5, icon: 'fas fa-camera', points: 50 },
                { id: 'route-master', name: 'Route Master', nameBn: 'রুট মাস্টার', requirement: 8, icon: 'fas fa-route', points: 75 },
                { id: 'cultural-ambassador', name: 'Cultural Ambassador', nameBn: 'সাংস্কৃতিক দূত', requirement: 15, icon: 'fas fa-trophy', points: 150 },
                { id: 'pandal-champion', name: 'Pandal Champion', nameBn: 'পণ্ডেল চ্যাম্পিয়ন', requirement: 31, icon: 'fas fa-crown', points: 300 }
            ];
            
            let nextUnlockedBadge = null;
            
            if (badgeContainer) {
                badgeContainer.innerHTML = achievements.map(achievement => {
                    const isUnlocked = appState.badges.includes(achievement.id) || appState.visited.length >= achievement.requirement;
                    
                    if (!isUnlocked && !nextUnlockedBadge) {
                        nextUnlockedBadge = achievement;
                    }
                    
                    const displayName = currentLanguage === 'bn' ? achievement.nameBn : achievement.name;
                    
                    return `
                        <div class="badge ${isUnlocked ? '' : 'locked'}">
                            <i class="${achievement.icon}"></i>
                            <span>${displayName}</span>
                        </div>
                    `;
                }).join('');
            }
            
            if (nextUnlockedBadge && progressBar && nextBadgeEl) {
                const progress = (appState.visited.length / nextUnlockedBadge.requirement) * 100;
                progressBar.style.width = `${Math.min(progress, 100)}%`;
                
                const nextBadgeName = currentLanguage === 'bn' ? nextUnlockedBadge.nameBn : nextUnlockedBadge.name;
                const nextBadgeText = currentLanguage === 'bn' 
                    ? `পরবর্তী ব্যাজ: ${nextBadgeName} (${nextUnlockedBadge.requirement}টি পণ্ডেল দেখুন)`
                    : `Next Badge: ${nextBadgeName} (Visit ${nextUnlockedBadge.requirement} pandals)`;
                nextBadgeEl.textContent = nextBadgeText;
            } else if (nextBadgeEl && progressBar) {
                progressBar.style.width = '100%';
                const allCompleteText = currentLanguage === 'bn' 
                    ? 'সব ব্যাজ আনলক হয়েছে! আপনি একজন পণ্ডেল চ্যাম্পিয়ন!'
                    : 'All badges unlocked! You are a Pandal Champion!';
                nextBadgeEl.textContent = allCompleteText;
            }
        }

        // Utility Functions
        function awardPoints(points, reason) {
            appState.points += points;
            appState.save();
            updateStats();
        }

        function checkAchievements() {
            const visited = appState.visited.length;
            
            const achievements = [
                { count: 1, name: 'first-visit', displayName: 'First Visit', points: 10 },
                { count: 3, name: 'heritage-explorer', displayName: 'Heritage Explorer', points: 25 },
                { count: 5, name: 'photo-enthusiast', displayName: 'Photo Enthusiast', points: 50 },
                { count: 8, name: 'route-master', displayName: 'Route Master', points: 75 },
                { count: 15, name: 'cultural-ambassador', displayName: 'Cultural Ambassador', points: 150 },
                { count: 31, name: 'pandal-champion', displayName: 'Pandal Champion', points: 300 }
            ];
            
            achievements.forEach(achievement => {
                if (visited === achievement.count && !appState.badges.includes(achievement.name)) {
                    appState.badges.push(achievement.name);
                    awardPoints(achievement.points, achievement.displayName);
                    showToast(`🏆 Achievement Unlocked: ${achievement.displayName}! +${achievement.points} points`, 'success');
                }
            });
            
            appState.save();
        }

        function updateProgress() {
            const total = pandalData.length;
            const visited = appState.visited.length;
            const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;
            
            const progressBar = document.getElementById('routeProgressBar');
            const progressText = document.getElementById('progressText');
            
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                const text = currentLanguage === 'en' 
                    ? `${visited} of ${total} pandals visited (${percentage}% Complete)`
                    : `${total}টি পণ্ডেলের মধ্যে ${visited}টি পরিদর্শিত (${percentage}% সম্পূর্ণ)`;
                progressText.innerHTML = `<span>${text}</span>`;
            }
        }

        function updateStats() {
            const visitedStat = document.getElementById('visitedStat');
            const bookmarkedStat = document.getElementById('bookmarkedStat');
            const userPointsStat = document.getElementById('userPointsStat');
            
            if (visitedStat) visitedStat.textContent = appState.visited.length;
            if (bookmarkedStat) bookmarkedStat.textContent = appState.bookmarked.length;
            if (userPointsStat) userPointsStat.textContent = appState.points;
        }

        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.className = `toast show ${type}`;
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
        }

        // Cleanup
        window.addEventListener('beforeunload', function() {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        });
      // About Me Functions
// Add these functions anywhere in your script.js file, preferably after the existing menu functions

/**
 * Opens the About Me modal or navigates directly to portfolio
 */
function openAboutMe() {
    showAboutMeModal();
    closeSideMenu(); // Close the side menu
}

/**
 * Shows the About Me modal
 */
function showAboutMeModal() {
    openModal('aboutMeModal');
    updateLanguage(); // Update language if needed
}

/**
 * Navigates to your portfolio website
 */
function visitPortfolio() {
    // Confirm before leaving the app
    const confirmLeave = confirm(
        currentLanguage === 'bn' 
            ? 'আপনি কি রোহিতের পোর্টফোলিও ওয়েবসাইটে যেতে চান? এটি একটি নতুন ট্যাবে খুলবে।'
            : 'Do you want to visit Rohit\'s portfolio website? This will open in a new tab.'
    );
    
    if (confirmLeave) {
        // Open portfolio in new tab
        window.open('https://rohitofficialwebpage.netlify.app/', '_blank');
        
        // Show toast notification
        const message = currentLanguage === 'bn' 
            ? 'পোর্টফোলিও ওয়েবসাইট নতুন ট্যাবে খোলা হচ্ছে...'
            : 'Opening portfolio website in new tab...';
        showToast(message, 'info');
        
        // Close modal if it's open
        closeModal('aboutMeModal');
    }
}

/**
 * Alternative function for direct navigation without confirmation
 * Use this if you want immediate navigation
 */
function visitPortfolioDirectly() {
    window.open('https://rohitofficialwebpage.netlify.app/', '_blank');
    const message = currentLanguage === 'bn' 
        ? 'পোর্টফোলিও দেখার জন্য ধন্যবাদ!'
        : 'Thanks for checking out the portfolio!';
    showToast(message, 'success');
    closeSideMenu();
}
// PWA Installation Code - Add this to the end of your script.js file

let deferredPrompt;
let installButton;

// Create install button
function createInstallButton() {
    installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.className = 'install-btn';
    installButton.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        z-index: 1000;
        transition: all 0.3s ease;
        display: none;
    `;
    
    installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'scale(1.05)';
    });
    
    installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'scale(1)';
    });
    
    installButton.addEventListener('click', installApp);
    document.body.appendChild(installButton);
}

// Handle the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button
    if (installButton) {
        installButton.style.display = 'block';
    }
    
    // Show toast notification
    showToast('This app can be installed on your device!', 'info');
});

// Install the app
function installApp() {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast('App installation started!', 'success');
            } else {
                showToast('App installation declined', 'info');
            }
            
            // Reset the deferred prompt variable
            deferredPrompt = null;
            
            // Hide install button
            if (installButton) {
                installButton.style.display = 'none';
            }
        });
    } else {
        // Fallback for browsers that don't support PWA installation
        showToast('Your browser doesn\'t support app installation. You can bookmark this page instead!', 'warning');
    }
}

// Handle app installation
window.addEventListener('appinstalled', (e) => {
    showToast('App successfully installed!', 'success');
    
    // Hide install button
    if (installButton) {
        installButton.style.display = 'none';
    }
    
    // Track installation analytics (optional)
    console.log('PWA was installed');
});

// Check if app is already installed
function checkIfAppInstalled() {
    // For standalone mode (app is installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is running in standalone mode');
        return true;
    }
    
    // For iOS Safari
    if (window.navigator.standalone === true) {
        console.log('App is running in iOS standalone mode');
        return true;
    }
    
    return false;
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize PWA features
function initializePWA() {
    // Create install button
    createInstallButton();
    
    // Check if app is already installed
    const isInstalled = checkIfAppInstalled();
    
    if (isInstalled) {
        // Hide install button if app is already installed
        if (installButton) {
            installButton.style.display = 'none';
        }
        
        // Add special styling for installed app
        document.body.classList.add('pwa-installed');
    }
    
    // Handle online/offline status
    handleOnlineStatus();
}

// Handle online/offline status
function handleOnlineStatus() {
    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        
        if (!isOnline) {
            showToast('You are offline. Some features may not work.', 'warning');
        } else {
            showToast('You are back online!', 'success');
        }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Add to existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Your existing initialization code...
    initializeApp();
    
    // Initialize PWA features
    initializePWA();
});

// Make functions globally available
window.installApp = installApp;
// Add these to your existing global function declarations at the very end of the file
// Find the section where you have all the "window.functionName = functionName;" declarations
// and add these three lines:

window.openAboutMe = openAboutMe;
window.showAboutMeModal = showAboutMeModal;
window.visitPortfolio = visitPortfolio;
// Add to global declarations at the end
window.openAboutMe = openAboutMe;
window.showAboutMeModal = showAboutMeModal;
window.visitPortfolio = visitPortfolio;
        // Make functions globally available
        window.showSection = showSection;
        window.toggleSideMenu = toggleSideMenu;
        window.toggleTheme = toggleTheme;
        window.toggleLanguage = toggleLanguage;
        window.filterPandals = filterPandals;
        window.filterFood = filterFood;
        window.toggleBookmark = toggleBookmark;
        window.markVisited = markVisited;
        window.openGoogleMaps = openGoogleMaps;
        window.getCurrentLocation = getCurrentLocation;
        window.showRouteType = showRouteType;
        window.optimizeRoute = optimizeRoute;
        window.trackRoute = trackRoute;
        window.showBookmarks = showBookmarks;
        window.showMyRoute = showMyRoute;
        window.showBadges = showBadges;
        window.showWeatherInfo = showWeatherInfo;
        window.hideWeatherWidget = hideWeatherWidget;
        window.showCalendar = showCalendar;
        window.hideCalendarWidget = hideCalendarWidget;
        window.showThemeArchive = showThemeArchive;
        window.showARVRFeatures = showARVRFeatures;
        window.startARExperience = startARExperience;
        window.startVRExperience = startVRExperience;
        window.openSelfieWall = openSelfieWall;
        window.shareApp = shareApp;
        window.clearAllData = clearAllData;
        window.openModal = openModal;
        window.closeModal = closeModal;
        window.createNewRoute = createNewRoute;
        window.createRouteFromBookmarks = createRouteFromBookmarks;
        window.loadDefaultRoute = loadDefaultRoute;
        window.loadRoute = loadRoute;
        window.deleteRoute = deleteRoute;
        window.shareRoute = shareRoute;
        

        
   