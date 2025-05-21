const bookList = document.getElementById("book-container");
const bookmarkList = document.getElementById("bookmarks-list");
const bookCount = document.getElementById("book-count");
const bookmarkCount = document.getElementById("bookmark-count");
const emptyBookmarks = document.getElementById("empty-bookmarks");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const featuredSection = document.getElementById("featured-section");

let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
let allBooks = [];

loadBooks();

function loadBooks(query = "subject:fiction") {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=12`;
  
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      allBooks = data.items || [];
      displayBooks(allBooks);
      bookCount.textContent = allBooks.length;
      showBookmarks();
    })
    .catch(error => {
      console.error("Error fetching books:", error);
      bookList.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">
        <i class="fas fa-exclamation-triangle text-3xl mb-3 text-yellow-500"></i>
        <p>Failed to load books. Please try again later.</p>
      </div>`;
    });
}

function displayBooks(books) {
  bookList.innerHTML = "";
  
  if (books.length === 0) {
    bookList.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">
      <i class="fas fa-book text-3xl mb-3 text-gray-400"></i>
      <p>No books found. Try a different search.</p>
    </div>`;
    return;
  }
  
  books.forEach((book) => {
    const card = createBookCard(book);
    bookList.appendChild(card);
  });
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card rounded-lg overflow-hidden hover:shadow-lg";

  const imgContainer = document.createElement("div");
  imgContainer.className = "relative";
  
  const img = document.createElement("img");
  img.className = "book-cover";
  img.src =
    book.volumeInfo.imageLinks?.thumbnail.replace("http://", "https://") ||
    "https://via.placeholder.com/150x200?text=No+Cover";
  img.alt = book.volumeInfo.title;
  imgContainer.appendChild(img);

  const overlay = document.createElement("div");
  overlay.className = "absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300";
  imgContainer.appendChild(overlay);

  card.appendChild(imgContainer);

  const content = document.createElement("div");
  content.className = "p-4";
  
  const title = document.createElement("h3");
  title.className = "font-semibold text-gray-800 mb-1 truncate";
  title.textContent = book.volumeInfo.title || "Untitled";
  content.appendChild(title);

  const author = document.createElement("p");
  author.className = "text-sm text-gray-500 mb-3";
  author.textContent = book.volumeInfo.authors?.join(", ") || "Unknown Author";
  content.appendChild(author);

  const btn = document.createElement("button");
  btn.className = "btn-bookmark w-full py-2 px-4 rounded-md font-medium text-white";
  if (isBookmarked(book.id)) {
    btn.innerHTML = '<i class="fas fa-check mr-2"></i> Bookmarked';
    btn.disabled = true;
    btn.className += " bg-gray-400";
  } else {
    btn.innerHTML = '<i class="far fa-bookmark mr-2"></i> Bookmark';
    btn.className += " bg-emerald-600";
    btn.onclick = () => {
      addBookmark(book);
      btn.innerHTML = '<i class="fas fa-check mr-2"></i> Bookmarked';
      btn.disabled = true;
      btn.className = "btn-bookmark w-full py-2 px-4 rounded-md font-medium text-white bg-gray-400";
    };
  }
  content.appendChild(btn);

  card.appendChild(content);
  return card;
}

function addBookmark(book) {
  if (!isBookmarked(book.id)) {
    bookmarks.push(book);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    showBookmarks();
    showNotification("Book added to bookmarks!");
  }
}

function isBookmarked(id) {
  return bookmarks.some((b) => b.id === id);
}

function showBookmarks() {
  bookmarkList.innerHTML = "";
  bookmarkCount.textContent = bookmarks.length;
  
  if (bookmarks.length === 0) {
    emptyBookmarks.classList.remove("hidden");
    bookmarkList.classList.add("hidden");
  } else {
    emptyBookmarks.classList.add("hidden");
    bookmarkList.classList.remove("hidden");
    
    bookmarks.forEach((book) => {
      const card = document.createElement("div");
      card.className = "book-card rounded-lg overflow-hidden bg-white shadow";

      const img = document.createElement("img");
      img.className = "book-cover";
      img.src =
        book.volumeInfo.imageLinks?.thumbnail.replace("http://", "https://") ||
        "https://via.placeholder.com/150x200?text=No+Cover";
      img.alt = book.volumeInfo.title;
      card.appendChild(img);

      const content = document.createElement("div");
      content.className = "p-4";
      
      const title = document.createElement("h3");
      title.className = "font-semibold text-gray-800 mb-1 truncate";
      title.textContent = book.volumeInfo.title || "Untitled";
      content.appendChild(title);

      const removeBtn = document.createElement("button");
      removeBtn.className = "mt-3 text-sm text-red-500 hover:text-red-700 flex items-center";
      removeBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Remove';
      removeBtn.onclick = () => {
        bookmarks = bookmarks.filter(b => b.id !== book.id);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        showBookmarks();
        // Refresh featured books to update bookmark buttons
        displayBooks(allBooks);
      };
      content.appendChild(removeBtn);

      card.appendChild(content);
      bookmarkList.appendChild(card);
    });
  }
}

searchInput.addEventListener("input", function(e) {
  const query = e.target.value.trim();
  
  if (query.length > 2) {
    searchBooks(query);
  } else {
    searchResults.style.display = "none";
  }
});

searchInput.addEventListener("focus", function() {
  if (searchInput.value.trim().length > 2) {
    searchResults.style.display = "block";
  }
});

document.addEventListener("click", function(e) {
  if (!searchResults.contains(e.target) && e.target !== searchInput) {
    searchResults.style.display = "none";
  }
});

searchBtn.addEventListener("click", function() {
  const query = searchInput.value.trim();
  if (query) {
    featuredSection.scrollIntoView({ behavior: "smooth" });
    loadBooks(query);
    searchInput.value = "";
    searchResults.style.display = "none";
  }
});

function searchBooks(query) {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`;
  
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      const results = data.items || [];
      displaySearchResults(results);
    })
    .catch(error => {
      console.error("Search error:", error);
      searchResults.innerHTML = `<div class="p-3 text-gray-500">Error loading results</div>`;
    });
}

function displaySearchResults(results) {
  searchResults.innerHTML = "";
  
  if (results.length === 0) {
    searchResults.innerHTML = `<div class="p-3 text-gray-500">No results found</div>`;
    searchResults.style.display = "block";
    return;
  }
  
  results.forEach(book => {
    const resultItem = document.createElement("div");
    resultItem.className = "p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center";
    resultItem.onclick = () => {
      displayBooks([book]);
      featuredSection.scrollIntoView({ behavior: "smooth" });
      searchResults.style.display = "none";
      searchInput.value = "";
    };
    
    const img = document.createElement("img");
    img.src = book.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || 
             "https://via.placeholder.com/40x50?text=No+Cover";
    img.className = "w-10 h-12 object-cover mr-3";
    img.alt = book.volumeInfo.title;
    resultItem.appendChild(img);
    
    const textDiv = document.createElement("div");
    const title = document.createElement("div");
    title.className = "font-medium text-gray-800 truncate";
    title.textContent = book.volumeInfo.title || "Untitled";
    textDiv.appendChild(title);
    
    const author = document.createElement("div");
    author.className = "text-xs text-gray-500";
    author.textContent = book.volumeInfo.authors?.join(", ") || "Unknown Author";
    textDiv.appendChild(author);
    
    resultItem.appendChild(textDiv);
    searchResults.appendChild(resultItem);
  });
  
  searchResults.style.display = "block";
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center animate-fade-in";
  notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add("animate-fade-out");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}