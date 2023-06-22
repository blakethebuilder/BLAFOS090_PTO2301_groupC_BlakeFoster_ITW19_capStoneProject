import { BOOKS_PER_PAGE, authors, genres, books } from "./data.js";

// Header
const header = {
  searchButton: document.querySelector("[data-header-search]"),
  settingsButton: document.querySelector("[data-header-settings]"),
};

// Data List
const dataList = {
  items: document.querySelector("[data-list-items]"),
  message: document.querySelector("[data-list-message]"),
  button: document.querySelector("[data-list-button]"),
  active: document.querySelector("[data-list-active]"),
  blur: document.querySelector("[data-list-blur]"),
  image: document.querySelector("[data-list-image]"),
  title: document.querySelector("[data-list-title]"),
  subtitle: document.querySelector("[data-list-subtitle]"),
  description: document.querySelector("[data-list-description]"),
  close: document.querySelector("[data-list-close]"),
};

// Search
const search = {
  overlay: document.querySelector("[data-search-overlay]"),
  form: document.querySelector("[data-search-form]"),
  title: document.querySelector("[data-search-title]"),
  genres: document.querySelector("[data-search-genres]"),
  authors: document.querySelector("[data-search-authors]"),
  cancelButton: document.querySelector("[data-search-cancel]"),
};

// Settings
const settings = {
  overlay: document.querySelector("[data-settings-overlay]"),
  form: document.querySelector("[data-settings-form]"),
  theme: document.querySelector("[data-settings-theme]"),
  cancel: document.querySelector("[data-settings-cancel]"),
};

// Other Constants
let matches = books;
let page = 1;

// Theme
const themeOptions = {
  day: ["255, 255, 255", "10, 10, 20"],
  night: ["10, 10, 20", "255, 255, 255"],
};

function applyTheme() {
  const formSubmit = new FormData(settings.form);
  const option = Object.fromEntries(formSubmit);

  document.documentElement.style.setProperty(
    "--color-light",
    themeOptions[option.theme][0]
  );
  document.documentElement.style.setProperty(
    "--color-dark",
    themeOptions[option.theme][1]
  );
}

settings.form.addEventListener("submit", (event) => {
  event.preventDefault();
  applyTheme();
  settings.overlay.close();
});

settings.cancel.addEventListener("click", () => {
  settings.overlay.close();
});

header.settingsButton.addEventListener("click", () => {
  settings.theme.focus();
  settings.overlay.showModal();
});

// Pull books data
function createPreviewElement(book) {
  const { author: authorId, id, image, title } = book;

  const extractedBook = document.createElement("button");
  extractedBook.classList = "preview";
  extractedBook.setAttribute("data-preview", id);

  extractedBook.innerHTML = /* html */ `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[authorId]}</div>
    </div>
  `;

  return extractedBook;
}

function populateDataList() {
  const fragment = document.createDocumentFragment();
  const extracted = books.slice(0, 36);

  for (let i = 0; i < extracted.length; i++) {
    const extractedBook = createPreviewElement(extracted[i]);
    fragment.appendChild(extractedBook);
  }

  dataList.items.appendChild(fragment);
}

// List of Genres
function populateGenreOptions() {
  const genreFragment = document.createDocumentFragment();
  const allGenresOption = document.createElement("option");
  allGenresOption.value = "any";
  allGenresOption.textContent = "All Genres";
  genreFragment.appendChild(allGenresOption);

  const genreArray = Object.entries(genres);
  for (let i = 0; i < genreArray.length; i++) {
    const [id, name] = genreArray[i];
    const genreOption = document.createElement("option");
    genreOption.value = id;
    genreOption.textContent = name;
    genreFragment.appendChild(genreOption);
  }

  search.genres.appendChild(genreFragment);
}

// List of Authors
function populateAuthorOptions() {
  const authorFragment = document.createDocumentFragment();
  const allAuthorsOption = document.createElement("option");
  allAuthorsOption.value = "any";
  allAuthorsOption.textContent = "All Authors";
  authorFragment.appendChild(allAuthorsOption);

  const authorArray = Object.entries(authors);
  for (let i = 0; i < authorArray.length; i++) {
    const [id, name] = authorArray[i];
    const authorOption = document.createElement("option");
    authorOption.value = id;
    authorOption.textContent = name;
    authorFragment.appendChild(authorOption);
  }

  search.authors.appendChild(authorFragment);
}

