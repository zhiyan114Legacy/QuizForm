# QuizForm
A demo of google forms alternative.
## Access Link
* use https://form.zhiyan114.com to access to the rendered page.
* use https://form.zhiyan114.com/results.html to view everyone's result
* Backend server varies but source code is located here

## Versions

### 2.0.0
* Full backend rewrites (modifying the old backend source would take more time)
* Moved from replit to sqlite3 database (higher stability)
* Moved from express to fastify (better backend performance)
* Some changes to the REST API path (using the index path are not a good idea especially for API)
* Added WebSocket (Able to receive realtime announcement and form submitter)
* Replaced feedback with settings (able to choose if you would like to share your grade or not)
* Removed feedback rating header from results.html table (No longer needed)
* Removed sending results to email (It not being used and takes slightly more time to maintenance it)

### 1.0.0
* Inital Release

## Credits
zhiyan114 - Fullstack development of this form
### Frontend
* https://github.com/VincentGarreau/particles.js/ - Background Particle Effect
* https://fomantic-ui.com/ - Basically the fundamental of this form. Most interface are developed using fomantic ui (semantic ui's alternative).
* https://jquery.com/ - Simplified some ajax request and required by semantic ui.
### backend
* https://replit.com - Basically my IDE and backend hosting for this form
* https://expressjs.com/ - Really nice backend framework for nodejs (almost used php if I haven't remember this lol).
