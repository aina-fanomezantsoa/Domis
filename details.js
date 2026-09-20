import { supabase } from './supabase.js';

async function loadDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.getElementById('detailsContainer').innerHTML = "<p>Annonce non trouvée.</p>";
        return;
    }

    const { data: annonce, error } = await supabase
        .from('annonces')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !annonce) {
        document.getElementById('detailsContainer').innerHTML = "<p>Erreur lors du chargement de l'annonce.</p>";
        return;
    }

    const container = document.getElementById('detailsContainer');
    container.innerHTML = `
        <div class="bg-white p-10 rounded-3xl shadow-lg max-w-4xl mx-auto">
            <img src="${annonce.image_url}" class="w-full h-96 object-cover rounded-2xl mb-8">
            <h1 class="text-4xl font-bold mb-4">${annonce.title}</h1>
            <p class="text-2xl font-bold text-blue-500 mb-2">Loyer: ${annonce.price} Ar</p>
            <p class="text-gray-600 text-lg mb-6">Quartier: ${annonce.location}</p>
            <div class="flex gap-6 border-t pt-6">
                <div>
                    <span class="block text-gray-500">Taille</span>
                    <span class="text-xl font-semibold">${annonce.size || 'N/A'}</span>
                </div>
                <div>
                    <span class="block text-gray-500">Salles</span>
                    <span class="text-xl font-semibold">${annonce.rooms || '0'}</span>
                </div>
            </div>
        </div>
    `;
}

loadDetails();
