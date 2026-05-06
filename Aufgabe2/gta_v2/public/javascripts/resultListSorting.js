const ul = document.getElementById('discoveryResults');
const li = [...ul.querySelectorAll('li')];

li
    .sort((a, b) => a.textContent.localeCompare(b.textContent))
    .forEach(i => ul.appendChild(i));