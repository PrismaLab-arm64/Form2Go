const CACHE_NAME="form2go-cache-v2"

const ASSETS=[

"/",
"/index.html",
"/styles.css",
"/js/app.js",
"/manifest.json",
"/assets/icons/icon-192.png",
"/assets/icons/icon-512.png"

]

self.addEventListener("install",e=>{

e.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>cache.addAll(ASSETS))

)

})

self.addEventListener("fetch",e=>{

e.respondWith(

caches.match(e.request)
.then(res=>res||fetch(e.request))

)

})
