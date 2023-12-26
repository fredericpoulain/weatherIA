<?php

namespace App\Controller;


use App\Service\CallAPI;
use App\Service\OpenaiParamsService;
use GuzzleHttp\Exception\GuzzleException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ActivitiesWeatherIAController extends AbstractController
{

    #[Route('/activites-a-faire', name: 'app_activities')]
    public function activity(): Response
    {
            return $this->render('activities/activities.html.twig');
    }


    /**
     * @throws GuzzleException
     * @throws \JsonException
     */
    #[Route('/getActivities', name: 'app_getActivities')]
    public function getActivities(
//        string $cityName,
        Request $request,
        OpenaiParamsService $openaiParamsService,
        CallAPI $callAPI
    ): Response
    {
        /**
         * Possibilité d'utiliser la bibliothèque OpenAi-php : https://openai-php.com/#get-started
         * Avantage : code beaucoup plus concis, et évite les appels aux deux services présents dans cette application.
         * J'ai tout de même gardé la même logique en faisant appel aux Services et à la bibliothèque Guzzle.
         */

        if ($request->isMethod('POST')){
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
                $cityName = $data->key1;
                $promptWeather = $data->key2;

                $message = "En ce moment à " . $cityName . " : ". $promptWeather . ". Liste 4 activités parfaitement adaptées aux conditions météorologiques que je peux faire dans cette ville. Le premier caractère de ta réponse doit correspondre à ta premiere suggestion d'activités, exemple : '1. nom de l'activité 1' : détail de l'activité 1...";
                $endPoint = "https://api.openai.com/v1/chat/completions";
                $openaiKey = $this->getParameter('app.openaiKey');
                $data = $openaiParamsService->prepareParams($message);

                $result = $callAPI->postToOpenAI($data, $endPoint, $openaiKey);
                $response = $result['data']['choices'][0]['message']['content'];
                return $this->json([
                    'success' => true,
                    'data' => $response
                ]);
            } catch (\Exception $error) {
                return $this->json([
                    'success' => false,
                    'message' => 'Une erreur s\'est produite lors de la récupération des données'
                ]);
            }
        }

        return $this->redirectToRoute('app_home');
    }
}
