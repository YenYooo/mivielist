const BASE_URL = "https://webdev.alphacamp.io"; // 先存 API 的網址，之後如果網址有異動，比較好修改
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12; // 目標每頁只顯示 12 筆資料

const movies = []; // 預計放全部電影清單的電影
let filteredMovies = []; // 存放搜尋完的結果
let currentPage = 1; // 儲存當前頁面

const dataPanel = document.querySelector("#data-panel"); // 抓出要 Render Movie List 的地方
const searchForm = document.querySelector("#search-form"); // 預計設定繳交表單的觸發事件
const searchInput = document.querySelector("#search-input"); // 預計用來取得輸入 input 的內容
const paginator = document.querySelector("#paginator");
const listModel = document.querySelector("#list-icon"); // 切換成列表模式
const cardModel = document.querySelector("#card-icon"); // 切換成卡片模式

// render 就是把資料經過處理後，放到 html 的元素中
// 不直接將參數名設為 movies 是要降低耦合度
function renderMovieList(data) {
  let rawHTML = ""; // 負責裝解析 data 後，產生的 HTML

  // processing 處理 data 的過程
  data.forEach((item) => {
    // console.log(item)  // 先看一下每個 item 內容 -> 我們需要 title 和 image

    // 回到 index.html 抓，要 render 的內容
    // 補 data-id=${item.id}，使得按 btn 時，可以連結到知道點哪部電影
    // 當 dataPanel 的 class 是 card-model 時，渲染卡片模式
    if (dataPanel.classList.contains("card-model")) {
      rawHTML += ` <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button 
                  class="btn btn-info btn-add-favorite" 
                  data-id="${item.id}"
                >+</button>
              </div>
            </div>
          </div>
        </div>`;
    } else {
      // 當 dataPanel 的 class 不是 card-model 時，渲染列表模式
      rawHTML += `
      <ul class = "list-group list-group-flush"> 
      <li class="list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto fw-bold">${item.title}</div>
        <button
                  class="btn btn-primary btn-show-movie mx-2"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button 
                  class="btn btn-info btn-add-favorite" 
                  data-id="${item.id}"
                >+</button>
      </li>
      </ul>`;
    }
  });
  // 將 rawHTML 放到 dataPanel 元素下面
  dataPanel.innerHTML = rawHTML;
}

