const BASE_URL = "https://webdev.alphacamp.io"; // 先存 API 的網址，之後如果網址有異動，比較好修改
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || []; // 修改成去 localStorage 撈資料
const dataPanel = document.querySelector("#data-panel"); // 抓出要 Render Movie List 的地方


// render 就是把資料經過處理後，放到 html 的元素中
// 不直接將參數名設為 movies 是要降低耦合度
function renderMovieList(data) {
  let rawHTML = ""; // 負責裝解析 data 後，產生的 HTML

  // processing 處理 data 的過程
  data.forEach((item) => {
    // console.log(item)  // 先看一下每個 item 內容 -> 我們需要 title 和 image

    // 回到 index.html 抓，要 render 的內容
    // 補 data-id=${item.id}，使得按 btn 時，可以連結到知道點哪部電影
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
                  class="btn btn-danger btn-remove-favorite" 
                  data-id="${item.id}"
                >x</button>
              </div>
            </div>
          </div>
        </div>`;
  });
  // 將 rawHTML 放到 dataPanel 元素下面
  dataPanel.innerHTML = rawHTML;
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

// 宣告移除收藏電影的函式
function removeFromFavorite(id) {
  // 收藏清單是空的，就結束這個函式 -> 防止 movies 是空陣列的狀況
  if (!movies || !movies.length) return;

  // 需要索引位置，以便使用 splice 刪除資料
  // 透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  // 如果傳入的 id 在收藏清單中不存在，就結束這個函式
  if (movieIndex === -1) return;
  // return console.log(movieIndex) // 確認是否成功抓取 index

  // 刪除該筆電影
  movies.splice(movieIndex, 1);
  // 存回 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(movies));
  // 更新頁面
  renderMovieList(movies); // 要呼叫重新渲染畫面，否則需要主動重新整理，才會更新已刪除電影的畫面
}

// 綁定事件
// 帶入函式名稱，比較好 debug
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // console.log(event.target);
  // 點到的元素要含有 class='btn-show-movie' 才會運作
  if (event.target.matches(".btn-show-movie")) {
    // console.log(event.target.dataset);   // 綁了 dataset，會秀出所點擊的 object 的所有 data (會以字串呈現)
    showMovieModal(Number(event.target.dataset.id)); // 字串轉數字
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id)); // 字串轉數字
  }
});

// 呼叫清單
renderMovieList(movies);
