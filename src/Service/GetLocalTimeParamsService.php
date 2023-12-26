<?php

namespace App\Service;

class GetLocalTimeParamsService
{
    public function __construct(private readonly string $bigDataCloudApiKey)
    {
    }

    /**
     * @param $latitude float Latitude
     * @param $longitude float Longitude
     * @return array
     */
    public function prepareParams($latitude, $longitude): array
    {
        return [
            "latitude" => $latitude,
            'longitude' => $longitude,
            'localityLanguage' => 'fr',
            "key" => $this->bigDataCloudApiKey
        ];
    }
}