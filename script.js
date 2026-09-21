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
// Modification pour utiliser l'ID 'authContainer' défini dans le HTML
const authContainer = document.getElementById('authContainer');
const profileModal = document.getElementById('profileModal');
// Suppression des variables profile supprimées du HTML

let isLoginMode = true;
let editingAnnonceId = null; // Déclaration de la variable manquante

// Fonction pour verrouiller/déverrouiller le scroll
function setScrollLock(locked) {
    document.body.style.overflow = locked ? 'hidden' : 'auto';
}

// Délégation d'événements pour le header
authContainer.addEventListener('click', (e) => {
    // Vérifier si l'utilisateur a cliqué sur le bouton ou sur l'icône/le span à l'intérieur
    const target = e.target.closest('button, a');
    if (!target) return;

    if (target.id === 'inscription') {
        isLoginMode = false;
        updateAuthUI();
        authModal.classList.remove('hidden');
        setScrollLock(true);
    } else if (target.id === 'connexion') {
        isLoginMode = true;
        updateAuthUI();
        authModal.classList.remove('hidden');
        setScrollLock(true);
    } else if (target.id === 'logoutBtn') {
        supabase.auth.signOut();
        location.reload();
    }
});

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
            <a href="profile.html" class="group flex items-center p-2 bg-gray-100 rounded-full transition-all duration-300" id="profilBtn">
                <ion-icon name="person" class="text-2xl font-bold"></ion-icon>
                <span class="hidden group-hover:block ml-2 font-bold whitespace-nowrap">Profil</span>
            </a>
            <button class="group flex items-center p-2 bg-red-400 text-white rounded-full transition-all duration-300" id="logoutBtn">
                <ion-icon name="log-out" class="text-2xl font-bold"></ion-icon>
                <span class="hidden group-hover:block ml-2 font-bold whitespace-nowrap">Déconnexion</span>
            </button>
        `;
    } else {
        authContainer.innerHTML = `
            <button class="p-2 px-6 font-bold rounded-xl" id="inscription">
                Inscription
            </button>
            <button class="p-2 px-6 bg-blue-400 text-white font-bold rounded-xl" id="connexion">
                Connexion
            </button>
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

    // Si on modifie, on n'est pas obligé de changer l'image
    let imageUrl = null;
    const file = postImage.files[0];
    
    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('annonces')
            .upload(fileName, file);

        if (uploadError) { alert("Erreur upload: " + uploadError.message); return; }
        const { data: publicUrlData } = supabase.storage.from('annonces').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
    }

    const payload = {
        user_id: user.id,
        title: postTitle.value,
        price: postPrice.value,
        location: postLocation.value,
        size: postSize.value,
        rooms: postRooms.value
    };
    if (imageUrl) payload.image_url = imageUrl;

    let dbError;
    if (editingAnnonceId) {
        const { error } = await supabase.from('annonces').update(payload).eq('id', editingAnnonceId);
        dbError = error;
    } else {
        const { error } = await supabase.from('annonces').insert(payload);
        dbError = error;
    }

    if (dbError) { alert("Erreur BD: " + dbError.message); }
    else { 
        alert(editingAnnonceId ? "Annonce mise à jour !" : "Annonce publiée !"); 
        postModal.classList.add('hidden');
        setScrollLock(false);
        // Réinitialisation
        postTitle.value = "";
        postPrice.value = "";
        postLocation.value = "";
        postSize.value = "";
        postRooms.value = "";
        postImage.value = "";
        editingAnnonceId = null;
        loadAnnonces();
    }
});

async function loadAnnonces() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
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
            
            card.className = "shadow-lg w-full flex flex-col justify-between p-7 h-96 rounded-3xl bg-center bg-cover cursor-pointer hover:scale-[1.02] transition-transform";
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

// Search
searchBar.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    if (query === "") {
        searchTab.classList.add("hidden");
        return;
    }
    
    searchTab.classList.remove("hidden");
    // On suppose que la liste des annonces est déjà chargée en mémoire ou re-fetchée
    // Pour simplifier, on filtre une version globale ou on refetch
    // Ici on filtre directement les annonces
    filterAnnonces(query);
});

async function filterAnnonces(query) {
    const { data: annonces } = await supabase.from('annonces').select('*');
    const filtered = annonces.filter(a => 
        (a.title && a.title.toLowerCase().includes(query)) || 
        (a.location && a.location.toLowerCase().includes(query)) ||
        (a.price && a.price.toString().includes(query))
    );

    const resultContainer = document.getElementById('searchTab');
    // On recrée la structure de base si nécessaire
    resultContainer.innerHTML = `
        <div class="flex justify-between items-center border-b-2 border-gray-400 pb-3">
            <h1 class="font-bold text-lg">Resultat</h1>
            <button class="text-3xl" id="closeBtn">&times;</button>
        </div>
    `;
    
    // On doit ré-attacher l'écouteur sur le nouveau bouton closeBtn
    document.getElementById('closeBtn').addEventListener("click", () => searchTab.classList.add("hidden"));
    
    filtered.slice(0, 5).forEach(a => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center p-3 mt-2 hover:bg-blue-50 rounded-lg cursor-pointer";
        div.innerHTML = `<h2 class="font-medium text-xl">${a.title} - ${a.location}</h2><ion-icon name="arrow-forward-outline"></ion-icon>`;
        div.onclick = () => window.location.href = `details.html?id=${a.id}`;
        resultContainer.appendChild(div);
    });
}

closeBtn.addEventListener("click", () => searchTab.classList.add("hidden"));

// Init
loadAnnonces();
