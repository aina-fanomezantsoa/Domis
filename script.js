const cards = document.getElementById("cards");
const favoris = document.querySelector(".favoris");
const favorisBtn = document.querySelector(".favorisBtn");
const connexion = document.getElementById("connexion");
const blurElement = document.getElementById("blurElement");

favorisBtn.addEventListener("click",()=>{
    if(favoris.name === "heart"){
        favoris.name="heart-outline";
        favoris.style.color="white";
    }else{
        favoris.name="heart";
        favoris.style.color="#f14343ff";
    }
})

connexion.addEventListener("click", ()=>{
    blurElement.classList.toggle("filter");
    blurElement.classList.toggle("blur-xl");
    blurElement.classList.toggle("opacity-60");
})