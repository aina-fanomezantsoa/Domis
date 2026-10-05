# Domis

Domis est une application web de gestion d'annonces immobilières. Elle permet aux utilisateurs de consulter, rechercher et publier des annonces.

## Technologies utilisées
- **Frontend** : HTML, JavaScript (Modules)
- **CSS** : [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Base de données** : [Supabase](https://supabase.com/)
- **Icônes** : [Ionicons](https://ionic.io/ionicons)

## Installation
Ce projet ne nécessite aucune installation de dépendances via npm, car il utilise les versions CDN des bibliothèques.

1. **Cloner le projet** :
   ```bash
   git clone <URL_DU_PROJET>
   ```

2. **Exécuter le projet** :
   Comme le projet utilise des modules JavaScript (`type="module"`), vous ne pouvez pas simplement ouvrir `index.html` directement avec un navigateur (à cause des restrictions CORS sur les modules). 
   
   Vous devez utiliser un serveur de développement local :
   - **VS Code** : Utilisez l'extension **Live Server**.
   - **Node.js** : Utilisez `npx live-server` dans le répertoire du projet.

## Configuration
Le projet est configuré pour communiquer avec un projet Supabase spécifique via le fichier `supabase.js`. Les clés API sont déjà configurées.

*Note : Assurez-vous d'avoir une connexion internet pour charger les ressources (Tailwind, Supabase, Ionicons).*
