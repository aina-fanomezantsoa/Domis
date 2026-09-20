import { supabase } from './supabase.js';

console.log("Script chargé");

const cards = document.getElementById("cards");
const blurElement = document.getElementById("blurElement");
const searchTab = document.getElementById("searchTab");
const searchBar = document.getElementById("searchBar");
const closeBtn = document.getElementById("closeBtn");
const body = document.querySelector("body");
const authModal = document.getElementById('authModal');
const postModal = document.getElementById('postModal');
const detailsModal = document.getElementById('detailsModal');
const authBtn = document.getElementById('authBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggleAuth = document.getElementById('toggleAuth');
const authTitle = document.getElementById('authTitle');
const authContainer = document.querySelector('.flex.gap-5');
const profileModal = document.getElementById('profileModal');
const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const usernameInput = document.getElementById('username');
const addressInput = document.getElementById('address');

let isLoginMode = true;

// Fonction pour verrouiller/déverrouiller le scroll
function setScrollLock(locked) {
    document.body.style.overflow = locked ? 'hidden' : 'auto';
}

// Délégation d'événements pour le header
authContainer.addEventListener('click', (e) => {
    if (e.target.id === 'inscription') {
        isLoginMode = false;
        updateAuthUI();
        authModal.classList.remove('hidden');
        setScrollLock(true);
    } else if (e.target.id === 'connexion') {
        isLoginMode = true;
        updateAuthUI();
        authModal.classList.remove('hidden');
        setScrollLock(true);
    } else if (e.target.id === 'profilBtn') {
        profileModal.classList.remove('hidden');
        setScrollLock(true);
    } else if (e.target.id === 'logoutBtn') {
        supabase.auth.signOut();
        location.reload();
    }
});

// Ajout pour fermer le profil
document.getElementById('profileModal').querySelector('button[onclick*="hidden"]').addEventListener('click', () => setScrollLock(false));

function updateAuthUI() {
    authTitle.innerText = isLoginMode ? "Connexion" : "Inscription";
    authBtn.innerText = isLoginMode ? "Valider" : "S'inscrire";
    toggleAuth.innerText = isLoginMode ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Connexion";
}

toggleAuth.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    updateAuthUI();
});

authBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert("Erreur: " + error.message);
        else { alert("Connexion réussie !"); authModal.classList.add('hidden'); }
    } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert("Erreur: " + error.message);
        else { alert("Inscription réussie !"); authModal.classList.add('hidden'); }
    }
});

supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        authContainer.innerHTML = `
            <button class="p-2 px-6 font-bold rounded-xl" id="profilBtn">Profil</button>
            <button class="p-2 px-6 bg-red-400 text-white font-bold rounded-xl" id="logoutBtn">Déconnexion</button>
        `;
    } else {
        authContainer.innerHTML = `
            <button class="p-2 px-6 font-bold rounded-xl" id="inscription">Inscription</button>
            <button class="p-2 px-6 bg-blue-400 text-white font-bold rounded-xl" id="connexion">Connexion</button>
        `;
    }
});

// Gestion des annonces
const submitPostBtn = document.getElementById('submitPostBtn');
const postTitle = document.getElementById('postTitle');
const postPrice = document.getElementById('postPrice');
const postLocation = document.getElementById('postLocation');
const postImage = document.getElementById('postImage');

// Utiliser document.addEventListener pour s'assurer que le bouton est capturé même s'il est chargé après
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'addPostBtn') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            postModal.classList.remove('hidden');
            setScrollLock(true);
        } else {
            alert("Veuillez vous connecter pour ajouter une annonce.");
            isLoginMode = true;
            updateAuthUI();
            authModal.classList.remove('hidden');
            setScrollLock(true);
        }
    }
});

const postSize = document.getElementById('postSize');
const postRooms = document.getElementById('postRooms');

