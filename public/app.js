const searchForm = document.getElementById('search');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const searchInput = document.getElementById('search-input');
const twSection = document.getElementById('tweets');

searchForm.addEventListener('submit', e => {

  e.preventDefault();

  if (searchInput.value === '') return;

  fetch(`/search?q=${searchInput.value}`, { credentials: "same-origin" })
    .then(res => {
      if (!res.ok) throw new Error('Error in the fetch response');
      return res.text();
    })
    .then(data => {
      twSection.innerHTML += data;
    })
    .catch(err => {
      console.warn(err);
    });

})

registerForm.addEventListener('submit', e => {

  e.preventDefault();

  const userInput = document.getElementById('reg-username');
  const passInput = document.getElementById('reg-password');
  const pwdConfInput = document.getElementById('reg-passwordConfirm');
  const toast = document.querySelector('#modal-register .toast');
  const toastMsg = toast.querySelector('p');

  if (passInput.value != pwdConfInput.value) return;

  let formData = {
    username: userInput.value,
    password: passInput.value,
    passwordConfirm: pwdConfInput.value
  }

  fetch('/register', {
    method: 'POST',
    body: JSON.stringify(formData),
    credentials: "same-origin",
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {

      if (data.success) {

        console.log(toastMsg);
        console.log(toast);
        toastMsg.innerText = `Registro exitoso!`;
        toast.classList.add('toast--success');
        toast.classList.remove('u-hide');

      } else {

        toastMsg.innerText = `Ocurrió un error, revise los datos e intente nuevamente.`;
        toast.classList.add('toast--error');
        toast.classList.remove('u-hide');

      }

      setTimeout(() => {
        toast.classList.add('u-hide');
        toast.classList.remove('toast--error');
        toastMsg.innerText = '';
        window.location.href = "#";
      }, 2000)

    })
    .catch(err => {

      console.error(err);
      toastMsg.innerText = `Ocurrió un error, intente nuevamente.`;
      toast.classList.add('toast--error');
      toast.classList.remove('u-hide');

      setTimeout(() => {
        toast.classList.add('u-hide');
        toast.classList.remove('toast--error');
        toastMsg.innerText = '';
        window.location.href = "#";
      }, 2000)

    });

  userInput.value = '';
  passInput.value = '';
  pwdConfInput.value = '';

})

loginForm.addEventListener('submit', e => {

  e.preventDefault();

  const userInput = document.getElementById('login-username');
  const passInput = document.getElementById('login-password');
  const username = userInput.value;
  const password = passInput.value;
  const toast = document.querySelector('#modal-login .toast');
  const toastMsg = toast.querySelector('p');

  let formData = {
    username,
    password
  }

  fetch('/login', {
    method: 'POST',
    body: JSON.stringify(formData),
    credentials: "same-origin",
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {

      if (data.success) {

        toastMsg.innerText = `Hola, ${username}!`;
        toast.classList.add('toast--success');
        toast.classList.remove('u-hide');

      } else {

        toastMsg.innerText = `Usuario y/o contraseña incorrectos`;
        toast.classList.add('toast--error');
        toast.classList.remove('u-hide');

      }

      setTimeout(() => {
        toast.classList.add('u-hide');
        toast.classList.remove('toast--error');
        toastMsg.innerText = '';
        window.location.href = "/";
      }, 1500)

    })
    .catch(err => {

      console.error(err);
      toastMsg.innerText = `Ocurrió un error, intente nuevamente.`;
      toast.classList.add('toast--error');
      toast.classList.remove('u-hide');

      setTimeout(() => {
        toast.classList.add('u-hide');
        toast.classList.remove('toast--error');
        toastMsg.innerText = '';
        window.location.href = "#";
      }, 1500)

    });

  userInput.value = '';
  passInput.value = '';

})

function favSave(tweetId) {

  let button = event.target;
  button.disabled = true;

  fetch('/favorites/add', {
    method: 'POST',
    body: JSON.stringify({tweetId}),
    credentials: "same-origin",
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {

      if (data.success) {

        button.innerText = 'Ok!';
        button.className = 'tag tag--success tag--large';
        setTimeout(() => {
          button.remove();
        }, 2000)

      } else {

        button.innerText = 'Error :(';
        button.className = 'tag tag--error tag--large';
        console.error(data);

      }

    })
    .catch(err => {

      console.error(err);
      button.innerText = 'Error :(';
      button.className = 'tag tag--error tag--large';

    });

}

function favDelete(tweetId) {

  let button = event.target;
  button.disabled = true;

  fetch('/favorites/remove', {
    method: 'POST',
    body: JSON.stringify({tweetId}),
    credentials: "same-origin",
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {

      if (data.success) {

        button.innerText = 'Borrado!';
        button.className = 'tag tag--success tag--large';
        setTimeout(() => {
          button.parentNode.parentNode.parentNode.parentNode.remove();
        }, 2000)

      } else {

        button.innerText = 'Error :(';
        button.className = 'tag tag--error tag--large';
        console.error(data);

      }

    })
    .catch(err => {

      console.error(err);
      button.innerText = 'Error :(';
      button.className = 'tag tag--error tag--large';

    });

}



























// Hide when clicking nav-item
$('.nav-item').not('.has-sub').not('.nav-btn').on('click', function (e) {
  console.log('test');
  $('#header-menu').removeClass('active');
});

// Show dropdown when clicked
$('.nav-btn').on('click', function (e) {
  $('#header-menu').toggleClass('active');
  $('.nav-btn').toggleClass('active');
  $('#header').toggleClass('translucent');
});

// Show / Hide menu when clicked
$('.has-sub').on('click', function (e) { // Find all with ID
  $('.dropdown-menu').not($(this).children('.dropdown-menu')).removeClass('dropdown-shown'); // Hide other menus
  $('.has-sub').not($(this)).removeClass('active');
  $(this).children('.dropdown-menu').toggleClass('dropdown-shown');
  $(this).toggleClass('active');
});

$(document).on('click', function (e) { // Hide when clicking section (will modify later)
  $('.dropdown-menu').removeClass('dropdown-shown'); // Hide other menus clicking on window
  //$('.dropdown-shown').removeClass('dropdown-shown');
  $('#header-menu').removeClass('active');
  $('.nav-item').removeClass('active');
});

/* Clicks within the dropdown won't make
   it past the dropdown itself */
$("#header").click(function (e) {
  e.stopPropagation();
});

// Hide menu after clicking a menu item
$('.nav-item').not($('.has-sub')).not($('.header-btn')).on('click', function (e) {
  //$('.shown').removeClass('shown');
  $('.dropdown-menu').removeClass('dropdown-shown');
  $('.nav-btn').not($(this)).removeClass('active');
  //$(this).removeClass('active');
});

// Hide menu after clicking menu item
$('.dropdown-menu li').on('click', function (e) {
  $(this).removeClass('dropdown-shown');
  $('#header-menu').removeClass('active');
  $('.nav-btn').removeClass('active');
});

// Copy doc links
$('.doc-link').on('click', function (e) {
  e.stopPropagation();
  console.log($(this));

  // create hidden text element, if it doesn't already exist
  var targetId = "_hiddenCopyText_";
  var origSelectionStart, origSelectionEnd;
  // must use a temporary form element for the selection and copy
  target = document.getElementById(targetId);
  if (!target) {
    var target = document.createElement("textarea");
    target.style.position = "absolute";
    target.style.left = "-9999px";
    target.style.top = "0";
    target.id = targetId;
    document.body.appendChild(target);
  }
  target.textContent = $(this).context.href;
  // select the content
  var currentFocus = document.activeElement;
  target.focus();
  target.setSelectionRange(0, target.value.length);

  // copy the selection
  var succeed;
  try {
    succeed = document.execCommand("copy");
  } catch (e) {
    succeed = false;
  }
  // restore original focus
  if (currentFocus && typeof currentFocus.focus === "function") {
    currentFocus.focus();
  }
  // clear temporary content
  target.textContent = "";
  return false;
});

// Escape modal dialogs
document.addEventListener('keyup', function (e) {
  if (e.key === "Escape") {
    const modals = document.querySelectorAll('.modal-overlay');
    for (const modal of modals) {
      modal.click();
    }
  }
});