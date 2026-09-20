import { supabase } from './supabase.js';

export async function deleteAnnonce(id, callback) {
    if (!confirm("Supprimer cette annonce ?")) return;
    const { error } = await supabase.from('annonces').delete().eq('id', id);
    if (error) {
        alert("Erreur: " + error.message);
    } else {
        if (callback) callback();
    }
}

export function openEditModal(annonce, callback) {
    // Cette fonction devra être adaptée selon où se trouve le modal
    const postModal = document.getElementById('postModal');
    const postTitle = document.getElementById('postTitle');
    const postPrice = document.getElementById('postPrice');
    const postLocation = document.getElementById('postLocation');
    const postSize = document.getElementById('postSize');
    const postRooms = document.getElementById('postRooms');
    
    // Définir une variable globale ou un état pour la modale
    window.editingAnnonceId = annonce.id;
    
    postTitle.value = annonce.title;
    postPrice.value = annonce.price;
    postLocation.value = annonce.location;
    postSize.value = annonce.size || '';
    postRooms.value = annonce.rooms || '';
    
    postModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
