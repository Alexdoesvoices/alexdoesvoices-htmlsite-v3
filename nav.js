fetch('/nav.html')
  .then(res => res.text())
  .then(text => {
    let oldelem = document.querySelector("script#navbar");
    let newelem = document.createElement("div");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem, oldelem);

    let currentPath = window.location.pathname;


    let currentPage = currentPath.split("/").pop() || "index.html";

    let navLinks = document.querySelectorAll('ul.nav a');

    navLinks.forEach(link => {
      let linkHref = link.getAttribute('href');

      // Normalize both link and current page paths
      let normalizedLink = linkHref.replace(/^\/p\//, '').replace(/^\//, '');
      let normalizedPage = currentPage.replace(/^\/p\//, '').replace(/^\//, '');

      if (normalizedLink === normalizedPage) {
        link.classList.add('nav_active');
      }
    });
  });
