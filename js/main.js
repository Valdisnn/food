'use script';

// Данные
const buttonAuth = document.querySelector('.button-auth'),
  modalAuth = document.querySelector('.modal-auth'),
  closeAuth = document.querySelector('.close-auth'),
  logInForm = document.querySelector('#logInForm'),
  loginInput = document.querySelector('#login'),
  userName = document.querySelector('.user-name'),
  buttonOut = document.querySelector('.button-out'),
  passwordInput = document.querySelector('#password'),
  cardsRestaurants = document.querySelector('.cards-restaurants'),
  containerPromo = document.querySelector('.container-promo'),
  restaurants = document.querySelector('.restaurants'),
  menu = document.querySelector('.menu'),
  logo = document.querySelector('.logo'),
  cardsMenu = document.querySelector('.cards-menu'),
  cartButton = document.querySelector("#cart-button"),
  modal = document.querySelector(".modal"),
  close = document.querySelector(".close"),
  restaurantTitle = document.querySelector('.restaurant-title'),
  rating = document.querySelector('.rating'),
  minPrice = document.querySelector('.price'),
  category = document.querySelector('.category'),
  inputSearch = document.querySelector('.input-search'),
  modalBody = document.querySelector('.modal-body'),
  modalPrice = document.querySelector('.modal-pricetag'),
  clearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('gloDelivery'),
  password = localStorage.getItem('password');

const cart = JSON.parse(localStorage.getItem('savesCart')) || [];

const saveCart = () => {
  localStorage.setItem('savesCart', JSON.stringify(cart));
};



