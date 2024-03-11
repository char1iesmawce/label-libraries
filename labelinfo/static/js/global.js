document.addEventListener('DOMContentLoaded', () => {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      const $target = document.getElementById(target);
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

    });
  });

});

document.addEventListener('DOMContentLoaded', () => {
	let cardToggles = document.getElementsByClassName('card-toggle');
	for (let i = 0; i < cardToggles.length; i++) {
		cardToggles[i].addEventListener('click', e => {
            const target = e.currentTarget.parentElement.parentElement.childNodes[3];
			target.classList.toggle('is-hidden');
			const up = e.currentTarget.querySelector(".up-chevron")
			const down = e.currentTarget.querySelector(".down-chevron")
            up.classList.toggle("is-hidden")
            down.classList.toggle("is-hidden")
		});
	}
});

