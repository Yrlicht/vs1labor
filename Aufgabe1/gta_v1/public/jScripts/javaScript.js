(function() {
    const dark_red = 'body-red-dark-district';
    const light_red = 'body-red-light-district';
    const light_green = 'body-green-light-district';
    const body = document.body;
    const themeOverlay = document.getElementById('themeOverlay');
    const openThemeBtn = document.getElementById('openThemeBtn');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const themeCards = document.querySelectorAll('.theme-card');

    function setTheme(theme) {
        body.classList.remove(dark_red, light_red, light_green)

        if(theme === 'dark-red') {
            body.classList.add(dark_red);
            localStorage.setItem('district', 'dark-red');
        } else if(theme === 'light-red') {
            body.classList.add(light_red);
            localStorage.setItem('district', 'light-red');
        } else if(theme === 'light-green') {
            body.classList.add(light_green);
            localStorage.setItem('district', 'light-green');
        }

        updateSelectedCardUI(theme);
    }

    function updateSelectedCardUI(activeTheme) {
        themeCards.forEach(card => {
            const theme = card.getAttribute('theme-data');
            
            if(theme === activeTheme) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    function getCurrentTheme() {
        if(body.classList.contains(dark_red)) return 'dark-red';
        if(body.classList.contains(light_red)) return 'light-red';
        if(body.classList.contains(light_green)) return 'light-green';
        return 'light-red';
    }

    function openOverlay() {
        const current = getCurrentTheme();
        updateSelectedCardUI(current);
        themeOverlay.classList.add('active');
    }

    function closeOverlay() {
        themeOverlay.classList.remove('active');
    }

    openThemeBtn.addEventListener('click', openOverlay);
    closeOverlayBtn.addEventListener('click', closeOverlay);
    themeOverlay.addEventListener('click', (e) => {
        if(e.target === themeOverlay) {
            closeOverlay();
        }
    });

    themeCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const theme = card.getAttribute('theme-data');

            setTheme(theme);

            console.log('Theme changed to: ' + theme);
        });
    });

    const savedTheme = localStorage.getItem('district');

    if(savedTheme === 'light-red') {
        setTheme('light-red');
    } else if(savedTheme === 'dark-red') {
        setTheme('dark-red');
    } else if(savedTheme === 'light-green') {
        setTheme('light-green');
    } else {
        // Default
        setTheme('light-red');
    }

    updateSelectedCardUI(getCurrentTheme());
    
    const observer = new MutationObserver(() => {
        const current = getCurrentTheme();
        updateSelectedCardUI(current);
    });
    
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
})();
