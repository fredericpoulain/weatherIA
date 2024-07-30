<?php

namespace App\Controller;


use App\Entity\FavoriteCities;
use App\Repository\FavoriteCitiesRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FavoritesWeatherIAController extends AbstractController
{

    #[Route('/favoris', name: 'app_favorites')]
    public function favoris(): Response
    {
         if (!$this->getUser()) {
             return $this->redirectToRoute('app_home');
         }
        return $this->render('favorites/favorites.html.twig');
    }

    #[Route('/isFavorite', name: 'app_isFavorite')]
    public function isFavorite(
        Request                  $request,
        FavoriteCitiesRepository $favoriteCitiesRepository
    ): \Symfony\Component\HttpFoundation\JsonResponse
    {
        if ($request->isMethod('POST')) {
            $user = $this->getUser();
            if ($user === null) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non connecté',
                ]);
            }
            try {
//                $dataRequest = $request->getContent();
                $data = json_decode($request->getContent());
                $dataRequest = $data->key1;
                if (!isset($dataRequest->cityName, $dataRequest->latitude, $dataRequest->longitude)) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Données reçues incorrecte',
                    ]);
                }


                //ICI il faudrait récupérer le cityID si la ville existe
                $city = $this->isExist($dataRequest, $favoriteCitiesRepository, $user);
                if ($city){
                    $exist = true;
                    $cityID = $city->getID();
                }else{
                    $exist = false;
                }
                $data = [
                    'exist' => $exist,
                    'cityID' => $cityID??''
                ];

                return $this->json([
                    'success' => true,
                    //par défaut "$this->isExist..." renvoi un objet ou false
                    'data' => $data
                ]);
            } catch (\Exception $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Une erreur s\'est produite',
                ]);
            }
        }
        return $this->json([
            'success' => false,
            'message' => 'Requête invalide',
        ]);

    }

    private function isExist($dataRequest, $favoriteCitiesRepository, $user)
    {

        $cityName = $dataRequest->cityName;
        $latitudeToCheck = round($dataRequest->latitude);
        $longitudeToCheck = round($dataRequest->longitude);

        $cities = $favoriteCitiesRepository->findBy(['name' => $cityName, 'user' => $user]);

        foreach ($cities as $city) {
            // Arrondi les coordonnées de la ville à deux chiffres après la virgule
            $cityLatitude = round($city->getLatitude());
            $cityLongitude = round($city->getLongitude());
            // Compare les coordonnées
            if ($cityLatitude === $latitudeToCheck && $cityLongitude === $longitudeToCheck) {
                // La ville existe déjà dans les favoris de l'utilisateur
                return $city;
            }
        }
        return false;
    }

    #[Route('/addFavorites', name: 'app_addFavorites')]
    public function addFavorites(
        Request                  $request,
        FavoriteCitiesRepository $favoriteCitiesRepository,
        EntityManagerInterface   $entityManager
    ): \Symfony\Component\HttpFoundation\JsonResponse
    {
        if ($request->isMethod('POST')) {
            $user = $this->getUser();
            if ($user === null) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non connecté',
                ]);
            }
            try {
                $data = $request->getContent();
                $data = json_decode($data);
                $dataRequest = $data->key1;
                if (!isset($dataRequest->cityName, $dataRequest->latitude, $dataRequest->longitude)) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Données reçues incorrecte',
                    ]);
                }
                //Normalement si le bouton favoris affiche "+" c'est que la ville n'est pas encore enregistrée en bdd.
                // J'ajoute tout de même une sécurité supplémentaire.
                if ($this->isExist($dataRequest, $favoriteCitiesRepository, $user)) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Ville déjà existante dans vos favoris',
                    ]);
                }

                $cityName = $dataRequest->cityName;
                $countryName = $dataRequest->countryName;
                $stateName = $dataRequest->stateName;
                $latitude = $dataRequest->latitude;
                $longitude = $dataRequest->longitude;
                $timezoneName = $dataRequest->timezoneName;

                $city = new FavoriteCities();
                $city->setName($cityName);
                $city->setCountry($countryName);
                $city->setState($stateName);
                $city->setLatitude($latitude);
                $city->setLongitude($longitude);
                $city->setTimezoneName($timezoneName);
                $city->setUser($user);
                // on compte le nombre de villes favorites pour cet utilisateur
                $count = $favoriteCitiesRepository->count(['user' => $user]);
                //la ville sera par défaut le dernier de la liste de ces villes favorites
                $city->setSort($count + 1);

                $entityManager->persist($city);
                $entityManager->flush();
                //ici récupère l'id de la dernière ville enregistrée en favoris par le user
                return $this->json([
                    'success' => true,
                    'message' => 'Ville ajoutée aux favoris',
                    'cityID' => $city->getId()
                ]);
            } catch (\Exception $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Une erreur s\'est produite lors de la mise à jour des favoris'
                ]);
            }
        }
        return $this->json([
            'success' => false,
            'message' => 'Requête POST invalide',
        ]);

    }

    #[Route('/deleteFavorites', name: 'app_deleteFavorites')]
    public function deleteFavorites(
        Request                  $request,
        FavoriteCitiesRepository $favoriteCitiesRepository,
        EntityManagerInterface   $entityManager
    ): \Symfony\Component\HttpFoundation\JsonResponse
    {
        if ($request->isMethod('POST')) {
            $user = $this->getUser();
            if ($user === null) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non connecté',
                ]);
            }
            try {
                $dataRequest = $request->getContent();
                $dataRequest = json_decode($dataRequest);
                if (!isset($dataRequest->key1->cityID) ||
                    !filter_var($dataRequest->key1->cityID, FILTER_VALIDATE_INT)) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Données reçues incorrecte',
                    ]);
                }
                //On s'assure que la ville à supprimer exist et appartient bien à l'User
                $cityToRemove = $favoriteCitiesRepository->findOneBy([
                    'id' => $dataRequest->key1->cityID,
                    'user' =>$user
                ]);

                if (!$cityToRemove) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Ville non présente dans vos favoris',
                    ]);
                }

                $sortToRemove = $cityToRemove->getSort();

                // Récupérez toutes les villes favorites de l'utilisateur qui ont une valeur "sort"
                // supérieure à celle de la ville à supprimer
                $citiesToUpdate = $favoriteCitiesRepository->getCitiesBySort($user, $sortToRemove);
