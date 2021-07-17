const apiKey = "f166de09";
const autoCompleteConfig = {
  renderOption(movie) {
    const imgSRC = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `<img src=${imgSRC}/> <h1> ${movie.Title} (${movie.Year})</h1>`;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: apiKey,
        s: `${searchTerm}*`
      }
    });
    if (response.data.Error) {
      console.log('no results found');
      return [];
    }
    return response.data.Search;
  }
}

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  }
});
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  }
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, targetElement, side) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: apiKey,
      i: movie.imdbID
    }
  });
  if (response.data.Error) {
    console.log('Unable to find with given Id');
    return [];
  }
  targetElement.innerHTML = movieTemplate(response.data);
  if (side === 'left') {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }
}

const runComparison = () => {
  const leftSideStats = document.querySelectorAll('#left-summary .notification');
  const rightSideStats = document.querySelectorAll('#right-summary .notification');
  leftSideStats.forEach((element) => {
    setNewStylingWhileComparing(element, 'is-warning', 'is-primary')
  });
  rightSideStats.forEach((element) => {
    setNewStylingWhileComparing(element, 'is-warning', 'is-primary')
  });

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];
    const leftSideValue = parseFloat(leftStat.dataset.value);
    const rightSideValue = parseFloat(rightStat.dataset.value);
    if (rightSideValue > leftSideValue) {
      setNewStylingWhileComparing(leftStat, 'is-primary', 'is-warning');
    } else {
      setNewStylingWhileComparing(rightStat, 'is-primary', 'is-warning');
    }
  })
}

function setNewStylingWhileComparing(element, classToRemove, classToAdd) {
  element.classList.remove(classToRemove);
  element.classList.add(classToAdd);
}

const movieTemplate = (movieDetail) => {
  const moviePoster = movieDetail.Poster == 'N/A' ? '' : movieDetail.Poster;
  const boxOffice = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
  const metaScore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
  const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);
  return `
    <article class="media">
        <figure class="media-left">
            <p class="image"><img src=${moviePoster}></p>
        </figure>
        <figure class="media-content">
            <div class="content">
                <h1>${movieDetail.Title} (${movieDetail.Year})</h1>
                <h4>${movieDetail.Genre}</h4>
                <p>${movieDetail.Plot}</p>
            </div>
        </figure>
    </article>
    <article data-value=${awards} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>
    <article data-value=${boxOffice} class="notification is-primary">
        <p class="title">${movieDetail.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
    </article>
     <article data-value=${metaScore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
    </article>
     <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
    </article>
  `;
}

