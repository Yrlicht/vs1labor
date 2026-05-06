const themeOptions = document.getElementById('themeOptions');
const options = [...themeOptions.children];

options
    .sort((a, b) => {
        const aText = a.querySelector('h3').textContent;
        const bText = b.querySelector('h3').textContent;
        return aText.localeCompare(bText);
    })
    .forEach(i => themeOptions.appendChild(i));