//                // Décrémentez la valeur de "sort" pour chaque ville à mettre à jour
                foreach ($citiesToUpdate as $city) {
                    $city->setSort($city->getSort() - 1);
                }

//                // Supprimez la ville favorite
                $entityManager->remove($cityToRemove);
                $entityManager->flush();
//
                return $this->json([
                    'success' => true,
                    'message' => 'Ville supprimée des favoris'
                ]);
            } catch (\Exception $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Une erreur s\'est produite lors de la suppression de la ville'
                ]);
            }
        }
        return $this->json([
            'success' => false,
            'message' => 'Requête POST invalide',
        ]);

    }
    #[Route('/getFavorites', name: 'app_getFavorites')]
    public function getFavorites(
        Request                  $request,
        FavoriteCitiesRepository $favoriteCitiesRepository,
        EntityManagerInterface   $entityManager
    ): \Symfony\Component\HttpFoundation\JsonResponse
    {
        $user = $this->getUser();
        if ($user === null) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non connecté',
            ]);
        }
        $favoriteCitiesObjects = $favoriteCitiesRepository->findBy(
            ['user' => $user], // Critères
            ['sort' => 'ASC'] // Options de tri
        );

        $cities = [];
        foreach ($favoriteCitiesObjects as $cityObject) {
            $cities[] = [
                'cityID' => $cityObject->getId(),
                'cityName' => $cityObject->getName(),
                'countryName' => $cityObject->getCountry(),
                'stateName' => $cityObject->getState(),
                'latitude' => $cityObject->getLatitude(),
                'longitude' => $cityObject->getLongitude(),
                'timezoneName' => $cityObject->getTimezoneName(),
                'sort' => $cityObject->getSort()
            ];
        }
        return $this->json([
            'success' => true,
            'message' => 'getFavorites successfully',
            'data' => $cities
        ]);
    }
    #[Route('/getCityBdd', name: 'app_getCityBdd')]
    public function getCityBdd(
        Request                  $request,
        FavoriteCitiesRepository $favoriteCitiesRepository,
        EntityManagerInterface   $entityManager
    ): \Symfony\Component\HttpFoundation\JsonResponse
    {

        if ($request->isMethod('POST')) {
            $user = $this->getUser();
            if ($user === null) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non connecté',
                ]);
            }
            try {
                $dataRequest = $request->getContent();
                $dataRequest = json_decode($dataRequest);
                if (!isset($dataRequest->key1) || !filter_var($dataRequest->key1, FILTER_VALIDATE_INT)) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Données reçues incorrecte',
                    ]);
                }
                $cityObject = $favoriteCitiesRepository->find($dataRequest->key1);

                if (!$cityObject) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Ville non présente dans vos favoris',
                    ]);
                }
                $activeCity = [
                    'cityName' => $cityObject->getName(),
                    'countryName' => $cityObject->getCountry(),
                    'stateName' => $cityObject->getState(),
                    'latitude' => $cityObject->getLatitude(),
                    'longitude' => $cityObject->getLongitude(),
                    'timezoneName' => $cityObject->getTimezoneName(),
                ];
                return $this->json([
                    'success' => true,
                    'message' => 'getActiveCity successfully',
                    'data' => $activeCity
                ]);
            } catch (\Exception $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Une erreur s\'est produite lors de la suppression de la ville'
                ]);
            }
        }
        return $this->json([
            'success' => false,
            'message' => 'Requête POST invalide',
        ]);



    }
    #[Route('/updateFavorites', name: 'app_updateFavorites')]
    public function updateFavorites(
        Request $request,
        FavoriteCitiesRepository $favoriteCitiesRepository,
        EntityManagerInterface   $entityManager
    ): Response
    {
        if ($request->isMethod('POST')) {
            $user = $this->getUser();
            if ($user === null) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non connecté',
                ]);
            }
            try {
                $dataRequest = $request->getContent();

                $dataRequest = json_decode($dataRequest);
                foreach ($dataRequest->key1 as $dataCity){
                    $cityID = $dataCity->cityID;
                    $citySort = $dataCity->citySort;
                    $cityObject = $favoriteCitiesRepository->find($cityID);
                    //On vérifie si on récupère bien un objet de la base de donnée
                    // et que l'objet de la ville reçu appartient bien à l'utilisateur connecté
                    // et que $citySort est un entier valide
                    if ($cityObject &&
                        $cityObject->getUser()->getId() === $user->getId() &&
                        filter_var($citySort, FILTER_VALIDATE_INT)){
                        // On modifie le "sort"
                        $cityObject->setSort($citySort);
                    } else {
                        return $this->json([
                            'success' => false,
                            'message' => 'Erreur de mise à jour',
                        ]);
                    }
                }
                $entityManager->flush();
                return $this->json([
                    'success' => true,
                    'message' => 'Favorites update completed successfully'
                ]);
            } catch (\Exception $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Une erreur s\'est produite lors de la suppression de la ville'
                ]);
            }
        }
        return $this->json([
            'success' => false,
            'message' => 'Requête POST invalide',
        ]);
    }

}
