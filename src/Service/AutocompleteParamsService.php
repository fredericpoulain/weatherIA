<?php

namespace App\Service;

class AutocompleteParamsService
{


    public function __construct(private readonly string $hereApiKey)
    {
    }
    /**
     * @param string $data query
     * @return array
     */
    public function prepareParams(string $data): array
    {
        return [
            "query" => $data,
            "apiKey" => $this->hereApiKey,
            "locationattributes" => "tz",
            "maxresults" => 10,
            'language' => 'fr'
        ];
    }
}