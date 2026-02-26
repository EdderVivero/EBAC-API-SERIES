// Menu hamburguesa
const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');
const headerNav = document.getElementById('header-nav');

// Abrir menú
menuOpen.addEventListener('click', () => {
    headerNav.classList.add('header__nav--active');
});

// Cerrar menú con el botón X
menuClose.addEventListener('click', () => {
    headerNav.classList.remove('header__nav--active');
});

// Cerrar menú al hacer clic fuera del contenedor
document.addEventListener('click', (event) => {
    const isClickInsideMenu = headerNav.contains(event.target);
    const isClickOnOpenButton = menuOpen.contains(event.target);

    if (!isClickInsideMenu && !isClickOnOpenButton && headerNav.classList.contains('header__nav--active')) {
        headerNav.classList.remove('header__nav--active');
    }
});

// API TV Maze
const dynamicContent = document.getElementById('dynamic-content');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const navSeries = document.getElementById('nav-series');
const navActors = document.getElementById('nav-actors');

// Función para mostrar cargando o limpiar
const clearContent = () => {
    dynamicContent.innerHTML = '<p style="color:white; text-align:center; width:100%;">Cargando...</p>';
};

// Función para renderizar tarjetas
const renderCards = (items, type = 'show') => {
    dynamicContent.innerHTML = '';
    
    if (items.length === 0) {
        dynamicContent.innerHTML = '<p style="color:white; text-align:center; width:100%;">No se encontraron resultados.</p>';
        return;
    }

    items.forEach(item => {
        // La API devuelve datos en diferentes estructuras
        const data = item.show ? item.show : (item.person ? item.person : item);
        const card = document.createElement('div');
        card.className = 'card-api';
        
        let image = 'https://via.placeholder.com/210x295?text=Sin+Imagen';
        if (data.image) image = data.image.medium;

        let title = data.name;
        let info = '';

        if (type === 'show' || data.summary) {
            info = data.summary ? data.summary.replace(/<[^>]*>?/gm, '') : 'Sin descripción disponible.';
        } else {
            // Es una persona (actor)
            const country = data.country ? data.country.name : 'N/A';
            const birthday = data.birthday ? data.birthday : 'N/A';
            const gender = data.gender ? data.gender : 'N/A';
            const deathday = data.deathday ? data.deathday : '';
            
            info = `Género: ${gender} <br> País: ${country} <br> Nacimiento: ${birthday}`;
            if (deathday) {
                info += `<br> Fallecimiento: ${deathday}`;
            }
        }

        card.innerHTML = `
            <img src="${image}" alt="${title}">
            <h3>${title}</h3>
            <p>${info}</p>
        `;
        dynamicContent.appendChild(card);
    });
};

// Buscar series o actores
const globalSearch = async (query) => {
    if (!query) return;
    clearContent();
    try {
        // Buscamos primero series
        const showRes = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`);
        // Buscamos personas
        const personRes = await axios.get(`https://api.tvmaze.com/search/people?q=${query}`);
        
        // Combinamos resultados (primero series, luego actores relevantes)
        const combined = [...showRes.data.slice(0, 5), ...personRes.data.slice(0, 5)];
        renderCards(combined, 'mixed');
    } catch (error) {
        console.error('Error al buscar:', error);
        dynamicContent.innerHTML = '<p style="color:white;">Error al cargar los datos.</p>';
    }
};

// Obtener lista de Series
const getTopShows = async () => {
    clearContent();
    try {
        const response = await axios.get('https://api.tvmaze.com/shows');
        const shows = response.data.slice(0, 10);
        renderCards(shows, 'show');
    } catch (error) {
        console.error('Error al cargar series:', error);
    }
};

// Obtener lista de Actores
const getTopActors = async () => {
    clearContent();
    try {
        const response = await axios.get('https://api.tvmaze.com/people');
        const actors = response.data.slice(0, 10);
        renderCards(actors, 'person');
    } catch (error) {
        console.error('Error al cargar actores:', error);
    }
};

// Eventos
searchBtn.addEventListener('click', () => globalSearch(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') globalSearch(searchInput.value);
});

navSeries.addEventListener('click', (e) => {
    e.preventDefault();
    getTopShows();
});

navActors.addEventListener('click', (e) => {
    e.preventDefault();
    getTopActors();
});

