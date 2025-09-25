fetch('nav.html')
  .then(res => res.text())
  .then(text => {
    let oldelem = document.querySelector("script#navbar");
    let newelem = document.createElement("div");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem, oldelem);

    // After nav is loaded, highlight the active link
    let currentPage = window.location.pathname.split("/").pop();

    // Handle case when no page is specified (just "/")
    if (currentPage === "") {
      currentPage = "index.html"; // Assume home page
    }

    let navLinks = document.querySelectorAll('ul.nav a');

    navLinks.forEach(link => {
      let linkPage = link.getAttribute('href');
      if (linkPage === currentPage) {
        link.classList.add('nav_active');
      }
    });
  });
