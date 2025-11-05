Static HTML migration of Aakrati Interior Studio

How to use
- Open any .html file directly in a browser; no build step required.
- Copy your assets into this project so paths stay identical:
  1) Copy fonts:
     - public/fonts/Brother-Home.otf → assets/fonts/Brother-Home.otf
  2) Copy images (entire tree):
     - public/images → images
     Ensure Portfolio video exists at images/Portfolio/portfoliomovie.mov (or update src in portfolio.html)
  3) Copy favicon:
     - public/favicon.ico → favicon.ico

Notes
- CSS/JS split into global site.css/site.js and page-specific files.
- Paths are relative to this folder; images are expected in ./images/...
- Blog: duplicate blogs/example-post.html per article and update content.
- Portfolio: update embedded JSON in portfolio.html to match your real projects/albums.