submitPostBtn.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Connectez-vous pour publier !"); return; }

    const file = postImage.files[0];
    if (!file) { alert("Veuillez choisir une image"); return; }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('annonces')
        .upload(fileName, file);

    if (uploadError) { alert("Erreur upload: " + uploadError.message); return; }

    const { data: publicUrlData } = supabase.storage.from('annonces').getPublicUrl(fileName);

    const { error: dbError } = await supabase.from('annonces').insert({
        user_id: user.id,
        title: postTitle.value,
        price: postPrice.value,
        location: postLocation.value,
        size: postSize.value,
        rooms: postRooms.value,
        image_url: publicUrlData.publicUrl
    });

    if (dbError) { alert("Erreur BD: " + dbError.message); }
    else { 
        alert("Annonce publiée !"); 
        postModal.classList.add('hidden');
        setScrollLock(false);
        // Réinitialisation des champs
        postTitle.value = "";
        postPrice.value = "";
        postLocation.value = "";
        postSize.value = "";
        postRooms.value = "";
        postImage.value = "";
        postGallery.value = "";
        loadAnnonces();
    }
});

async function loadAnnonces() {
    try {
        const { data: annonces, error } = await supabase
            .from('annonces')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error("Erreur Supabase:", error);
            if (error.code === 'PGRST116' || error.message.includes('not found')) {
                alert("La table 'annonces' n'existe pas encore. Avez-vous exécuté le script SQL dans le dashboard Supabase ?");
            } else {
                alert("Erreur lors du chargement des annonces: " + error.message);
            }
            return;
        }

        cards.innerHTML = "";
        annonces.forEach(annonce => {
            const card = document.createElement("div");
            card.className = "shadow-lg w-full lg:w-96 flex flex-col justify-between p-7 h-96 rounded-3xl bg-center bg-cover cursor-pointer hover:scale-[1.02] transition-transform";
            card.style.backgroundImage = `linear-gradient(to top, #000000, #ffffff00), url('${annonce.image_url}')`;
            card.innerHTML = `
                <div class="w-full flex justify-end text-white">
                    <div class="p-2 bg-blue-100 bg-opacity-20 flex items-center justify-center rounded-full favorisBtn">
                        <ion-icon name="heart-outline" class="text-3xl favoris"></ion-icon>
                    </div>
                </div>
                <div class="flex flex-col gap-2 text-white">
                    <h1 class="font-bold text-2xl">Loyer: ${annonce.price} Ar</h1>
                    <div class="flex justify-between">
                        <div>
                            <h2 class="font-bold">${annonce.location}</h2>
                            <h2 class="text-sm opacity-80">${annonce.title}</h2>
                        </div>
                        <div class="flex gap-4 items-center text-sm">
                            <div class="px-3 border-r border-gray-400">
                                <h1>${annonce.size || 'N/A'}</h1>
                            </div>
                            <div class="flex flex-col items-center leading-tight">
                                <h1>${annonce.rooms || '0'}</h1>
                                <h2 class="text-[10px]">Salles</h2>
                            </div>
                        </div>  
                    </div>
                </div>
            `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorisBtn')) {
                e.stopPropagation();
                const icon = e.target.closest('.favorisBtn').querySelector('ion-icon');
                icon.name = icon.name === "heart" ? "heart-outline" : "heart";
                icon.style.color = icon.name === "heart" ? "#f14343ff" : "white";
                return;
            }
            window.location.href = `details.html?id=${annonce.id}`;
        });
            cards.appendChild(card);
        });
    } catch (err) {
        console.error("Erreur critique:", err);
    }
}

// Suppression de la fonction showDetails devenue inutile

// Profil
editProfileBtn.addEventListener('click', () => {
    usernameInput.disabled = false;
    addressInput.disabled = false;
    saveProfileBtn.classList.remove('hidden');
    editProfileBtn.classList.add('hidden');
});

saveProfileBtn.addEventListener('click', async () => {
    usernameInput.disabled = true;
    addressInput.disabled = true;
    saveProfileBtn.classList.add('hidden');
    editProfileBtn.classList.remove('hidden');
    alert("Profil mis à jour !");
});

// Search
searchBar.addEventListener("input",() => searchTab.classList.remove("hidden"));
closeBtn.addEventListener("click", () => searchTab.classList.add("hidden"));

// Init
loadAnnonces();