// 宣告總頁數的函式
function renderPaginator(amount) {
  // 80 / 12 = 6 餘 8 -> 7 頁 無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  // data-page 是為了寫監聽器
  for (let page = 1; page <= numberOfPages; page++) {
    // 一開始進入網頁時，第一頁的分頁器有明顯標示
    rawHTML += `<li class="page-item ${
      page === 1 ? "active" : ""
    }"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

// 宣告各頁容納從哪部到哪部電影的函式
// page -> 相對應的電影筆數
// 這裡的 movies 有兩種： 完整的 movies 清單 / 關鍵字搜尋後的 movies 清單
function getMoviesByPage(page) {
  // page 1 -> movies 0 - 11
  // page 2 -> movies 12 - 23
  // page 3 -> movies 24 - 35
  // ...
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;

  // 如果 filteredMovies 是有東西的 (長度不是 0)，data 就放 filteredMovies，反之就放完整的 movies 清單 (80部) -> 三元運算子
  const data = filteredMovies.length ? filteredMovies : movies;

  // 回傳切割後的新陣列
  return data.slice(startIndex, endIndex);
  // return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 宣告保持當前頁面 active 樣式，並切換顯示模式的函式
function switchDisplayMode(mode) {
  if (mode === "list") {
    dataPanel.classList.remove("card-model");
  } else {
    dataPanel.classList.add("card-model");
  }

  // 維持當前頁面 active 樣式
  const prevPageActive = paginator.querySelector(".active");
  const currentPageActive = paginator.querySelector(
    '[data-page="${currentPage}"]'
  );
  if (currentPageActive) {
    currentPageActive.parentElement.classList.add("active")
    prevPageActive.classList.remove("active");
  }

  renderMovieList(getMoviesByPage(currentPage));
}

// 宣告電影內容的函式
// 要綁定的物件是要依照 id 呈現的內容: title、img、release date、description
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-data");
  const modalDescription = document.querySelector("#movie-model-description");

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      // data 放在 response.data.results 裡
      const data = response.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerText = `Release data: ` + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src="${
        POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
    })
    .catch((error) => {
      console.log(error);
    });
}

// 宣告收藏電影的函式
function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //  return movie.id === id  // movie.id 是參數 movie 傳入的 id，後面的 id 是 addToFavorite 傳進的 id
  //}
  //const movie = movies.find(isMovieIdMatched);

  // 改寫成箭頭函式
  const movie = movies.find((movie) => movie.id === id);

  // JSON.parse 會把 localStorage 的資料結構-字串，轉成 JavaScript 的原生物件，比如 object 或 array
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []; // 如果沒有收藏清單，會回傳空清單

  // 檢查加入的電影是否有重複
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已在收藏清單中");
  }

  list.push(movie);
  // console.log(list);

  // JSON.stringify() 會把 JavaScript 的資料，轉成 JSON 的字串
  // const jsonString = JSON.stringify(list);
  // console.log("json string", jsonString); // 字串
  // console.log("json object", JSON.parse(jsonString)); // object 或 array
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 綁定事件
// 帶入函式名稱，比較好 debug
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // console.log(event.target);
  // 點到的元素要含有 class='btn-show-movie' 才會運作
  if (event.target.matches(".btn-show-movie")) {
    // console.log(event.target.dataset);   // 綁了 dataset，會秀出所點擊的 object 的所有 data (會以字串呈現)
    showMovieModal(Number(event.target.dataset.id)); // 字串轉數字
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id)); // 字串轉數字
  }
});

// 監聽分頁器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  // 這裡的 A，指的是 <a>， 意思是如果不是點擊在 <a> 標籤上，就不執行此函式
  if (event.target.tagName !== "A") return;

  // console.log(event.target.dataset.page); // 確認是否可以抓到正確的頁數

  // 移除目前已選中頁面的 active 樣式
  const prevPageActive = paginator.querySelector(".active");
  if (prevPageActive) {
    prevPageActive.classList.remove("active");
  }

  // 將點擊的頁面標示為 active
  event.target.parentElement.classList.add("active");

  //透過 dataset 取得被點擊的頁數
  currentPage = Number(event.target.dataset.page); // 將當前頁數儲存到 currentPage 變數

  // 點擊後，要顯示正確頁數的電腦內容 -> 取出當前頁面重新渲染網頁
  renderMovieList(getMoviesByPage(currentPage));
});

// 監聽表單提交事件
// 按下 submit，重新 render
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  // 請瀏覽器不要執行預設動作，把控制權交給 Javascript，這裡是希望不要重新整理網頁
  event.preventDefault();
  //console.log(searchInput.value); // 可取得 input 的內容
  const keyword = searchInput.value.trim().toLowerCase(); // trim() 將輸入的值去掉頭尾的空格，toLowerCase()輸入的字母，全轉英文小寫

  // length = 0，False，加上!，就是True，如果輸入空字串，會跳出警告
  // if (!keyword.length) {
  //   return alert("Please enter a valid string");
  // }

  // 方法一：用迴圈迭代 for-of
  // 比對是否有包含關鍵字，注意 movie 名稱也要統一轉為英文小寫
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 方法二：用條件來迭代 filter
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  // 錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }

  renderPaginator(filteredMovies.length); // 更新搜尋後的分頁器 -> 重置分頁器
  renderMovieList(getMoviesByPage(1)); // 預設顯示第 1 頁的搜尋結果
});

// 列表模式
listModel.addEventListener("click", function onListIconClicked() {
  switchDisplayMode("list");
});

// 卡片模式
cardModel.addEventListener("click", function onCardIconClicked() {
  switchDisplayMode("card");
});

axios
  .get(INDEX_URL)
  .then((response) => {
    // 有 80 個元素的陣列 Array(80)
    // console.log(response.data.results);

    // 方法一：迭代器 for of
    // for (const movie of response.data.results ){
    //  movies.push(movie);
    // }
    // console.log(movies);

    // 方法二：展開運算子，使用 ...
    movies.push(...response.data.results);
    // 呼叫分頁器函式 -> 傳入電影部數 -> 得知分頁共幾頁
    renderPaginator(movies.length);
    // 將已分頁的 movies 資料投入 renderMoviesList 函數中 -> 調用函式
    // 一開始顯示第 1 頁，所以直接代入 1
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => {
    console.log(err);
  });