// Event Listeners

dataList.close.addEventListener("click", () => {
  dataList.active.close();
});

function openDataListPreview(event) {
  const pathArray = Array.from(event.path || event.composedPath());
  let active = null;

  for (let node of pathArray) {
    if (active) {
      break;
    }
    const previewId = node?.dataset?.preview;

    for (const singleBook of books) {
      if (singleBook.id === previewId) {
        active = singleBook;
        break;
      }
    }
  }

  if (!active) {
    return;
  }

  dataList.active.open = true;
  dataList.blur.src = active.image;
  dataList.image.src = active.image;
  dataList.title.textContent = active.title;
  dataList.subtitle.textContent = `${authors[active.author]} (${new Date(
    active.published
  ).getFullYear()})`;
  dataList.description.textContent = active.description;
}

function closeDataListPreview() {
  dataList.active.open = false;
}

dataList.button.innerHTML = /* html */ `
  <span>Show more</span>
  <span class="list__remaining">
    (${
      matches.length - page * BOOKS_PER_PAGE > 0
        ? matches.length - page * BOOKS_PER_PAGE
        : 0
    })
  </span>`;

dataList.button.addEventListener("click", () => {
  const startIndex = page * BOOKS_PER_PAGE;
  const endIndex = (page + 1) * BOOKS_PER_PAGE;
  const extracted = books.slice(startIndex, endIndex);

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < extracted.length; i++) {
    const extractedBook = createPreviewElement(extracted[i]);
    fragment.appendChild(extractedBook);
  }

  dataList.items.appendChild(fragment);

  page++;

  dataList.button.innerHTML = /* html */ `
    <span>Show more</span>
    <span class="list__remaining">
      (${
        matches.length - page * BOOKS_PER_PAGE > 0
          ? matches.length - page * BOOKS_PER_PAGE
          : 0
      })
    </span>`;
});

// Search button click event handler
header.searchButton.addEventListener("click", () => {
  // Focus on the search input field
  search.title.focus();
  // Show the search overlay
  search.overlay.showModal();
});

// Search form submit event handler
search.form.addEventListener("submit", (event) => {
  event.preventDefault();

  // Get the search term from the input field
  const searchTerm = search.title.value.toLowerCase().trim();

  // Get the selected genre from the dropdown
  const selectedGenre = search.genres.value;

  // Get the selected author from the dropdown
  const selectedAuthor = search.authors.value;

  // Perform the search operation based on the search term, genre, and author
  const searchResults = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const bookTitle = book.title.toLowerCase();

    const matchesTitle = bookTitle.includes(searchTerm);
    const matchesAuthor =
      selectedAuthor === "any" || bookAuthor.includes(selectedAuthor);
    const matchesGenre = selectedGenre === "any" || bookGenre === selectedGenre;

    if (matchesTitle && matchesAuthor && matchesGenre) {
      searchResults.push(book);
    }
  }

  // Display the search results
  displaySearchResults(searchResults);
});

function filterBooks() {
  const searchInput = search.title.value.toLowerCase();
  const selectedGenre = search.genres.value;

  const filteredBooks = books.filter((book) => {
    const titleMatches = book.title.toLowerCase().includes(searchInput);
    const authorMatches = authors[book.author]
      .toLowerCase()
      .includes(searchInput);
    const genreMatches =
      selectedGenre === "any" || genres[book.genres] === selectedGenre;

    return titleMatches || authorMatches || genreMatches;
  });

  displayBooks(filteredBooks);
}

// Function to display search results
function displaySearchResults(results) {
  // Clear the existing search results
  dataList.items.innerHTML = "";

  // Create a fragment to hold the search result elements
  const fragment = document.createDocumentFragment();

  // Loop through the search results and create the preview elements
  for (const book of results) {
    const extractedBook = createPreviewElement(book);
    fragment.appendChild(extractedBook);
  }

  // Append the search result elements to the DOM
  dataList.items.appendChild(fragment);

  // Hide the search overlay
  search.overlay.close();
}

search.cancelButton.addEventListener("click", () => {
  search.overlay.close();
});

// help me!

dataList.button.addEventListener("click", closeDataListPreview);

dataList.items.addEventListener("click", openDataListPreview);

// Initialize the page
populateDataList();
populateGenreOptions();
populateAuthorOptions();
