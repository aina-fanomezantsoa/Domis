const cards = document.getElementById("cards");
const favoris = document.querySelector(".favoris");
const favorisBtn = document.querySelector(".favorisBtn");
const connexion = document.getElementById("connexion");
const blurElement = document.getElementById("blurElement");
const searchTab = document.getElementById("searchTab");
const searchBar = document.getElementById("searchBar");
const closeBtn = document.getElementById("closeBtn");
const body = document.querySelector("body");
// const result = document.getElementById("result");

body.addEventListener("click", ()=>{
    searchTab.classList.add("hidden");
})

favorisBtn.addEventListener("click",()=>{
    if(favoris.name === "heart"){
        favoris.name="heart-outline";
        favoris.style.color="white";
    }else{
        favoris.name="heart";
        favoris.style.color="#f14343ff";
    }
});

connexion.addEventListener("click", ()=>{
    blurElement.classList.toggle("filter");
    blurElement.classList.toggle("blur-xl");
    blurElement.classList.toggle("opacity-60");
});

searchBar.addEventListener("input",()=>{
    searchTab.classList.remove("hidden");
    console.log(searchBar.value);
    
});

// result.addEventListener("click", ()=>{
//     console.log("resultat");
// })


closeBtn.addEventListener("click", ()=>{
    searchTab.classList.add("hidden");
})