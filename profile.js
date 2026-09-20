import { supabase } from './supabase.js';
import { deleteAnnonce, openEditModal } from './annonces.js';

const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const usernameInput = document.getElementById('username');
const addressInput = document.getElementById('address');
const myAdsContainer = document.getElementById('myAdsContainer');
const submitPostBtn = document.getElementById('submitPostBtn');
const postModal = document.getElementById('postModal');

// Profile Logic
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

// Load Profile and Ads
async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load Ads
    const { data: annonces, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('user_id', user.id);
        
    if (error) { console.error(error); return; }
    
    myAdsContainer.innerHTML = annonces.map(a => `
        <div class="flex items-center justify-between p-4 border rounded-xl">
            <div class="flex gap-4 items-center">
                <img src="${a.image_url}" class="w-16 h-16 object-cover rounded-lg">
                <div>
                    <h3 class="font-bold">${a.title}</h3>
                    <p class="text-sm text-gray-500">${a.price} Ar - ${a.location}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="p-2 text-blue-500 editBtn" data-id='${JSON.stringify(a)}'>
                    <ion-icon name="create" class="text-xl font-bold"></ion-icon>
                </button>
                <button class="p-2 text-red-500 deleteBtn" data-id="${a.id}">
                    <ion-icon name="trash" class="text-xl font-bold"></ion-icon>
                </button>
            </div>
        </div>
    `).join('');

    // Attach listeners
    myAdsContainer.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', () => deleteAnnonce(btn.dataset.id, loadData));
    });
    myAdsContainer.querySelectorAll('.editBtn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(JSON.parse(btn.dataset.id), () => {}));
    });
}

// Global update logic (reused from script.js logic)
submitPostBtn.addEventListener('click', async () => {
    const postTitle = document.getElementById('postTitle');
    const postPrice = document.getElementById('postPrice');
    const postLocation = document.getElementById('postLocation');
    const postSize = document.getElementById('postSize');
    const postRooms = document.getElementById('postRooms');
    const postImage = document.getElementById('postImage');

    const payload = {
        title: postTitle.value,
        price: postPrice.value,
        location: postLocation.value,
        size: postSize.value,
        rooms: postRooms.value
    };

    const { error } = await supabase.from('annonces').update(payload).eq('id', window.editingAnnonceId);
    if (error) alert("Erreur: " + error.message);
    else {
        alert("Annonce mise à jour !");
        postModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        loadData();
    }
});

loadData();
