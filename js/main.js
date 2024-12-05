const authButton = document.querySelector(".button-auth");
const outButton = document.querySelector(".button-out");
const userNameSpan = document.getElementById("user-name");
const modalAuth = document.querySelector(".modal-auth");
const closeAuthButton = document.querySelector(".close-auth");
const logInForm = document.getElementById("logInForm");
const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");
const buttonLogin = document.querySelector(".button-login");
const loginErrorText = document.getElementById("login-error");
const passwordErrorText = document.getElementById("password-error");
const authErrorText = document.getElementById("auth-error");

const cardsRestaurants = document.querySelector(".cards-restaurants");

function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function removeUser() {
    localStorage.removeItem("user");
}

function updateUI(user) {
    if (user) {
        userNameSpan.textContent = `Привіт, ${user.login}`;
        userNameSpan.style.display = "inline";
        authButton.style.display = "none";
        outButton.style.display = "inline-block";
    } else {
        userNameSpan.textContent = "";
        userNameSpan.style.display = "none";
        authButton.style.display = "inline-block";
        outButton.style.display = "none";
    }
}

function openAuthModal() {
    modalAuth.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeAuthModal() {
    modalAuth.style.display = "none";
    document.body.style.overflow = "";
    resetForm();
}

window.addEventListener("click", function (event) {
    if (event.target === modalAuth) {
        closeAuthModal();
    }
});

function updateButtonState() {
    const isLoginFilled = loginInput.value.trim() !== "";
    const isPasswordFilled = passwordInput.value.trim() !== "";
    loginErrorText.style.display = isLoginFilled ? "none" : "block";
    passwordErrorText.style.display = isPasswordFilled ? "none" : "block";

    buttonLogin.disabled = !(isLoginFilled && isPasswordFilled);

    authErrorText.style.display = "none";
}

function resetForm() {
    loginInput.value = "";
    passwordInput.value = "";
    loginErrorText.style.display = "none";
    passwordErrorText.style.display = "none";
    authErrorText.style.display = "none";
    buttonLogin.disabled = true;
}

logInForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (login === "test" && password === "123") {
        const user = { login };
        saveUser(user);
        updateUI(user);
        closeAuthModal();
        resetForm();
    } else {
        authErrorText.style.display = "block";
    }
});

loginInput.addEventListener("input", updateButtonState);
passwordInput.addEventListener("input", updateButtonState);

authButton.addEventListener("click", openAuthModal);

closeAuthButton.addEventListener("click", closeAuthModal);

outButton.addEventListener("click", function () {
    removeUser();
    updateUI(null);
    closeAuthModal();
    resetForm();
});

function createCardRestaurant(restaurant) {
    const { name, time_of_delivery, price, stars, kitchen, image, products } =
        restaurant;
    const card = `
    <a href="restaurant.html" class="card card-restaurant" data-products="${products}">
      <img src="${image}" alt="${name}" class="card-image" />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${time_of_delivery}</span>
        </div>
        <div class="card-info">
          <div class="rating">
            ${stars}
          </div>
          <div class="price">${price}</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
  `;
    cardsRestaurants.insertAdjacentHTML("beforeend", card);
}

function init() {
    fetch("restaurants.json")
        .then((response) => response.json())
        .then((restaurants) => {
            restaurants.forEach(createCardRestaurant);
        });

    cardsRestaurants.addEventListener("click", function (event) {
        const target = event.target.closest(".card-restaurant");
        if (!target) return;

        event.preventDefault();

        const user = getUser();
        if (!user) {
            openAuthModal();
        } else {
            localStorage.setItem(
                "restaurant",
                JSON.stringify({
                    name: target.querySelector(".card-title").textContent,
                    kitchen: target.querySelector(".category").textContent,
                    price: target.querySelector(".price").textContent,
                    stars: target.querySelector(".rating").textContent,
                    products: target.dataset.products,
                })
            );
            window.location.href = target.getAttribute("href");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const user = getUser();
    updateUI(user);
    resetForm();

    if (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname === ""
    ) {
        init();

        // Ініціалізація Swiper
        var swiper = new Swiper(".swiper", {
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            loop: true,
        });
    } else if (window.location.pathname.endsWith("restaurant.html")) {
        initRestaurantPage();
    }
});

function initRestaurantPage() {
    const restaurant = JSON.parse(localStorage.getItem("restaurant"));

    if (!restaurant) {
        window.location.href = "index.html";
        return;
    }

    const restaurantTitle = document.querySelector(".restaurant-title");
    const rating = document.querySelector(".rating");
    const price = document.querySelector(".price");
    const category = document.querySelector(".category");

    restaurantTitle.textContent = restaurant.name;
    rating.textContent = restaurant.stars;
    price.textContent = restaurant.price;
    category.textContent = restaurant.kitchen;

    fetch(restaurant.products)
        .then((response) => response.json())
        .then((products) => {
            products.forEach(createMenuItemCard);
        })
        .catch((error) => {
            console.error("Помилка завантаження меню:", error);
        });
}

function createMenuItemCard(product) {
    const { id, name, description, price, image } = product;
    const card = `
    <div class="card">
      <img src="${image}" alt="${name}" class="card-image" />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title card-title-reg">${name}</h3>
        </div>
        <!-- /.card-heading -->
        <div class="card-info">
          <div class="ingredients">${description}</div>
        </div>
        <!-- /.card-info -->
        <div class="card-buttons">
          <button class="button button-primary button-add-cart">
            <span class="button-card-text">У кошик</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price-bold">${price} &#8372;</strong>
        </div>
      </div>
      <!-- /.card-text -->
    </div>
    <!-- /.card -->
  `;
    const cardsMenu = document.querySelector(".cards-menu");
    cardsMenu.insertAdjacentHTML("beforeend", card);
}
