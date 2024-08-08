<?php

namespace App\Controller;


use App\Service\AutocompleteParamsService;
use App\Service\CallAPI;
use App\Service\GetCoordinatesParamsService;
use App\Service\GetLocalTimeParamsService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class HomeWeatherIAController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(SessionInterface $session): Response
    {
        $user = $this->getUser();
        if (!$user) {
            $this->addFlash('infoMessageFlash', "Connectez-vous grâce aux champs préremplis !");
        }



        return $this->render('home/home.html.twig');
    }

    #[Route('/autocompletion', name: 'app_autocompletion')]
    public function autocompletion(
        Request                   $request,
        CallAPI                   $callAPI,
        AutocompleteParamsService $autocompleteParamsService
    ): Response
    {

        if ($request->isMethod('POST')) {
            try {
                $data = $request->getContent();
                $data = json_decode($data);
                $data = $data->key1;

                if (strlen($data) < 3) {
                    throw new \RuntimeException('La longueur des données est inférieure à 3 caractères');
                }
                $url = "https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json";
                $params = $autocompleteParamsService->prepareParams($data);
                $result = $callAPI->get($params, $url);
                return $this->json($result);
            } catch (\RuntimeException $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Erreur: ' . $error->getMessage(),
                    'code' => $error->getCode()
                ]);
            }

        }
        return $this->redirectToRoute('app_home');
    }

    #[Route('/getinfoscity', name: 'app_getinfoscity')]
    public function locationID(
        Request                     $request,
        CallAPI                     $callAPI,
        GetCoordinatesParamsService $getCoordinatesParamsService,
        GetLocalTimeParamsService   $getLocalTimeParamsService): Response
    {
        if ($request->isMethod('POST')) {
            try {
                //Call here API to get the coordinates
                $dataRequest = $request->getContent();
                $dataRequest = json_decode($dataRequest);
                $locationid = $dataRequest->key1;
                $paramsHere = $getCoordinatesParamsService->prepareParams($locationid);
                $urlHere = "https://geocoder.ls.hereapi.com/6.2/geocode.json";
                $datasCity = $callAPI->get($paramsHere, $urlHere);
//                dd($datasCity['data']->response->view[0]->result[0]);
                //Absence de message spécifique : voir commentaires dans le catch
                if (!$datasCity['data']->response->view) {
                    throw new \RuntimeException();
                }

                //Call Big Data Cloud API to get the Local Time using the coordinates
                $latitude = $datasCity['data']->response->view[0]->result[0]->location->displayPosition->latitude;
                $longitude = $datasCity['data']->response->view[0]->result[0]->location->displayPosition->longitude;

                $paramsBDC = $getLocalTimeParamsService->prepareParams($latitude, $longitude);
                $urlBDC = "https://api-bdc.net/data/reverse-geocode-with-timezone";
                $resultBdc = $callAPI->get($paramsBDC, $urlBDC);

                $timezoneName = $resultBdc['data']->timeZone->ianaTimeId;
                $timestampCity = $resultBdc['data']->timeZone->localTime;
                $localitiesNameDatas = $this->getNameLocalities($resultBdc['data']);
                $arrayData = [
                    'cityName' => $localitiesNameDatas['cityName'],
                    'stateName' => $localitiesNameDatas['stateName'],
                    'countryName' => $localitiesNameDatas['countryName'],
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'timezoneName' => $timezoneName,
                    'timestampCity' => $timestampCity,
                ];


                return $this->json([
                    'success' => true,
                    'data' => $arrayData
                ]);
            } catch (\RuntimeException $error) {
                //je n'inclus pas $error->getMessage() :
                //car dans certain cas, mon apiKey serait incluse dans le message.
                return $this->json([
                    'success' => false,
                    'message' => "Une erreur s'est produite lors de l'appel à l'API",
                    'code' => $error->getCode()
                ]);
            }

        }
        return $this->redirectToRoute('app_home');
    }


    #[Route('/localTime', name: 'app_localTime')]
    public function localTime(Request $request, CallAPI $callAPI, GetLocalTimeParamsService $getLocalTimeParamsService): Response
    {
        if ($request->isMethod('POST')) {
            try {

                $dataRequest = $request->getContent();
                $dataRequest = json_decode($dataRequest);

                $latitude = $dataRequest->key1;
                $longitude = $dataRequest->key2;

                $paramsBDC = $getLocalTimeParamsService->prepareParams($latitude, $longitude);
                $urlBDC = "https://api-bdc.net/data/reverse-geocode-with-timezone";
                $resultBdc = $callAPI->get($paramsBDC, $urlBDC);

                $timezoneName = $resultBdc['data']->timeZone->ianaTimeId;
                $timestampCity = $resultBdc['data']->timeZone->localTime;

                $localitiesNameDatas = $this->getNameLocalities($resultBdc['data']);

                $arrayData = [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'timezoneName' => $timezoneName,
                    'timestampCity' => $timestampCity,
                    'cityName' => $localitiesNameDatas['cityName'],
                    'stateName' => $localitiesNameDatas['stateName'],
                    'countryName' => $localitiesNameDatas['countryName']
                ];

                return $this->json([
                    'success' => true,
                    'data' => $arrayData
                ]);
            } catch (\RuntimeException $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Error get coordinates',
                    'code' => $error->getCode()
                ]);
            }

        }
        return $this->redirectToRoute('app_home');
    }

    private function getNameLocalities($data): array
    {

        $cityName = $data->city;
        $stateName = $data->principalSubdivision === $cityName ? null : $data->principalSubdivision;
        $originalStrCountryName = $data->countryName;
        //si le countryName est de type "France (la)", on ne veut pas récupérer '(La)'.
        //str_contains vérifie si $originalStrCountryName contient ’ (‘.
        // Si c’est le cas, strtok est utilisé pour obtenir la partie de $originalStrCountryName avant ’ (’.
        // Sinon, la chaîne d’origine est utilisée
        $countryName = str_contains($originalStrCountryName, ' (') ? stristr($originalStrCountryName, ' (', true) : $originalStrCountryName;

        return compact('cityName', 'stateName', 'countryName');
    }

}