const getData = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, 
      статус ошибка ${response.status}!`)
  }
  return await response.json();
};

// Функции
const toggleModalAuth = () => {
    modalAuth.classList.toggle("is-open");
  },
  authorized = () => {

    let logOut = () => {
      login = '';
      password = '';

      localStorage.removeItem('gloDelivery');
      localStorage.removeItem('password');
      cart.length = 0;
      buttonAuth.style.display = '';
      userName.style.display = '';
      buttonOut.style.display = '';
      cartButton.style.display = '';

      buttonOut.removeEventListener('click', logOut);

      checkAuth();
    }

    console.log('Авторизован');

    userName.textContent = login;

    buttonAuth.style.display = 'none';
    userName.style.display = 'inline';
    buttonOut.style.display = 'flex';
    cartButton.style.display = 'flex';

    buttonOut.addEventListener('click', logOut);
  },
  notAuthorized = () => {
    console.log('Не авторизован');

    let logIn = (event) => {
      event.preventDefault();

      login = loginInput.value;
      password = passwordInput.value;


      if (login && password) {

        localStorage.setItem('gloDelivery', login),
          localStorage.setItem('password', password);
        toggleModalAuth();

        buttonAuth.removeEventListener('click', toggleModalAuth);
        closeAuth.removeEventListener('click', toggleModalAuth);
        logInForm.removeEventListener('submit', logIn);
        logInForm.reset();


        checkAuth();

      } else if (login.length === 0 && password.length === 0) {
        alert('Введите логин и пароль');
      } else if (login.length === 0) {
        alert('Введите логин');
      } else if (password.length === 0) {
        alert('Введите пароль');
      };

    };

    buttonAuth.addEventListener('click', toggleModalAuth);
    closeAuth.addEventListener('click', toggleModalAuth);
    logInForm.addEventListener('submit', logIn);
  },
  checkAuth = () => {
    if (login && password) {
      authorized();
    } else {
      notAuthorized();
    };
  },
  createCardRestaurants = (restaurant) => {
    const {
      image,
      kitchen,
      name,
      price,
      stars,
      products,
      time_of_delivery: timeOfDelivery
    } = restaurant;

    const card =document.createElement('a');
    card.className = 'card card-restaurant';
    card.products = products;
    card.info = [name, price, stars, kitchen]

    card.insertAdjacentHTML('beforeend', 
      `<img src="${image}" alt="image" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${timeOfDelivery} мин</span>
        </div>
        <div class="card-info">
          <div class="rating">
            ${stars}
          </div>
          <div class="price">От ${price} ₽</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>`
      );

    cardsRestaurants.insertAdjacentElement('beforeend', card);
  },
  createCardGood = (goods) => {
    const {
      id,
      name,
      description,
      price,
      image
    } = goods;

    const card = document.createElement('div');
    card.className = 'card';

    card.insertAdjacentHTML('beforeend', `
        <img src="${image}" alt="${name}" class="card-image"/>
        <div class="card-text">
          <div class="card-heading">
            <h3 class="card-title card-title-reg">${name}</h3>
          </div>
          <div class="card-info">
            <div class="ingredients">${description}
            </div>
          </div>
          <div class="card-buttons">
            <button class="button button-primary button-add-cart" id="${id}">
              <span class="button-card-text">В корзину</span>
              <span class="button-cart-svg"></span>
            </button>
            <strong class="card-price card-price-bold">${price} ₽</strong>
          </div>
        </div>
    `);

    cardsMenu.insertAdjacentElement('beforeend', card);
  },
  openGoods = (event) => {
    const target = event.target;

    const restaurant = target.closest('.card-restaurant');

    if (restaurant) {
      
      const [ name, price, stars, kitchen ] = restaurant.info;
      cardsMenu.textContent = '';
      containerPromo.classList.toggle('hide');
      restaurants.classList.toggle('hide');
      menu.classList.toggle('hide');

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₽`;
      category.textContent = kitchen;

      getData(`./db/${restaurant.products}`).then(data => {
        data.forEach(createCardGood);
      });
    }


  },
  toggleModal = () => {
    modal.classList.toggle("is-open");
  },
  addToCart = event => {
    const target = event.target;

    const buttonAddToCart = target.closest('.button-add-cart');

    if (buttonAddToCart) {
      const card = target.closest('.card'),
      title = card.querySelector('.card-title-reg').textContent,
      cost = card.querySelector('.card-price').textContent,
      id = buttonAddToCart.id,
      food = cart.find(item => {
        return item.id === id;
      });
      
      if (food) {
        food.count += 1;
      } else {
        cart.push({
          id,
          title,
          cost,
          count: 1
        });
      }; 
    };

    saveCart();
  },
  renderCart = () => {
    modalBody.textContent = '';

    cart.forEach(({ id, title, cost, count }) => {
      const itemCart = `
        <div class="food-row">
          <span class="food-name">${title}</span>
          <strong class="food-price">${cost}</strong>
          <div class="food-counter">
            <button class="counter-button counter-minus" data-id="${id}">-</button>
            <span class="counter">${count}</span>
            <button class="counter-button counter-pluse" data-id="${id}">+</button>
          </div>
        </div>
      `;

      modalBody.insertAdjacentHTML('afterbegin', itemCart);
    });

    const totalPrice = cart.reduce((result, item) => {
      return result += (parseFloat(item.cost) * item.count);
    }, 0);

    modalPrice.textContent = `${totalPrice} ₽`;

  },
  changeCount = event => {
    const target = event.target;

    if (target.classList.contains('counter-button')) {
      const food = cart.find(item => {
        return item.id === target.dataset.id;
      });

      if (target.classList.contains('counter-minus')){
        food.count --
        if (food.count === 0) {
          cart.splice(cart.indexOf(food));
        };
      };
  
      if (target.classList.contains('counter-pluse')) food.count ++;

      renderCart();
    }
    
    saveCart();

  },
  init = () => {
    getData('./db/partners.json').then(data => {
      data.forEach(createCardRestaurants);
    });

    // Обработчики событий
    cardsRestaurants.addEventListener('click', () => {
      if (login && password) {
        openGoods(event);
      } else {
        toggleModalAuth();
      };

    });

    logo.addEventListener('click', () => {
      containerPromo.classList.remove('hide');
      restaurants.classList.remove('hide');
      menu.classList.add('hide');
    });

    cartButton.addEventListener("click", () => {
      renderCart();
      toggleModal();
    });

    close.addEventListener("click", toggleModal);

    cardsMenu.addEventListener('click', addToCart);

    modalBody.addEventListener('click', changeCount);

    clearCart.addEventListener('click', () => {
      cart.length = 0;
      renderCart();
      saveCart();
    })

    // фукция поиска
    inputSearch.addEventListener('keydown', event => {

      if (event.keyCode === 13) {
        const target = event.target,
        value = target.value.toLowerCase().trim();

        target.value = '';
        if (!value || value.length < 3) {
          target.style.backgroundColor = 'tomato';
          setTimeout(() => {
            target.style.backgroundColor = '';
          }, 2000);
          return;
        };

        

        const goods = [];

        getData('./db/partners.json').then(data => {

          const products = data.map(item => {
            return item.products;
          });

          products.forEach(product => {
            getData(`./db/${product}`).then(data => {
              goods.push(...data);

              const searchGoods = goods.filter(item => {
                return item.name.toLowerCase().includes(value);
              });

              cardsMenu.textContent = '';
              containerPromo.classList.add('hide');
              restaurants.classList.add('hide');
              menu.classList.remove('hide');
        
              restaurantTitle.textContent = 'Результат поиска';
              rating.textContent = '';
              minPrice.textContent = '';
              category.textContent = `Найдено: ${searchGoods.length}`;

              return searchGoods;
   
            }).then(data => {
              data.forEach(createCardGood);
            });
          });

        });
      };
    });

    // Вызовы функций
    checkAuth();

    // Слайдер для промо
    new Swiper('.swiper-container', {
      loop: true,
      autoplay: true,

    });
  };

init();