const createAutoComplete = ({root, renderOption, onOptionSelect, inputValue, fetchData}) => {
  root.innerHTML = `
  <label><b>Search</b></label>
  <input class="input"/>
  <div class="dropdown">
    <div class="dropdown-menu">
        <div  class="dropdown-content results"></div>
    </div>
  </div>`;

  const input = root.querySelector('.input');
  const dropdown = root.querySelector('.dropdown');
  const resultsWrapper = root.querySelector('.results');

  const onInput = async (event) => {
    const searchTerm = event.target.value.trim();
    resultsWrapper.innerHTML = '';
    if (searchTerm.length != 0) {
      const items = await fetchData(event.target.value.trim());
      if (!items.length) {
        const emptyResultsInfo = document.createElement('span');
        emptyResultsInfo.innerHTML = `
      <h1>No results found matching your criteria</h1>`;
        resultsWrapper.appendChild(emptyResultsInfo);
      }
      for (let item of items) {
        const option = document.createElement('a');
        option.setAttribute('class', 'dropdown-item');
        option.innerHTML = renderOption(item);
        option.addEventListener('click', () => {
          input.value = inputValue(item);
          resultsWrapper.innerHTML = '';
          hideMenu();
          onOptionSelect(item);
        });
        resultsWrapper.appendChild(option);
      }
      if (resultsWrapper.hasChildNodes()) {
        showMenu();
      }
    } else {
      hideMenu();
    }
  }
  input.addEventListener('input', debounce(onInput, 3000));

  document.addEventListener('click', event => {
    if (!root.contains(event.target)) {
      hideMenu();
    } else {
      if (!dropdown.classList.contains('is-active') && resultsWrapper.hasChildNodes()) {
        showMenu();
      }
    }
  })

  function hideMenu() {
    dropdown.classList.remove('is-active');
  }

  function showMenu() {
    dropdown.classList.add('is-active');
  }
};
