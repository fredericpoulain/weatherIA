<?php

namespace App\Service;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class CallAPI
{
    /**
     * @param $params array Paramètre de l'url
     * @param $url string l'url de la requete
     * @return array
     * @throws \GuzzleHttp\Exception\GuzzleException
     */
    public function get(array $params, string $url): array
    {
        $client = new Client();
        // Requête avec la méthode GET et les paramètres
        $response = $client->request("GET", $url, [
            "query" => $params,
            "verify" => '../config/cacert.pem'
        ]);
        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException('Erreur : ' . $response->getStatusCode());
        }
        $result = json_decode($response->getBody());
        return [
            'success' => true,
            'data' => $result
        ];
    }

    /**
     * @throws GuzzleException
     * @throws \JsonException
     * NOTE IMPORTANTE : Dans la méthode get précédente, l’API Here nécessite que la clé API soit passée en tant que paramètre de requête dans l’URL.
     * ... Donc, pas besoin de l’inclure dans les en-têtes de la requête.
     * Par contre, dans la méthode postToOpenAI, l’API OpenAI nécessite que la clé API soit incluse dans les en-têtes de la requête
     * sous la forme d’un jeton d’autorisation (Bearer token). Ainsi, on doit l’inclure dans les en-têtes de la requête.
     */
    public function postToOpenAI(array $data, string $endPoint, string $openaiKey): array
    {
        $client = new Client();
        $response = $client->request("POST", $endPoint, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $openaiKey
            ],
            'body' => json_encode($data, JSON_THROW_ON_ERROR),
            'verify' => '../config/cacert.pem'
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException('Erreur : ' . $response->getStatusCode());
        }

        $result = json_decode($response->getBody(), true, 512, JSON_THROW_ON_ERROR);
        return [
            'success' => true,
            'data' => $result
        ];
    }
}