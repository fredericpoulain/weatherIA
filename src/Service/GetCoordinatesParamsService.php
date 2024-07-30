<?php

namespace App\Service;

class GetCoordinatesParamsService
{
    public function __construct(private readonly string $hereApiKey)
    {
    }

    /**
     * @param string $locationid LocationID
     * @return array
     */
    public function prepareParams(string $locationid): array
    {
        return [
            "locationid" => $locationid,
            'jsonattributes' => 1,
            'gen' => 9,
            "apiKey" => $this->hereApiKey,
            'language' => 'fr'
        ];
    }
}