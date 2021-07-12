//loader to request a set of resources and react once they've completed loading
window.onload = function () {
    const loader = document.createElement("div");
    loader.classList.add("card-wrapper");
    loader.innerHTML = `
      <div class="card-loader">
          <div class="spinner">
          <div class="spinner-item"></div>
          <div class="spinner-item"></div>
          <div class="spinner-item"></div>
          <div class="spinner-item"></div>
          </div>
          <p>Loading ....</p>
      </div>`;
    document.body.appendChild(loader);
    //timeout condition
    setTimeout(() => {
      loader.remove();
    }, 5000);
  };