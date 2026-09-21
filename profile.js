import { supabase } from './supabase.js';
import { deleteAnnonce, openEditModal } from './annonces.js';

const myAdsContainer = document.getElementById('myAdsContainer');
const submitPostBtn = document.getElementById('submitPostBtn');
const postModal = document.getElementById('postModal');

const openEditModalBtn = document.getElementById('openEditModalBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileModal = document.getElementById('profileModal');

// ... (existing code: myAdsContainer, etc.)

// Charger les données du profil
async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        document.getElementById('profilePic').src = profile.avatar_url || '';
        const displayName = document.getElementById('displayName');
        const displayLocation = document.getElementById('displayLocation');
        const displayPhone = document.getElementById('displayPhone');
        const displayBirth = document.getElementById('displayBirth');
        const displayEmail = document.getElementById('displayEmail');
        const regDate = document.getElementById('regDate');

        if (displayName) displayName.textContent = profile.full_name || 'Non défini';
        if (displayLocation) displayLocation.textContent = profile.address || 'Non défini';
        if (displayPhone) displayPhone.textContent = profile.phone || 'Non défini';
        if (displayBirth) displayBirth.textContent = profile.birth_date || 'Non défini';
        if (displayEmail) displayEmail.textContent = user.email;
        if (regDate) regDate.textContent = new Date(user.created_at).toLocaleDateString();
    }
}

// Ouvrir le modal
if (openEditModalBtn) {
    openEditModalBtn.addEventListener('click', () => {
        if (profileModal) profileModal.classList.remove('hidden');
    });
}

// Sauvegarder profil
saveProfileBtn.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const avatarFile = document.getElementById('editAvatar').files[0];
    let avatar_url = document.getElementById('profilePic').src;

    if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true });

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatar_url = publicUrl;
        }
    }

    const payload = {
        full_name: document.getElementById('editName').value,
        address: document.getElementById('editLocation').value,
        phone: document.getElementById('editPhone').value,
        birth_date: document.getElementById('editBirth').value,
        avatar_url: avatar_url
    };

    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...payload });
    if (error) alert("Erreur: " + error.message);
    else {
        alert("Profil mis à jour !");
        profileModal.classList.add('hidden');
        loadProfile();
    }
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
if (typeof submitPostBtn !== 'undefined' && submitPostBtn) {
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
}

loadData();
loadProfile();
