let searchInputEl = document.getElementById("searchInput");

let searchResultsEl = document.getElementById("searchResults");

let spinnerEl = document.getElementById("spinner");

function createAndAppendSearchResult(result) {
  let { TITLE,DESCRIPTION,LINK,EDITIONLANGUAGE,ONLINESTORES,AUTHORID,
PAGES,
RATINGCOUNT,
REVIEWCOUNT,
RATING
 } = result;
// let {title,link,description}=result
  let resultItemEl = document.createElement("div");
  resultItemEl.classList.add("result-item");

  let titleEl = document.createElement("a");
  titleEl.href = LINK;
  titleEl.target = "_blank";
  titleEl.textContent = TITLE;
  titleEl.classList.add("result-title");
  resultItemEl.appendChild(titleEl);

  let titleBreakEl = document.createElement("br");
  resultItemEl.appendChild(titleBreakEl);

  let urlEl = document.createElement("a");
  urlEl.classList.add("result-url");
  urlEl.href = LINK;
  urlEl.target = "_blank";
  // urlEl.textContent = PAGES;
  urlEl.textContent = LINK;
  resultItemEl.appendChild(urlEl);

  let linkBreakEl = document.createElement("br");
  resultItemEl.appendChild(linkBreakEl);

  let descriptionEl = document.createElement("p");
  descriptionEl.classList.add("link-description");
  descriptionEl.textContent = DESCRIPTION;
  resultItemEl.appendChild(descriptionEl);

  searchResultsEl.appendChild(resultItemEl);
 
  let seconddescriptionEl = document.createElement("p");
  seconddescriptionEl.classList.add("link-description");
  seconddescriptionEl.textContent = ONLINESTORES;
  resultItemEl.appendChild(seconddescriptionEl);

   // 🟡 ADD UPDATE & DELETE BUTTONS
  let buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");
 



  // 🗑️ Delete button
  let deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () => handleDelete(AUTHORID));
  buttonsContainer.appendChild(deleteBtn);

  resultItemEl.appendChild(buttonsContainer);
  searchResultsEl.appendChild(resultItemEl);
}

function handleDelete(id) {
  const confirmDelete = confirm("Are you sure you want to delete this record?");
  if (!confirmDelete) return;

  fetch(`http://localhost:5000/api/books/${id}`, {
    method: "DELETE"
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message || "Deleted successfully");
      searchInputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); // reload results
    })
    .catch(error => console.error("Delete error:", error));
}




function displayResults(data) {
  spinnerEl.classList.add("d-none");
  // let result = data[0];
  // createAndAppendSearchResult(result);
  for (let result of data) {
    createAndAppendSearchResult(result);
  }
}

function searchWikipedia(event) {
  if (event.key === "Enter") {

    spinnerEl.classList.remove("d-none");
    searchResultsEl.textContent = "";
    

    let searchInput = searchInputEl.value;
    const API_BASE_URL = "https://search-based-project.onrender.com";
    let url = API_BASE_URL + "/api/books/search?title=" + searchInput;

    // let url = "http://localhost:5000/api/books/search?title=" + searchInput;
    
    let options = {
      method: "GET"
    };



    fetch(url, options)
  .then(response => response.json())
  .then(jsonData => {
    console.log("API Response:", jsonData);

    // jsonData is already an array
    displayResults(jsonData);
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });
    // fetch(url, options)
    //     .then((response) => response.json())
    //     .then((jsonData) => {
    //       console.log(jsonData);
    //     });
   
  }
}


searchInputEl.addEventListener("keydown", searchWikipedia);
